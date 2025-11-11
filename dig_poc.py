import re
import unicodedata
import requests
from urllib.parse import urlsplit, urlunsplit
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry
from concurrent.futures import ThreadPoolExecutor, as_completed

# ---- Configuration ----
BASE_URL = "https://perkinseastman.openasset.com/REST/1"
HEADERS = {"Authorization": "OATU 285:FW6i8XC9LtPoFPnjS0n6ivcBHd6QOazRDhu9AmtAHI4"}
DEFAULT_SIZE_ID = "1"      # change to a web JPEG/PNG size_id if originals 403/AccessDenied
FETCH_IMAGES = True        # set False for even faster runs
MAX_WORKERS = 12
TIMEOUT = (5, 20)          # (connect, read) seconds

# ---- Session with keep-alive + retries ----
session = requests.Session()
session.headers.update(HEADERS)
retry = Retry(total=3, backoff_factor=0.3, status_forcelist=[429, 500, 502, 503, 504])
adapter = HTTPAdapter(max_retries=retry, pool_connections=MAX_WORKERS, pool_maxsize=MAX_WORKERS)
session.mount("https://", adapter)
session.mount("http://", adapter)

# ---- Strong whitespace/encoding sanitizers ----
# Percent-encoded whitespace variants (space, tab, CR, LF, NBSP)
_PCT_WS = re.compile(r"(?i)(%20|%09|%0A|%0D|%C2%A0)+")

def _is_ws_like(ch: str) -> bool:
    """True for any char that should be treated as whitespace/invisible for URLs."""
    if not ch:
        return False
    # Python's isspace plus Unicode separators and format controls catch oddballs
    cat = unicodedata.category(ch)
    return ch.isspace() or cat in ("Zs", "Zl", "Zp", "Cf", "Cc")

def _clean_ws_like(s: str) -> str:
    """Remove all whitespace/invisible characters from a string."""
    if s is None:
        return ""
    s = unicodedata.normalize("NFKC", s)
    return "".join(ch for ch in s if not _is_ws_like(ch))

def _sanitize_url(url: str) -> str:
    """Normalize & remove whitespace (literal, unicode, and %XX) in all URL parts and path segments."""
    if not url:
        return url
    s = unicodedata.normalize("NFKC", url)
    s = _PCT_WS.sub("", s)  # drop %20, %C2%A0, etc.

    parts = urlsplit(s)
    scheme = _clean_ws_like(parts.scheme) or "https"
    netloc = _clean_ws_like(parts.netloc)

    # Clean each path segment individually
    segs = parts.path.split("/")
    segs = [_clean_ws_like(seg) for seg in segs]
    path = "/".join(segs)

    # Guard against whitespace around dots in filenames (e.g., "N892 .tif", "N103 0.tif")
    path = re.sub(r"\s+(?=\.)", "", path)   # remove space(s) right before a dot
    path = re.sub(r"(?<=\.)\s+", "", path)  # remove space(s) right after a dot
    path = re.sub(r"\s+", "", path)         # any leftover spaces, just in case

    query = _clean_ws_like(parts.query)
    fragment = _clean_ws_like(parts.fragment)

    sanitized = urlunsplit((scheme, netloc, path, query, fragment))
    # Absolute final pass (paranoid but cheap)
    return "".join(ch for ch in sanitized if not _is_ws_like(ch))

# ---- Image helpers ----
def _build_openasset_url(size_obj: dict):
    root_raw = (size_obj.get("http_root") or "")
    rel_raw  = (size_obj.get("http_relative_path") or "")

    # Clean parts aggressively
    root = _clean_ws_like(root_raw)
    rel  = _clean_ws_like(rel_raw)

    if not root or not rel:
        return None

    # Normalize root to full https URL
    if root.startswith("//"):
        base = "https:" + root
    elif root.startswith(("http://", "https://")):
        base = root
    else:
        base = "https://" + root.lstrip("/")

    # Join and sanitize
    final_url = base.rstrip("/") + "/" + rel.lstrip("/")
    return _sanitize_url(final_url)

def _file_url_from_size(file_id, size_id: str = DEFAULT_SIZE_ID):
    try:
        r = session.get(f"{BASE_URL}/Files/{file_id}", params={"sizes": size_id}, timeout=TIMEOUT)
        if not r.ok:
            return None
        sizes = r.json().get("sizes") or []
        if not sizes:
            return None
        return _sanitize_url(_build_openasset_url(sizes[0]))
    except Exception:
        return None

# ---- Fetch employees for a project (used to build unique set) ----
def get_project_employees(project_id):
    try:
        r = session.get(f"{BASE_URL}/Projects/{project_id}/Employees", timeout=TIMEOUT)
        if not r.ok:
            return []
        return r.json() or []
    except Exception:
        return []

# ---- Fetch a single employee (details + image) in ONE pass ----
def fetch_employee(emp_id):
    try:
        er = session.get(
            f"{BASE_URL}/Employees/{emp_id}",
            params={"withHeroImage": 1, "files": 1},
            timeout=TIMEOUT
        )
        if not er.ok:
            return None
        ej = er.json()
    except Exception:
        return None

    first_name = ej.get("first_name", "N/A")
    last_name = ej.get("last_name", "N/A")
    job_title = ej.get("job_title", "N/A")
    email = ej.get("email", "N/A")
    phone = ej.get("work_phone", "N/A")
    title = ej.get("title", "N/A")
    office = ej.get("studio_office") or ej.get("office", "N/A")

    img_url = ""
    img_src = ""
    if FETCH_IMAGES:
        fid = ej.get("hero_image_id")
        src = "hero"
        if not fid:
            for f in (ej.get("files") or []):
                fid = f.get("id")
                if fid:
                    src = "file"
                    break
        if fid:
            url = _file_url_from_size(fid, DEFAULT_SIZE_ID)
            if url:
                img_url = _sanitize_url(url)
                img_src = "Hero image" if src == "hero" else "File image"

    return {
        "id": emp_id,
        "first_name": first_name,
        "last_name": last_name,
        "email": email,
        "title": title,
        "job_title": job_title,
        "office": office if office != "N/A" else "",
        "phone": phone if phone and phone != "N/A" else "",
        "img_url": img_url,
        "img_src": img_src
    }

def main():
    # ---- Step 1: Filter Projects ----
    practice_area = "Healthcare"
    region = "East"
    service_type = "Architecture"
    project_filter = {
        "filterBy[-and][0][practice_area]": f"*{practice_area}*",
        "filterBy[-and][1][region]": f"*{region}*",
        "filterBy[-and][2][service_type]": f"*{service_type}*",
        "limit": 5
    }
    proj_resp = session.get(f"{BASE_URL}/Projects", params=project_filter, timeout=TIMEOUT)
    if not proj_resp.ok:
        print("❌ Failed to fetch projects:", proj_resp.status_code)
        print(proj_resp.text)
        return
    projects = proj_resp.json() or []
    if not projects:
        print("❌ No projects matched the filters.")
        return

    # ---- Step 2: Collect unique employee IDs ----
    unique_emp_ids = set()
    with ThreadPoolExecutor(max_workers=min(MAX_WORKERS, len(projects) or 1)) as ex:
        futures = {ex.submit(get_project_employees, p["id"]): p["id"] for p in projects}
        for fut in as_completed(futures):
            for emp in fut.result():
                if emp and "id" in emp:
                    unique_emp_ids.add(emp["id"])

    print(f"✅ Found {len(unique_emp_ids)} unique employee(s) across {len(projects)} project(s)\n")

    # ---- Step 3: Fetch all employees in parallel ----
    results = []
    with ThreadPoolExecutor(max_workers=MAX_WORKERS) as ex:
        futures = {ex.submit(fetch_employee, emp_id): emp_id for emp_id in unique_emp_ids}
        for fut in as_completed(futures):
            data = fut.result()
            if data:
                results.append(data)

    # ---- Sort and print ----
    results.sort(key=lambda r: ((r["last_name"] or "").lower(), (r["first_name"] or "").lower()))
    for r in results:
        print(f"🔹 {r['first_name']} {r['last_name']} (ID: {r['id']})")
        print(f"   ✉️ Email: {_clean_ws_like(r['email']) if r['email'] else ''}")
        print(f"   💼 Title: {r['title']} | {r['job_title']}")
        if r["office"]:
            print(f"   🏢 Office: {r['office']}")
        if r["phone"]:
            print(f"   ☎️ Phone: {_clean_ws_like(r['phone'])}")
        if r["img_url"]:
            # Absolute final guard on print
            clean_url = _sanitize_url(r["img_url"]).replace(" ", "")
            print(f"   🖼️ {r['img_src']}:{clean_url}")
            # DEBUG (optional): show code points if anything still looks spaced
            print([hex(ord(c)) for c in r["img_url"][-20:]])

        print()

if __name__ == "__main__":
    main()
