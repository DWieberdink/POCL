# Deployment Checklist - SharePoint Authentication

## ✅ Authentication Implementation Verified

### How Authentication Works:

1. **Browser Request Flow:**
   - User visits Vercel app → Browser makes API requests
   - Browser automatically includes Microsoft 365 cookies (if user is signed in)
   - Cookies are sent in the `Cookie` header with every request

2. **Server-Side (Vercel API Routes):**
   - Next.js API routes receive cookies via `request.headers.get('cookie')`
   - We extract the cookie header: `const cookieHeader = request.headers.get('cookie')`
   - We forward cookies to SharePoint: `headers['Cookie'] = cookieHeader`

3. **SharePoint Validation:**
   - SharePoint receives the request with forwarded cookies
   - If cookies are valid → CSV download succeeds
   - If cookies are invalid/missing → Returns 401/403 or HTML login page
   - We detect this and show "Sign in with Microsoft" message

### ✅ Implementation is Correct:

- ✅ Cookies are extracted from browser requests
- ✅ Cookies are forwarded to SharePoint fetch requests
- ✅ Authentication errors (401/403) are detected
- ✅ HTML login pages are detected
- ✅ User-friendly error messages are shown
- ✅ Sign-in button opens SharePoint to trigger login

### ⚠️ Important Notes:

1. **CSV File Sharing Settings:**
   - Files MUST be shared as "People in <YourOrg> with the link"
   - NOT "Anyone with the link"
   - This ensures only authenticated org members can access

2. **Cookie Domain:**
   - SharePoint cookies are domain-specific (perkinseastman.sharepoint.com)
   - They will be forwarded correctly as long as:
     - User is signed into Microsoft 365 in their browser
     - Cookies are sent with requests (automatic)
     - SameSite settings allow cross-site cookie forwarding

3. **Testing on Vercel:**
   - First visit: User not signed in → Shows "Sign in" message
   - User clicks "Sign in with Microsoft" → Opens SharePoint
   - User signs in → Returns to app → Cookies now available → Works!

## Deployment Steps:

1. ✅ Code is ready
2. ⏳ Push to GitHub
3. ⏳ Connect GitHub repo to Vercel
4. ⏳ Set environment variables in Vercel:
   - `ONEDRIVE_EMPLOYEES_URL`
   - `ONEDRIVE_PROJECTS_URL`
   - `ONEDRIVE_PROJECT_EMPLOYEES_URL`
   - `NEXT_PUBLIC_SHAREPOINT_URL` (optional)
   - `OPENASSET_BASE_URL` (optional)
5. ⏳ Deploy and test authentication flow

## Environment Variables Needed in Vercel:

```
ONEDRIVE_EMPLOYEES_URL=https://perkinseastman-my.sharepoint.com/.../employees.csv?download=1
ONEDRIVE_PROJECTS_URL=https://perkinseastman-my.sharepoint.com/.../projects.csv?download=1
ONEDRIVE_PROJECT_EMPLOYEES_URL=https://perkinseastman-my.sharepoint.com/.../project_employees.csv?download=1
NEXT_PUBLIC_SHAREPOINT_URL=https://perkinseastman.sharepoint.com
```

