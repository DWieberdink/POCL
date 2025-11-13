# Troubleshooting: "Failed to fetch" Error

## What This Error Means

"Failed to fetch" typically indicates one of these issues:
1. **CORS blocking** - SharePoint is blocking cross-origin requests
2. **Network error** - Can't reach SharePoint servers
3. **Authentication** - Not signed into SharePoint
4. **Incorrect URLs** - Environment variables are wrong

## Step-by-Step Troubleshooting

### 1. Check Browser Console

Open browser DevTools (F12) and check the Console tab for detailed error messages:
- Look for CORS errors
- Check the Network tab to see if requests are being made
- Look for the actual error message

### 2. Verify Environment Variables

Check that environment variables are set correctly:

1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Verify these exist:
   - `NEXT_PUBLIC_ONEDRIVE_EMPLOYEES_URL`
   - `NEXT_PUBLIC_ONEDRIVE_PROJECTS_URL`
   - `NEXT_PUBLIC_ONEDRIVE_PROJECT_EMPLOYEES_URL`
3. Check that they're enabled for **Production**, **Preview**, and **Development**
4. **Redeploy** after adding/changing variables

### 3. Test SharePoint URLs Directly

Try opening the SharePoint URLs directly in your browser:

1. Copy the URL from Vercel environment variables
2. Paste it into a new browser tab
3. If it asks you to sign in → Sign in
4. If it downloads the CSV → URL is correct ✅
5. If it shows an error → URL might be wrong ❌

### 4. Sign Into SharePoint First

**Important:** You must be signed into SharePoint in the same browser:

1. Open a new tab
2. Go to: `https://perkinseastman.sharepoint.com`
3. Sign in with your Perkins Eastman Microsoft 365 account
4. Return to your Vercel app
5. Refresh the page

### 5. Check CSV File Sharing Settings

The CSV files must be shared correctly:

1. Go to SharePoint/OneDrive
2. Right-click on the CSV file
3. Click **"Share"**
4. Verify it says: **"People in [YourOrg] with the link"**
5. **NOT** "Anyone with the link"

### 6. Check CORS Headers

If you see CORS errors in the console:

**The Problem:** SharePoint might not allow cross-origin requests from `*.vercel.app` domains.

**Possible Solutions:**

#### Option A: Use a Custom Domain
1. Add a custom domain to your Vercel project (e.g., `pocl.perkinseastman.com`)
2. Configure SharePoint to allow CORS from your custom domain
3. This requires IT/admin support

#### Option B: Test in Same Domain
1. If testing locally, ensure you're accessing SharePoint from the same domain
2. Or use `FORCE_LOCAL_CSV=true` for local testing

#### Option C: Verify URL Format
Make sure your SharePoint URLs are in the correct format:
```
✅ Correct: https://perkinseastman-my.sharepoint.com/.../file.csv?download=1
❌ Wrong:   https://perkinseastman-my.sharepoint.com/.../file.csv?web=1&e=xxx
```

### 7. Check Network Tab

In browser DevTools → Network tab:

1. Look for requests to SharePoint URLs
2. Check the status code:
   - **200** = Success ✅
   - **401/403** = Authentication required
   - **CORS error** = Cross-origin blocked
   - **Failed** = Network error

### 8. Common Issues and Solutions

#### Issue: "Failed to fetch" with CORS error
**Solution:** 
- Sign into SharePoint first
- Verify CSV files are shared correctly
- Check if SharePoint allows CORS from your domain

#### Issue: "Failed to fetch" with 401/403
**Solution:**
- Sign into SharePoint in the browser
- Verify you have access to the CSV files
- Check file sharing settings

#### Issue: Environment variables not found
**Solution:**
- Make sure variables use `NEXT_PUBLIC_` prefix
- Redeploy after adding variables
- Check all three environments are selected

#### Issue: URLs are incorrect
**Solution:**
- Test URLs directly in browser
- Make sure URLs end with `?download=1`
- Verify URLs point to actual CSV files

## Quick Diagnostic Checklist

- [ ] Opened browser console (F12) to see detailed error
- [ ] Checked Network tab for failed requests
- [ ] Verified environment variables are set in Vercel
- [ ] Redeployed after setting environment variables
- [ ] Signed into SharePoint in the browser
- [ ] Tested SharePoint URLs directly in browser
- [ ] Verified CSV files are shared as "People in org"
- [ ] Checked that URLs end with `?download=1`

## Getting More Help

If none of these solutions work:

1. **Check browser console** for the exact error message
2. **Check Network tab** to see what's happening with requests
3. **Share the error details** including:
   - Full error message from console
   - Status code from Network tab
   - Whether you're signed into SharePoint
   - Whether URLs work when opened directly

## Alternative: Use Local CSV Files for Testing

If SharePoint access is problematic, you can use local CSV files:

1. Set environment variable: `FORCE_LOCAL_CSV=true`
2. Ensure CSV files exist in `Data/` folder
3. This bypasses SharePoint authentication

**Note:** This only works locally, not on Vercel.

