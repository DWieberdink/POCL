from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import requests
import concurrent.futures

app = FastAPI()

# Allow your Next.js frontend to call this API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For dev only! Lock down in production.
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---- Configuration ----
BASE_URL = "https://perkinseastman.openasset.com/REST/1"
HEADERS = {
    "Authorization": "OATU 285:FW6i8XC9LtPoFPnjS0n6ivcBHd6QOazRDhu9AmtAHI4"
}

def fetch_employees_for_project(project):
    project_id = project["id"]
    project_name = project.get("name", "[No Name]")
    project_description = project.get("description", "")
    roles_url = f"{BASE_URL}/Projects/{project_id}/Employees"
    roles_resp = requests.get(roles_url, headers=HEADERS)
    if not roles_resp.ok:
        return []
    employees = roles_resp.json()
    for emp in employees:
        emp["project_id"] = project_id
        emp["project_name"] = project_name
        emp["project_description"] = project_description
    return employees

@app.get("/employees")
def get_employees(practice_area: str = "Healthcare", region: str = "East"):
    project_filter = {
        "filterBy[-and][0][practice_area]": f"*{practice_area}*",
        "filterBy[-and][1][region]": f"*{region}*",
        "limit": 100
    }
    proj_resp = requests.get(f"{BASE_URL}/Projects", headers=HEADERS, params=project_filter)
    if not proj_resp.ok:
        return {"error": "Failed to fetch projects"}
    projects = proj_resp.json()
    all_employees = []
    with concurrent.futures.ThreadPoolExecutor() as executor:
        results = executor.map(fetch_employees_for_project, projects)
        for employees in results:
            all_employees.extend(employees)
    return all_employees
