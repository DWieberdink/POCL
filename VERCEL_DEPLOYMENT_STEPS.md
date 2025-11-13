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

#### Required (for SharePoint authentication):
```
ONEDRIVE_EMPLOYEES_URL=https://perkinseastman-my.sharepoint.com/.../employees.csv?download=1
ONEDRIVE_PROJECTS_URL=https://perkinseastman-my.sharepoint.com/.../projects.csv?download=1
ONEDRIVE_PROJECT_EMPLOYEES_URL=https://perkinseastman-my.sharepoint.com/.../project_employees.csv?download=1
```

#### Optional:
```
NEXT_PUBLIC_SHAREPOINT_URL=https://perkinseastman.sharepoint.com
OPENASSET_BASE_URL=https://perkinseastman.openasset.com
```

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

## Testing Endpoints

After deployment, test these URLs:

- **Main App:** `https://your-project.vercel.app`
- **Test Page:** `https://your-project.vercel.app/test`
- **Auth Test API:** `https://your-project.vercel.app/api/test-auth`
- **Employees API:** `https://your-project.vercel.app/api/employees`

## Troubleshooting

### Issue: Still seeing "Authentication Required"
- **Check:** Are you signed into Microsoft 365 in your browser?
- **Check:** Are CSV files shared correctly in SharePoint?
- **Check:** Are environment variables set correctly in Vercel?

### Issue: Build fails
- **Check:** Node.js version (should be 18+)
- **Check:** Build logs in Vercel dashboard
- **Check:** All dependencies are in package.json

### Issue: CSV files not loading
- **Check:** Environment variables are set
- **Check:** SharePoint URLs are correct and accessible
- **Check:** File sharing settings ("People in org" not "Anyone")

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

