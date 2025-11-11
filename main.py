import requests

# ---- Configuration ----
BASE_URL = "https://perkinseastman.openasset.com/REST/1"
HEADERS = {
    "Authorization": "OATU 285:FW6i8XC9LtPoFPnjS0n6ivcBHd6QOazRDhu9AmtAHI4"
}

# ---- Step 1: Filter Projects by Practice Area and Region ----
practice_area = "Healthcare"
region = "East"

project_filter = {
    "filterBy[-and][0][practice_area]": f"*{practice_area}*",
    "filterBy[-and][1][region]": f"*{region}*",
    "limit": 5
}

proj_resp = requests.get(f"{BASE_URL}/Projects", headers=HEADERS, params=project_filter)

if not proj_resp.ok:
    print("❌ Failed to fetch projects:", proj_resp.status_code)
    print(proj_resp.text)
    exit()

projects = proj_resp.json()

if not projects:
    print("❌ No projects matched the filters.")
    exit()

print(f"✅ Found {len(projects)} matching projects\n")

# ---- Step 2: Loop through Projects and Get Employees ----
for project in projects:
    project_id = project["id"]
    project_name = project.get("name", "[No Name]")
    print(f"\n📁 Project: {project_name} (ID: {project_id})")

    roles_url = f"{BASE_URL}/Projects/{project_id}/Employees"
    roles_resp = requests.get(roles_url, headers=HEADERS)

    if not roles_resp.ok:
        print("   ❌ Failed to fetch employees:", roles_resp.status_code)
        continue

    employees = roles_resp.json()

    if not employees:
        print("   ⚠️ No employees linked to this project.")
    else:
        print(f"   👥 {len(employees)} employee(s) linked:")
        for emp in employees:
            emp_id = emp["id"]
            
            # ---- Step 3: Lookup Employee Details ----
            emp_detail_resp = requests.get(f"{BASE_URL}/Employees/{emp_id}", headers=HEADERS)
            if emp_detail_resp.ok:
                emp_detail = emp_detail_resp.json()
                first_name = emp_detail.get("first_name", "N/A")
                last_name = emp_detail.get("last_name","N/A")
                job_title = emp_detail.get("job_title","N/A")
                email = emp_detail.get("email", "N/A")
                phone = emp_detail.get("work_phone","N/A")
                title = emp_detail.get("title", "N/A")
                office = emp_detail.get("office", "N/A")
                studio_office = emp_detail.get("studio_office","N/A")
                print(f"     🔹 {first_name} (ID: {emp_id})")
                print(f"        ✉️ Last Name: {last_name}")
                print(f"        ✉️ Job: {job_title}")
                print(f"        ✉️ Email: {email}")
                print(f"        💼 Title: {title}")
                print(f"        🏢 Office: {studio_office}")
            else:
                print(f"     ⚠️ Failed to fetch details for employee ID {emp_id}")

            # ---- Display Role Info ----
            roles = emp.get("roles", {}).get(str(project_id), [])
            for i, role in enumerate(roles, 1):
                print(f"        🛠️ Role {i}:")
                for k, v in role.items():
                    print(f"           {k}: {v}")
