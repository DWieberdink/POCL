# SharePoint Authentication Issue - Domain-Specific Cookies

## The Problem

SharePoint cookies (`FedAuth`, `rtFa`) are **domain-specific** and are only sent by the browser to `*.sharepoint.com` domains. They **cannot** be forwarded to `*.vercel.app` domains due to browser security (Same-Origin Policy).

**What's happening:**
1. User visits `pocl.vercel.app`
2. Browser makes request to `/api/proxy-csv` on Vercel
3. Browser only sends cookies for `*.vercel.app` domain
4. SharePoint cookies (for `*.sharepoint.com`) are **not** included
5. Proxy tries to fetch CSV from SharePoint without authentication
6. SharePoint returns 401 (Authentication Required)

## Why This Happens

```
Browser → Vercel API (pocl.vercel.app)
  ├─ Cookies sent: Only for *.vercel.app ✅
  └─ Cookies NOT sent: SharePoint cookies (for *.sharepoint.com) ❌

Vercel Server → SharePoint
  └─ No SharePoint cookies available → 401 Error ❌
```

## Solutions

### Option 1: Change CSV File Sharing Settings (Easiest)

**Make CSV files accessible via direct link without authentication:**

1. Go to SharePoint/OneDrive
2. Right-click on each CSV file
3. Click **"Share"**
4. Change sharing to: **"Anyone in your organization with the link"** 
   - OR use a **SharePoint site** with anonymous access enabled
5. Copy the **direct download link** (should work without cookies)

**Pros:** Simple, no code changes  
**Cons:** Less secure (anyone in org can access if they have the link)

### Option 2: Use SharePoint Site Collection (Recommended)

Instead of personal OneDrive, use a **SharePoint Site**:

1. Create a SharePoint Site for your organization
2. Upload CSV files to a document library
3. Configure the library to allow **anonymous access** or **org-wide access**
4. Get direct download URLs from the site

**Pros:** Better for organizational use, more control  
**Cons:** Requires SharePoint admin access

### Option 3: Use Proper OAuth/MSAL (Most Secure)

Implement Microsoft Authentication Library (MSAL):

1. Register an Azure AD app
2. Get access tokens via OAuth flow
3. Use tokens to authenticate SharePoint API calls

**Pros:** Proper authentication, secure  
**Cons:** More complex, requires Azure AD setup

### Option 4: Custom Domain (If Available)

Use a custom domain (e.g., `pocl.perkinseastman.com`):

1. Add custom domain to Vercel
2. Configure SharePoint to allow CORS from your domain
3. Cookies might work across your domain

**Pros:** Cookies can work  
**Cons:** Requires IT/admin support, CORS configuration

## Quick Fix: Test Without Authentication

To test if the proxy works, temporarily make one CSV file publicly accessible:

1. Right-click CSV file → Share
2. Select **"Anyone with the link"** (temporarily)
3. Copy the link
4. Test if proxy can fetch it
5. If it works, the issue is authentication
6. Change back to "People in org" after testing

## Current Status

The proxy endpoint is working correctly, but SharePoint is returning 401 because:
- No SharePoint cookies are available (domain-specific)
- CSV files require authentication
- Server-side proxy can't access browser's SharePoint cookies

## Next Steps

1. **Check CSV file sharing settings** - Can they be accessed without cookies?
2. **Try Option 1** - Change sharing to "Anyone in org with link"
3. **Check Vercel logs** - Look for `[Proxy CSV]` logs to see what's happening
4. **Consider Option 3** - Implement proper OAuth if security is critical

## Testing

Visit `/api/proxy-csv?type=employees` directly to see the error response with details.

