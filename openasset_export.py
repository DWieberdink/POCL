import os
import csv
import time
import json
import argparse
from pathlib import Path
from typing import Dict, Iterable, List, Set, Any, Optional, Tuple

import requests
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry

# ========= CONFIG =========
BASE_URL = "https://perkinseastman.openasset.com/REST/1"
PAGE_SIZE_DEFAULT = 200
TIMEOUT = (5, 30)
RETRY_CFG = dict(
    total=5, backoff_factor=0.6,
    status_forcelist=[429, 500, 502, 503, 504],
    allowed_methods=["GET"]
)

# ========= HTTP session =========
def make_session(token: str) -> requests.Session:
    if not token:
        raise SystemExit(
            "Set OPENASSET_TOKEN first.\n"
            "PowerShell (this terminal):  $env:OPENASSET_TOKEN = \"285:YOURTOKEN\""
        )
    s = requests.Session()
    s.headers.update({"Authorization": f"OATU {token}"})
    adapter = HTTPAdapter(
        max_retries=Retry(**RETRY_CFG), pool_connections=20, pool_maxsize=20
    )
    s.mount("https://", adapter)
    s.mount("http://", adapter)
    return s

# ========= Helpers =========
def get_paginated(session: requests.Session, endpoint: str, page_size: int) -> Iterable[Dict]:
    offset = 0
    while True:
        params = {"limit": page_size, "offset": offset}
        r = session.get(f"{BASE_URL}/{endpoint}", params=params, timeout=TIMEOUT)
        r.raise_for_status()
        data = r.json() or []
        if not data:
            break
        for row in data:
            yield row
        if len(data) < page_size:
            break
        offset += page_size
        time.sleep(0.05)

def flatten(obj: Any, prefix: str = "", sep: str = ".") -> Dict[str, Any]:
    out: Dict[str, Any] = {}
    if isinstance(obj, dict):
        for k, v in obj.items():
            key = f"{prefix}{sep}{k}" if prefix else k
            out.update(flatten(v, key, sep))
    elif isinstance(obj, list):
        for i, v in enumerate(obj):
            key = f"{prefix}[{i}]"
            out.update(flatten(v, key, sep))
    else:
        out[prefix] = obj
    return out

def underscore(s: str) -> str:
    return "".join(ch.lower() if ch.isalnum() else "_" for ch in (s or "")).strip("_")

def unique_headers(rows: List[Dict[str, Any]]) -> List[str]:
    seen: List[str] = []
    have = set()
    for r in rows:
        for k in r.keys():
            if k not in have:
                have.add(k)
                seen.append(k)
    return seen

def write_csv(path: Path, rows: List[Dict[str, Any]], header: List[str]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=header, extrasaction="ignore")
        w.writeheader()
        for r in rows:
            for h in header:
                if h not in r:
                    r[h] = ""
            w.writerow(r)

# ========= API wrappers =========
def fetch_projects_list(session: requests.Session, page_size: int) -> List[Dict]:
    return [p for p in get_paginated(session, "Projects", page_size)]

def fetch_project_detail(session: requests.Session, project_id: int) -> Dict[str, Any]:
    r = session.get(f"{BASE_URL}/Projects/{project_id}", timeout=TIMEOUT)
    r.raise_for_status()
    return r.json() or {}

def fetch_project_fields_raw_variants(session: requests.Session, project_id: int) -> Optional[List[Dict]]:
    """
    Try variants that returned 'values' + 'id' in your discovery.
    We need a list of dicts containing at least 'id' and ('value' or 'values' or 'rows').
    """
    variants = [
        (f"{BASE_URL}/Projects/{project_id}/Fields", None),
        (f"{BASE_URL}/Projects/{project_id}/Fields", {"includeValues": "1"}),
        (f"{BASE_URL}/Projects/{project_id}/Fields", {"withValues": "1"}),
        (f"{BASE_URL}/Fields", {"projectId": str(project_id)}),
        (f"{BASE_URL}/Fields", {"project_id": str(project_id)}),
    ]
    for url, params in variants:
        try:
            r = session.get(url, params=params or {}, timeout=TIMEOUT)
            if r.status_code == 404:
                continue
            r.raise_for_status()
            data = r.json()
            if isinstance(data, list) and data:
                # Accept if entries have 'id' and one of value containers
                useful = [d for d in data if isinstance(d, dict) and "id" in d]
                if useful:
                    return useful
        except requests.RequestException:
            continue
    return None

def fetch_fields_catalog(session: requests.Session) -> Dict[int, str]:
    """
    Fetch global field definitions (ID -> Name). Try a few common endpoints.
    We accept any list of dicts with 'id' and 'name'.
    """
    attempts = [
        (f"{BASE_URL}/Fields", {"limit": 1000}),         # sometimes returns definitions
        (f"{BASE_URL}/FieldDefinitions", {"limit": 1000}),
        (f"{BASE_URL}/Fields/Definitions", {"limit": 1000}),
        (f"{BASE_URL}/Fields", None),                    # plain
    ]
    for url, params in attempts:
        try:
            r = session.get(url, params=params or {}, timeout=TIMEOUT)
            if r.status_code == 404:
                continue
            r.raise_for_status()
            data = r.json()
            if not isinstance(data, list):
                continue
            cat: Dict[int, str] = {}
            for row in data:
                if isinstance(row, dict) and "id" in row and "name" in row:
                    cat[int(row["id"])] = str(row["name"])
            if cat:
                return cat
        except requests.RequestException:
            continue
    # Fallback: no catalog found
    return {}

def normalize_field_value(item: Dict[str, Any]) -> str:
    """
    Each item may have:
      - 'value': scalar string/number
      - 'values': list of strings (join with '; ')
      - a small 'table' object: {'rows':[...], 'total':..., 'limit':..., 'offset':...}
        -> store rows as compact JSON string
    """
    if "value" in item and item["value"] not in (None, ""):
        return str(item["value"])
    if "values" in item and isinstance(item["values"], list):
        return "; ".join([str(v) for v in item["values"] if v not in (None, "")])
    # some items embed a small table (your sample had 'rows', 'offset', 'total', 'limit'):
    table_keys = {"rows", "total", "limit", "offset"}
    if any(k in item for k in table_keys):
        # keep only the table-relevant keys
        tbl = {k: item[k] for k in item.keys() if k in table_keys}
        return json.dumps(tbl, ensure_ascii=False)
    return ""

def fields_id_value_map(session: requests.Session, project_id: int) -> Dict[str, str]:
    """
    Return a dict of {'field.<name_normalized>': 'value'} for one project,
    using a global catalog (id->name) if available; otherwise fallback to 'field.id_<id>'.
    """
    raw = fetch_project_fields_raw_variants(session, project_id)
    if not raw:
        return {}
    # Try to build or fetch a global catalog
    name_by_id = fetch_fields_catalog(session)

    out: Dict[str, str] = {}
    for item in raw:
        fid = item.get("id")
        if fid is None:
            continue
        try:
            fid_int = int(fid)
        except Exception:
            fid_int = None

        field_name = None
        if fid_int is not None and fid_int in name_by_id:
            field_name = underscore(name_by_id[fid_int])
        elif "name" in item and item["name"]:  # in case this variant carries name
            field_name = underscore(str(item["name"]))
        else:
            field_name = f"id_{fid}"  # fallback

        val = normalize_field_value(item)
        out[f"field.{field_name}"] = val
    return out

def fetch_project_employee_ids(session: requests.Session, project_id: int, page_size: int) -> List[int]:
    ids: List[int] = []
    for e in get_paginated(session, f"Projects/{project_id}/Employees", page_size):
        if isinstance(e, dict) and "id" in e:
            ids.append(e["id"])
    return ids

def fetch_employee(session: requests.Session, emp_id: int) -> Dict[str, Any]:
    r = session.get(f"{BASE_URL}/Employees/{emp_id}",
                    params={"withHeroImage": 0, "files": 0},
                    timeout=TIMEOUT)
    r.raise_for_status()
    return r.json() or {}

# ========= extraction of friendly columns =========
# ========= extraction of friendly columns =========
ALIASES = {
    "practice_area": {"practice area", "practice_area", "practice", "market_sector", "market sector"},
    "sub_practice_areas": {"sub practice area", "sub_practice_areas"},
    "region": {"Region", "geographic_region", "geographic region", "office_region", "office region"},
}

def extract_friendly_columns(src: Dict[str, Any]) -> Dict[str, Any]:
    out = {"practice_area": "", "sub_practice_areas": "", "region": ""}
    for k, v in src.items():
        if not k.startswith("field."):
            continue
        base = k[len("field."):].replace("_", " ").lower()
        if not out["practice_area"] and any(a in base for a in ALIASES["practice_area"]):
            out["practice_area"] = v
        if not out["sub_practice_areas"] and any(a in base for a in ALIASES["sub_practice_areas"]):
            out["sub_practice_areas"] = v
        if not out["region"] and any(a in base for a in ALIASES["region"]):
            out["region"] = v
    return out


# ========= Main =========
def main():
    parser = argparse.ArgumentParser(description="Export Projects (detail + Fields ID->Name) + Employees")
    parser.add_argument("--test", type=int, default=10,
                        help="Limit number of projects to link to employees (0 = ALL). Default 10.")
    parser.add_argument("--outdir", type=str, default=".",
                        help="Directory for CSV outputs")
    parser.add_argument("--page-size", type=int, default=PAGE_SIZE_DEFAULT,
                        help=f"Page size for pagination (default: {PAGE_SIZE_DEFAULT})")
    parser.add_argument("--dump", action="store_true",
                        help="Dump raw sample JSONs for debugging")
    args = parser.parse_args()

    token = os.getenv("OPENASSET_TOKEN", "")
    session = make_session(token)

    outdir = Path(args.outdir)
    out_projects = outdir / "projects.csv"
    out_employees = outdir / "employees.csv"
    out_bridge = outdir / "project_employees.csv"

    print("== OpenAsset Export ==")
    print(f"- Outdir    : {outdir.resolve()}")
    print(f"- Page size : {args.page_size}")
    print(f"- Test limit: {args.test if args.test else 'ALL'}\n")

    # 1) Project LIST
    print("Fetching project LIST...")
    t0 = time.time()
    projects_list = fetch_projects_list(session, args.page_size)
    print(f"Got {len(projects_list)} projects in {time.time()-t0:0.1f}s.")

    # 2) Enrich subset with DETAIL + FIELDS(ID->NAME)
    print("Fetching project DETAIL + FIELDS for subset...")
    cutoff = args.test if args.test and args.test > 0 else len(projects_list)
    enriched_rows: List[Dict[str, Any]] = []

    for i, p in enumerate(projects_list[:cutoff], start=1):
        pid = p.get("id")
        if pid is None:
            continue
        try:
            detail = fetch_project_detail(session, pid)   # base 14 fields
        except requests.RequestException as ex:
            print(f"  ⚠️  Project {pid} detail error: {ex}")
            detail = {}

        try:
            fields_named = fields_id_value_map(session, pid)
        except requests.RequestException as ex:
            print(f"  ⚠️  Project {pid} fields error: {ex}")
            fields_named = {}

        merged = {}
        merged.update(p)             # list fields
        merged.update(detail)        # detail fields
        merged.update(fields_named)  # field.<normalized name> = value
        merged.update(extract_friendly_columns(merged))  # practice_area, region

        enriched_rows.append(merged)

        if i % 10 == 0:
            print(f"  Enriched {i}/{cutoff} projects...")
        if i % 50 == 0:
            time.sleep(0.2)

    # 3) Flatten for CSV + build header (bring key cols to front)
    flat_projects = [flatten(x) for x in enriched_rows]
    proj_header = unique_headers(flat_projects)
    front = [c for c in ["id", "code", "name", "practice_area","sub_practice_area","region"] if c in proj_header]
    for c in front:
        proj_header.remove(c)
    proj_header = front + proj_header

    if args.dump and enriched_rows:
        sample_id = enriched_rows[0]["id"]
        with (outdir / "sample_project_detail.json").open("w", encoding="utf-8") as f:
            json.dump(fetch_project_detail(session, sample_id), f, indent=2)

    # 4) Build bridge (ProjectID ↔ EmployeeID)
    print("Building project-employee links...")
    bridge_rows: List[Dict[str, Any]] = []
    emp_ids: Set[int] = set()
    for i, p in enumerate(projects_list[:cutoff], start=1):
        pid = p.get("id")
        if pid is None:
            continue
        try:
            ids = fetch_project_employee_ids(session, pid, args.page_size)
        except requests.RequestException as ex:
            print(f"  ⚠️  Project {pid} employees error: {ex}")
            ids = []
        for eid in ids:
            bridge_rows.append({"ProjectID": pid, "EmployeeID": eid})
            emp_ids.add(eid)
        if i % 10 == 0:
            print(f"  Linked {i}/{cutoff} projects... (unique employees so far: {len(emp_ids)})")
        if i % 50 == 0:
            time.sleep(0.2)

    # 5) Employees (details)
    print("Fetching employee details...")
    employees: List[Dict[str, Any]] = []
    for j, eid in enumerate(sorted(emp_ids), start=1):
        try:
            e = fetch_employee(session, eid)
        except requests.RequestException as ex:
            print(f"  ⚠️  Employee {eid}: {ex}")
            e = {"id": eid}
        employees.append(e)
        if j % 100 == 0 or j == len(emp_ids):
            print(f"  Fetched {j}/{len(emp_ids)} employees...")
            time.sleep(0.1)

    flat_employees = [flatten(e) for e in employees]
    for r in flat_employees:
        if "id" in r and "EmployeeID" not in r:
            r["EmployeeID"] = r["id"]
    emp_header = unique_headers(flat_employees)
    if "EmployeeID" not in emp_header:
        emp_header = ["EmployeeID"] + [h for h in emp_header if h != "EmployeeID"]

    # 6) Write CSVs
    print("Writing CSVs...")
    outdir.mkdir(parents=True, exist_ok=True)
    write_csv(out_projects, flat_projects, proj_header)
    write_csv(out_employees, flat_employees, emp_header)
    write_csv(out_bridge, bridge_rows, ["ProjectID", "EmployeeID"])

    print("Done:")
    print(f" - {out_projects}")
    print(f" - {out_employees}")
    print(f" - {out_bridge}")
    print("Tip: if practice_area/region are still blank, open the CSV and look for field.* columns to see actual names to alias.")
    
if __name__ == "__main__":
    main()
