# OneDrive CSV URLs - Direct Download Links

## Converted SharePoint Links to Direct Download URLs

Replace the query parameters to get direct download links:

### Original SharePoint Links:
- Projects: `https://perkinseastman-my.sharepoint.com/:x:/r/personal/g_dsouza_perkinseastman_com/Documents/Temp/api_test/Data/projects.csv?d=wa3fd724a8df34379915db6e130eb05c1&csf=1&web=1&e=KulVXM`
- Project Employees: `https://perkinseastman-my.sharepoint.com/:x:/r/personal/g_dsouza_perkinseastman_com/Documents/Temp/api_test/Data/project_employees.csv?d=w445e234a6c3b4b89bfd3da82934e24c8&csf=1&web=1&e=gPjIHY`
- Employees: `https://perkinseastman-my.sharepoint.com/:x:/r/personal/g_dsouza_perkinseastman_com/Documents/Temp/api_test/Data/employees.csv?d=w131f05ccf5984102b76a3313363507d8&csf=1&web=1&e=ibehKJ`

### Direct Download URLs (for environment variables):

Change `web=1` to `download=1`:

```
ONEDRIVE_PROJECTS_URL=https://perkinseastman-my.sharepoint.com/:x:/r/personal/g_dsouza_perkinseastman_com/Documents/Temp/api_test/Data/projects.csv?d=wa3fd724a8df34379915db6e130eb05c1&download=1

ONEDRIVE_PROJECT_EMPLOYEES_URL=https://perkinseastman-my.sharepoint.com/:x:/r/personal/g_dsouza_perkinseastman_com/Documents/Temp/api_test/Data/project_employees.csv?d=w445e234a6c3b4b89bfd3da82934e24c8&download=1

ONEDRIVE_EMPLOYEES_URL=https://perkinseastman-my.sharepoint.com/:x:/r/personal/g_dsouza_perkinseastman_com/Documents/Temp/api_test/Data/employees.csv?d=w131f05ccf5984102b76a3313363507d8&download=1
```

## How to Use

1. Copy the direct download URLs above
2. Add them as environment variables in your deployment platform (Vercel/Azure)
3. The app will automatically download CSV files from OneDrive on startup

## Alternative: Get Fresh Links

If links expire, get new ones:
1. Open file in OneDrive web
2. Click "..." → "Download"
3. Copy the download URL from browser network tab
4. Or use SharePoint API for authenticated access

