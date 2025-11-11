import os, json, time
from pathlib import Path
import requests
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry

BASE_URL = "https://perkinseastman.openasset.com/REST/1"
TIMEOUT = (5, 30)
RETRY_CFG = dict(total=4, backoff_factor=0.5,
                 status_forcelist=[429,500,502,503,504],
                 allowed_methods=["GET"])

OUTDIR = Path("C:/OpenAssetData").resolve()

def sess():
    tok = os.getenv("OPENASSET_TOKEN")
    if not tok:
        raise SystemExit("Set OPENASSET_TOKEN first.")
    s = requests.Session()
    s.headers.update({"Authorization": f"OATU {tok}"})
    ad = HTTPAdapter(max_retries=Retry(**RETRY_CFG))
    s.mount("https://", ad); s.mount("http://", ad)
    return s

def save(name, obj):
    OUTDIR.mkdir(parents=True, exist_ok=True)
    p = OUTDIR / name
    with p.open("w", encoding="utf-8") as f:
        json.dump(obj, f, indent=2)
    return p

def try_get(s, url, params=None, label=None):
    try:
        r = s.get(url, params=params or {}, timeout=TIMEOUT)
        code = r.status_code
        if code == 404:
            return label or url, code, None
        r.raise_for_status()
        data = r.json()
        return (label or url), code, data
    except requests.RequestException as ex:
        return (label or url), getattr(ex.response, "status_code", "ERR"), {"_error": str(ex)}

def main():
    s = sess()

    # 1) Get first page of Projects to pick a sample ID
    label, code, data = try_get(s, f"{BASE_URL}/Projects", {"limit": 1, "offset": 0}, "Projects(list)")
    if not isinstance(data, list) or not data:
        print("Could not fetch project list."); return
    first = data[0]
    pid = first.get("id")
    print(f"Sample ProjectID: {pid}")
    save("discover_projects_list.json", data)

    tests = [
        (f"{BASE_URL}/Projects/{pid}", None, "Project detail"),
        (f"{BASE_URL}/Projects/{pid}", {"withAttributes": 1}, "Project detail?withAttributes=1"),
        (f"{BASE_URL}/Projects/{pid}", {"with": "attributes,keywords"}, "Project detail?with=attributes,keywords"),
        (f"{BASE_URL}/Projects/{pid}/Attributes", None, "Attributes"),
        (f"{BASE_URL}/Projects/{pid}/Keywords", None, "Keywords"),
        # extra guesses some tenants use:
        (f"{BASE_URL}/Projects/{pid}/Fields", None, "Fields"),
        (f"{BASE_URL}/Projects/{pid}/FieldValues", None, "FieldValues"),
        (f"{BASE_URL}/Projects/{pid}/Categories", None, "Categories"),
    ]

    summary = []
    for url, params, label_ in tests:
        lab, st, dat = try_get(s, url, params=params, label=label_)
        count = (len(dat) if isinstance(dat, list) else (len(dat.keys()) if isinstance(dat, dict) else 0)) if dat else 0
        summary.append({"endpoint": lab, "status": st, "items_or_keys": count})
        # save each payload
        fname = f"discover_{lab.replace(' ','_').replace('?','_').replace('=','_').replace(',','_')}.json"
        save(fname, dat if dat is not None else {"_note":"no data"})

    print("\n=== Discovery summary ===")
    for row in summary:
        print(f"{row['endpoint']:<35}  status={row['status']}  count={row['items_or_keys']}")

if __name__ == "__main__":
    main()
