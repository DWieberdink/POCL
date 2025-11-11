# OneDrive CSV Integration Guide

## Overview

This guide shows how to keep your Flask app code in GitHub while reading CSV files from OneDrive. This keeps sensitive employee data secure and out of version control.

## Option 1: OneDrive Direct Download Links (Simplest)

### Step 1: Get OneDrive Direct Links

1. **Upload CSV files to OneDrive**
   - Upload `employees.csv`, `projects.csv`, `project_employees.csv` to a OneDrive folder
   - Make sure the folder/file is accessible (shared if needed)

2. **Get Direct Download Links**
   - Right-click on each CSV file → "Copy link"
   - Or use OneDrive web interface:
     - Open file in OneDrive web
     - Click "..." → "Embed" or "Get link"
     - Change `?web=1` to `?download=1` in the URL
   - You'll get URLs like:
     ```
     https://[tenant]-my.sharepoint.com/personal/[user]/_layouts/15/download.aspx?share=[token]
     ```

3. **Add Links as Environment Variables**
   - In your deployment platform (Vercel/Azure), add:
     ```
     ONEDRIVE_EMPLOYEES_URL = [direct-download-link]
     ONEDRIVE_PROJECTS_URL = [direct-download-link]
     ONEDRIVE_PROJECT_EMPLOYEES_URL = [direct-download-link]
     ```

### Step 2: Update app.py

The app will automatically use OneDrive URLs if environment variables are set.

## Option 2: OneDrive API (More Secure)

### Step 1: Register Azure AD App (if not already done)

1. Azure Portal → App registrations
2. Create new registration
3. Add API permissions: `Files.Read` or `Files.Read.All`
4. Create client secret

### Step 2: Get File IDs

1. Upload CSV files to OneDrive
2. Get file IDs from OneDrive URLs or API
3. Add to environment variables:
   ```
   ONEDRIVE_EMPLOYEES_FILE_ID = [file-id]
   ONEDRIVE_PROJECTS_FILE_ID = [file-id]
   ONEDRIVE_PROJECT_EMPLOYEES_FILE_ID = [file-id]
   ```

### Step 3: Use OneDrive API

The app will use Azure AD credentials to authenticate and read files.

## Option 3: OneDrive Sync on Server (Azure App Service Only)

If deploying to Azure App Service:

1. **Install OneDrive Sync on Server**
   - Use Azure File Sync or mount OneDrive
   - CSV files sync automatically
   - App reads from local synced folder

2. **Keep Current Code**
   - No changes needed to app.py
   - CSV files sync from OneDrive to server

## Recommended Approach

**For Vercel/Azure App Service:**
- Use **Option 1 (Direct Download Links)** - Simplest and works everywhere
- Files stay in OneDrive
- App downloads them on startup
- No API complexity

**For Azure App Service:**
- Use **Option 3 (OneDrive Sync)** - Best integration
- Files automatically sync
- No code changes needed

## Security Notes

✅ **Keep repository private** - Even without CSV files, make repo private
✅ **Use environment variables** - Never hardcode OneDrive URLs
✅ **Restrict OneDrive access** - Only share with necessary people
✅ **Use Azure AD authentication** - Secure file access

## Implementation

The app.py has been updated to support OneDrive URLs. Just set the environment variables and it will automatically use OneDrive instead of local files.

