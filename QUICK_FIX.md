# Quick Fix for 401 Errors

## Problem
Getting 401 errors because app is trying to use OneDrive URLs but authentication doesn't work locally.

## Solution Applied

1. ✅ Created `.env.local` with `FORCE_LOCAL_CSV=true`
2. ✅ Added automatic fallback to local CSV files in development mode
3. ✅ Changed sign-in to open in same window (not new tab)

## Next Steps

**IMPORTANT: Restart your dev server!**

1. Stop the current dev server (Ctrl+C in terminal)
2. Start it again: `npm run dev`
3. The app should now use local CSV files and work without authentication

## How It Works Now

- **Local Development:** Uses local CSV files (no auth needed)
- **If OneDrive URLs are set:** Falls back to local files if auth fails (development only)
- **Production (Vercel):** Will use OneDrive URLs with proper authentication

## Verify It's Working

After restarting:
1. Visit http://localhost:3000
2. Should load immediately without authentication errors
3. Check server console - should see: `[CSV Loader] Using local CSV files`

## To Test Authentication Later

When ready to test authentication on Vercel:
1. Remove `FORCE_LOCAL_CSV=true` from `.env.local` (or set to `false`)
2. Set OneDrive URLs in Vercel environment variables
3. Deploy to Vercel
4. Test authentication flow

