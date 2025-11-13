# Quick Guide: Setting Environment Variables in Vercel

## Where to Set Environment Variables

**Location:** Vercel Dashboard → Your Project → Settings → Environment Variables

## Step-by-Step Instructions

### 1. Go to Vercel Dashboard
- Visit: https://vercel.com
- Sign in with your GitHub account

### 2. Select Your Project
- Click on your project name (e.g., `POCL`)

### 3. Open Settings
- Click the **Settings** tab (gear icon) in the top navigation

### 4. Go to Environment Variables
- In the left sidebar, click **Environment Variables**

### 5. Add Each Variable

For each variable, click **"Add New"** button and fill in:

#### Variable 1: Employees CSV URL
- **Key:** `NEXT_PUBLIC_ONEDRIVE_EMPLOYEES_URL`
- **Value:** Your SharePoint employees.csv URL (e.g., `https://perkinseastman-my.sharepoint.com/.../employees.csv?download=1`)
- **Environment:** Check all three: ☑️ Production ☑️ Preview ☑️ Development
- Click **Save**

#### Variable 2: Projects CSV URL
- **Key:** `NEXT_PUBLIC_ONEDRIVE_PROJECTS_URL`
- **Value:** Your SharePoint projects.csv URL
- **Environment:** Check all three: ☑️ Production ☑️ Preview ☑️ Development
- Click **Save**

#### Variable 3: Project Employees CSV URL
- **Key:** `NEXT_PUBLIC_ONEDRIVE_PROJECT_EMPLOYEES_URL`
- **Value:** Your SharePoint project_employees.csv URL
- **Environment:** Check all three: ☑️ Production ☑️ Preview ☑️ Development
- Click **Save**

#### Optional: OpenAsset Base URL
- **Key:** `NEXT_PUBLIC_OPENASSET_BASE_URL`
- **Value:** `https://perkinseastman.openasset.com`
- **Environment:** Check all three: ☑️ Production ☑️ Preview ☑️ Development
- Click **Save**

### 6. Redeploy Your Application

**Important:** Environment variables only apply to NEW deployments!

1. Go to **Deployments** tab
2. Find your latest deployment
3. Click the **"..."** (three dots) menu
4. Click **"Redeploy"**
5. Wait for deployment to complete

## Visual Guide

```
Vercel Dashboard
  └── Your Project (POCL)
      └── Settings (⚙️ icon)
          └── Environment Variables (left sidebar)
              └── Add New (button)
                  ├── Key: NEXT_PUBLIC_ONEDRIVE_EMPLOYEES_URL
                  ├── Value: [your SharePoint URL]
                  └── Environment: ☑️ Production ☑️ Preview ☑️ Development
```

## How to Get Your SharePoint URLs

1. Go to your OneDrive/SharePoint
2. Right-click on the CSV file
3. Click **"Share"** or **"Get link"**
4. Make sure sharing is set to **"People in [YourOrg] with the link"**
5. Copy the link
6. Add `?download=1` to the end of the URL

Example:
```
Before: https://perkinseastman-my.sharepoint.com/.../employees.csv?d=xxx&web=1
After:  https://perkinseastman-my.sharepoint.com/.../employees.csv?download=1
```

## Verify It Worked

After redeploying, visit:
```
https://your-project.vercel.app/api/test-auth
```

Look for:
```json
{
  "environment": {
    "hasOneDriveUrls": true,  // ✅ Should be true
    "hasEmployeesUrl": true,   // ✅ Should be true
    "hasProjectsUrl": true,    // ✅ Should be true
    "hasProjectEmployeesUrl": true  // ✅ Should be true
  }
}
```

## Troubleshooting

### Issue: Variables not showing up
- **Solution:** Make sure you used `NEXT_PUBLIC_` prefix
- **Solution:** Redeploy after adding variables

### Issue: Still getting "not configured" error
- **Solution:** Check that you selected all three environments (Production, Preview, Development)
- **Solution:** Make sure you redeployed after adding variables
- **Solution:** Check the variable names match exactly (case-sensitive)

### Issue: Can't find Environment Variables section
- **Solution:** Make sure you're in the **Settings** tab, not Deployments
- **Solution:** Check you have permission to edit project settings

## Quick Checklist

- [ ] Opened Vercel Dashboard
- [ ] Selected project
- [ ] Went to Settings → Environment Variables
- [ ] Added `NEXT_PUBLIC_ONEDRIVE_EMPLOYEES_URL`
- [ ] Added `NEXT_PUBLIC_ONEDRIVE_PROJECTS_URL`
- [ ] Added `NEXT_PUBLIC_ONEDRIVE_PROJECT_EMPLOYEES_URL`
- [ ] Selected all three environments for each variable
- [ ] Redeployed the application
- [ ] Verified variables are working via `/api/test-auth`

