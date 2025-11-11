import requests

# ---- Configuration ----
BASE_URL = "https://perkinseastman.openasset.com/REST/1"
HEADERS = {
    "Authorization": "OATU 285:FW6i8XC9LtPoFPnjS0n6ivcBHd6QOazRDhu9AmtAHI4"
}

# ---- Step 1: Get First 5 Employees ----
resp = requests.get(f"{BASE_URL}/Employees?limit=5", headers=HEADERS)

if not resp.ok:
    print("❌ Failed to fetch employees:", resp.status_code)
    print(resp.text)
    exit()

employees = resp.json()

print(f"\n✅ Found {len(employees)} employees\n")

# ---- Step 2: Display Employee Details ----
for emp in employees:
    emp_id = emp.get("id")
    print(f"🔹 Employee ID: {emp_id}")

    # Fetch detailed info for this employee
    detail_resp = requests.get(f"{BASE_URL}/Employees/{emp_id}", headers=HEADERS)
    if not detail_resp.ok:
        print("   ⚠️ Failed to fetch employee details.")
        continue

    details = detail_resp.json()
    for key, value in details.items():
        print(f"   {key}: {value}")
    print("-" * 40)
