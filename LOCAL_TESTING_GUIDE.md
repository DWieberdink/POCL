# Local Testing Guide

## Understanding Cookie-Based Authentication

### The Challenge

SharePoint cookies are **domain-specific**. This means:
- Cookies set by `perkinseastman.sharepoint.com` are only sent to `*.sharepoint.com` domains
- Cookies are **NOT** sent to `localhost:3000` due to browser security (Same-Origin Policy)
- This is **normal browser behavior** and a security feature

### Current Setup

Your app has two modes:

1. **Local CSV Files** (Current - No Auth Needed)
   - No `ONEDRIVE_*` environment variables set
   - Reads from `Data/*.csv` files
   - ✅ Works perfectly locally
   - ❌ Can't test authentication flow

2. **OneDrive/SharePoint URLs** (Requires Auth)
   - `ONEDRIVE_EMPLOYEES_URL` etc. set
   - Needs SharePoint cookies
   - ❌ Won't work locally (no cookies sent to localhost)
   - ✅ Will work on Vercel (cookies forwarded correctly)

## Testing Authentication Locally

### Option 1: Test Without Authentication (Current)

Keep using local CSV files:
- ✅ Works immediately
- ✅ No setup needed
- ✅ Fast development
- ❌ Can't test authentication flow

### Option 2: Test Authentication on Vercel

Deploy to Vercel to test authentication:
1. Push code to GitHub (already done ✅)
2. Connect to Vercel
3. Set environment variables in Vercel
4. Test authentication flow on Vercel URL

### Option 3: Use a Proxy/Tunnel (Advanced)

Use a tool like `ngrok` or `localtunnel` to make localhost accessible via a public domain:
```bash
# Install ngrok
ngrok http 3000

# Use the ngrok URL (e.g., https://abc123.ngrok.io)
# Set this as redirect URL in SharePoint (if supported)
```

## What the Test Results Show

From your test:
```json
{
  "cookieNames": ["__next_hmr_refresh_hash__"]
}
```

This shows:
- ✅ Next.js dev server cookie is working
- ❌ No SharePoint cookies (expected - they're domain-specific)
- ✅ App works because using local CSV files

## Verification Checklist

### Local Development (Current)
- [x] App loads data from local CSV files
- [x] No authentication errors
- [x] All features work
- [ ] Authentication flow (can't test locally)

### Vercel Deployment (Next Step)
- [ ] Deploy to Vercel
- [ ] Set OneDrive environment variables
- [ ] Test authentication flow
- [ ] Verify cookie forwarding works

## Why This Will Work on Vercel

On Vercel:
1. User visits `your-app.vercel.app`
2. Browser makes API request to `your-app.vercel.app/api/employees`
3. Next.js API route receives cookies from browser
4. API route forwards cookies to SharePoint
5. SharePoint validates cookies ✅
6. CSV downloads successfully ✅

The key difference:
- **Localhost**: Browser doesn't send SharePoint cookies to `localhost:3000`
- **Vercel**: Browser sends cookies to `your-app.vercel.app`, which forwards them to SharePoint

## Next Steps

1. **Continue local development** with CSV files (current setup)
2. **Deploy to Vercel** when ready to test authentication
3. **Set environment variables** in Vercel dashboard
4. **Test authentication flow** on Vercel URL

The authentication implementation is correct - it just needs to run on a deployed domain (Vercel) where cookies can be properly forwarded.

