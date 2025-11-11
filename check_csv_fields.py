import csv

with open('Data/employees.csv', 'r', encoding='utf-8') as f:
    reader = csv.DictReader(f)
    headers = reader.fieldnames
    
    fields_to_check = [
        'last_name', 'title', 'job_title', 'email', 'work_phone', 
        'studio_office', 'office', 'id', 'EmployeeID', 
        'total_years_in_industry', 'current_years_with_this_firm', 'status'
    ]
    
    print('Checking required fields:')
    print('=' * 50)
    for field in fields_to_check:
        status = "FOUND" if field in headers else "NOT FOUND"
        print(f'{field:30} {status}')
    
    print('\n' + '=' * 50)
    print(f'Total columns in CSV: {len(headers)}')
    
    # Get first row to see actual data
    f.seek(0)
    next(reader)  # Skip header
    first_row = next(reader)
    
    print('\nSample data from first employee:')
    print('=' * 50)
    for field in fields_to_check:
        if field in headers:
            value = first_row.get(field, '')
            print(f'{field:30} = {str(value)[:50]}')

