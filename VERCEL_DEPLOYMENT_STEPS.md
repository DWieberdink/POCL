# Vercel Deployment Steps

## Quick Deployment Guide

### 1. Connect GitHub to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Sign in with your GitHub account
3. Click **"Add New Project"**
4. Import repository: `DWieberdink/POCL`
5. Vercel will auto-detect Next.js settings

### 2. Configure Build Settings

Vercel should auto-detect:
- **Framework Preset:** Next.js
- **Build Command:** `npm run build`
- **Output Directory:** `.next`
- **Install Command:** `npm install --legacy-peer-deps` (already in vercel.json)

### 3. Set Environment Variables

In Vercel project settings → **Environment Variables**, add:

#### Required (for client-side CSV fetching):
**IMPORTANT:** These must be prefixed with `NEXT_PUBLIC_` to be accessible in the browser:

```
NEXT_PUBLIC_ONEDRIVE_EMPLOYEES_URL=https://perkinseastman-my.sharepoint.com/.../employees.csv?download=1
NEXT_PUBLIC_ONEDRIVE_PROJECTS_URL=https://perkinseastman-my.sharepoint.com/.../projects.csv?download=1
NEXT_PUBLIC_ONEDRIVE_PROJECT_EMPLOYEES_URL=https://perkinseastman-my.sharepoint.com/.../project_employees.csv?download=1
```

#### Optional:
```
NEXT_PUBLIC_SHAREPOINT_URL=https://perkinseastman.sharepoint.com
NEXT_PUBLIC_OPENASSET_BASE_URL=https://perkinseastman.openasset.com
```

**Note:** The `NEXT_PUBLIC_` prefix is required because these URLs are used in client-side code (browser). Without this prefix, the variables won't be accessible in the browser.

**Important:** 
- Replace `...` with your actual SharePoint file paths
- Make sure CSV files are shared as **"People in <YourOrg> with the link"** NOT "Anyone with the link"
- Use `?download=1` parameter for direct download links

### 4. Deploy

1. Click **"Deploy"**
2. Wait for build to complete (~2-3 minutes)
3. Your app will be live at `your-project.vercel.app`

### 5. Test Authentication

1. Visit your Vercel URL
2. If not signed in → You'll see "Authentication Required" message
3. Click "Sign in with Microsoft" → Opens SharePoint in new tab
4. Sign in with your Perkins Eastman Microsoft 365 account
5. Return to app tab → Click "I've Signed In - Retry Now"
6. App should now work! ✅

## How to Set Environment Variables in Vercel

### Step-by-Step Instructions

1. **Go to Vercel Dashboard**
   - Visit [vercel.com](https://vercel.com) and sign in with your GitHub account

2. **Select Your Project**
   - Click on your project name (e.g., `POCL`)

3. **Navigate to Settings**
   - Click **Settings** (gear icon) in the top navigation bar

4. **Open Environment Variables**
   - Click **Environment Variables** in the left sidebar

5. **Add Each Variable**
   For each variable below, click **"Add New"** and fill in:
   
   **Variable Name:** `NEXT_PUBLIC_ONEDRIVE_EMPLOYEES_URL`  
   **Value:** `https://perkinseastman-my.sharepoint.com/.../employees.csv?download=1`  
   **Environment:** Select **Production**, **Preview**, and **Development** (check all three)  
   Click **Save**
   
   **Variable Name:** `NEXT_PUBLIC_ONEDRIVE_PROJECTS_URL`  
   **Value:** `https://perkinseastman-my.sharepoint.com/.../projects.csv?download=1`  
   **Environment:** Select **Production**, **Preview**, and **Development**  
   Click **Save**
   
   **Variable Name:** `NEXT_PUBLIC_ONEDRIVE_PROJECT_EMPLOYEES_URL`  
   **Value:** `https://perkinseastman-my.sharepoint.com/.../project_employees.csv?download=1`  
   **Environment:** Select **Production**, **Preview**, and **Development**  
   Click **Save**

6. **Optional Variables** (if needed):
   
   **Variable Name:** `NEXT_PUBLIC_OPENASSET_BASE_URL`  
   **Value:** `https://perkinseastman.openasset.com`  
   **Environment:** Select **Production**, **Preview**, and **Development**  
   Click **Save**

7. **Redeploy**
   - After adding variables, go to **Deployments** tab
   - Click the **"..."** menu on the latest deployment
   - Click **"Redeploy"** to apply the new environment variables

### How to Check Environment Variables

After setting them, you should see these variables listed:
   - ✅ `NEXT_PUBLIC_ONEDRIVE_EMPLOYEES_URL`
   - ✅ `NEXT_PUBLIC_ONEDRIVE_PROJECTS_URL`
   - ✅ `NEXT_PUBLIC_ONEDRIVE_PROJECT_EMPLOYEES_URL`
   - (Optional) `NEXT_PUBLIC_OPENASSET_BASE_URL`

**Important Notes:**
- ⚠️ **MUST use `NEXT_PUBLIC_` prefix** - This is required for client-side access
- ✅ Select **all three environments** (Production, Preview, Development) when adding
- 🔄 **Redeploy after adding** - Environment variables only apply to new deployments

### Method 2: Using the Test Auth Endpoint

After deployment, visit:
```
https://your-project.vercel.app/api/test-auth
```

Look for the `environment` object in the JSON response:

```json
{
  "environment": {
    "hasOneDriveUrls": true,        // ✅ Should be true
    "hasEmployeesUrl": true,        // ✅ Should be true
    "hasProjectsUrl": true,         // ✅ Should be true
    "hasProjectEmployeesUrl": true, // ✅ Should be true
    "forceLocalCsv": false,         // Should be false for Vercel
    "nodeEnv": "production",        // Should be "production"
    "vercelUrl": "...",             // Your Vercel URL
    "vercelEnv": "production"       // Should be "production"
  },
  "diagnosis": "..."
}
```

**What to check:**
- ✅ All `has*Url` fields should be `true`
- ✅ `diagnosis` will tell you if variables are missing
- ✅ If `hasOneDriveUrls: false` → Variables are NOT set correctly

## Testing Endpoints

After deployment, test these URLs:

- **Main App:** `https://your-project.vercel.app`
- **Test Page:** `https://your-project.vercel.app/test`
- **Auth Test API:** `https://your-project.vercel.app/api/test-auth` ← **Use this to check env vars!**
- **Employees API:** `https://your-project.vercel.app/api/employees`

## Troubleshooting

### ⚠️ CRITICAL: SharePoint Cookie Limitation

**The Problem:** SharePoint cookies (`FedAuth`, `rtFa`) are **domain-specific** and will **NOT** be sent from your browser to `*.vercel.app` domains. This is a browser security feature (Same-Origin Policy).

**What This Means:**
- ✅ Environment variables are set correctly (`hasOneDriveUrls: true`)
- ❌ Browser cannot forward SharePoint cookies to Vercel
- ❌ Vercel server cannot access SharePoint files without authentication

**Current Status:** Your test shows:
```json
{
  "environment": {
    "hasOneDriveUrls": true,  // ✅ Variables are set
    "hasEmployeesUrl": true,  // ✅ All URLs configured
    "hasProjectsUrl": true,
    "hasProjectEmployeesUrl": true
  },
  "diagnosis": "NO_COOKIES: No cookies received..."
}
```

**Possible Solutions:**

#### Option 1: Use a Custom Domain (Recommended)
1. Add a custom domain to your Vercel project (e.g., `pocl.perkinseastman.com`)
2. Configure SharePoint to allow cookies for your custom domain
3. This requires IT/admin support to configure SharePoint CORS/cookie settings

#### Option 2: Client-Side Fetch (Workaround)
Modify the app to fetch CSV files directly from the browser (not through Vercel API):
- Browser → SharePoint (cookies work ✅)
- Parse CSV in browser
- Send parsed data to Vercel API

**Note:** This requires code changes and has security implications.

#### Option 3: Use Proper OAuth/MSAL
Implement full Microsoft Authentication Library (MSAL) flow:
- More complex but proper solution
- Requires Azure AD app registration
- Provides secure token-based authentication

### Issue: Still seeing "Authentication Required"
- **Check:** Are you signed into Microsoft 365 in your browser?
- **Check:** Are CSV files shared correctly in SharePoint?
- **Check:** Are environment variables set correctly in Vercel?
- **Check:** Are you experiencing the cookie limitation above?

### Issue: Build fails
- **Check:** Node.js version (should be 18+)
- **Check:** Build logs in Vercel dashboard
- **Check:** All dependencies are in package.json

### Issue: CSV files not loading
- **Check:** Environment variables are set (use `/api/test-auth` to verify)
- **Check:** SharePoint URLs are correct and accessible
- **Check:** File sharing settings ("People in org" not "Anyone")
- **Check:** Cookie limitation (see critical issue above)

## Post-Deployment Checklist

- [ ] App deploys successfully
- [ ] Environment variables are set
- [ ] Authentication flow works
- [ ] CSV data loads correctly
- [ ] Employee search works
- [ ] Project links work (OpenAsset URLs)
- [ ] Export to Excel works

## Security Notes

✅ **Secure by default:**
- CSV files protected by SharePoint permissions
- Only authenticated org members can access
- No authentication tokens stored
- Data never bundled into static HTML

⚠️ **Important:**
- Keep environment variables secure (don't commit to git)
- Ensure CSV files are shared correctly
- Monitor Vercel logs for any issues

## Support

If you encounter issues:
1. Check Vercel deployment logs
2. Check browser console (F12)
3. Test `/api/test-auth` endpoint
4. Verify SharePoint file sharing settings

