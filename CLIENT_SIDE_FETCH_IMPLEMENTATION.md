# Client-Side CSV Fetch Implementation

## Overview

The application has been updated to fetch CSV files directly from SharePoint in the browser (client-side) instead of going through the Vercel API. This solves the cookie forwarding limitation where SharePoint cookies cannot be sent to `*.vercel.app` domains.

## How It Works

1. **Browser → SharePoint**: CSV files are downloaded directly from SharePoint using browser fetch
2. **Cookies Work**: Browser automatically sends SharePoint authentication cookies to SharePoint domain
3. **Client-Side Processing**: CSV files are parsed and filtered entirely in the browser
4. **No Server Calls**: All filtering and searching happens client-side (except Excel export)

## Key Changes

### New Files Created

1. **`lib/client-csv-loader.ts`**
   - Client-side CSV fetching utility
   - Downloads CSV files directly from SharePoint
   - Parses CSV data in the browser
   - Handles authentication errors

2. **`lib/client-filter.ts`**
   - Client-side filtering logic
   - Matches server-side filtering behavior
   - Filters employees based on all criteria

### Modified Files

1. **`app/page.tsx`**
   - Loads CSV data on component mount (client-side)
   - Filters employees automatically when filters change
   - Removed "Search Employees" button (filtering is automatic)
   - Shows loading state while fetching CSV files

2. **`components/EmployeeModal.tsx`**
   - Updated to accept `projects` and `projectEmployees` props
   - Uses client-side data instead of API calls
   - Falls back to API if client-side data not available

3. **`VERCEL_DEPLOYMENT_STEPS.md`**
   - Updated environment variable names to use `NEXT_PUBLIC_` prefix
   - Added note about client-side access requirement

## Environment Variables

**IMPORTANT:** Environment variables must be prefixed with `NEXT_PUBLIC_` to be accessible in the browser:

```
NEXT_PUBLIC_ONEDRIVE_EMPLOYEES_URL=https://perkinseastman-my.sharepoint.com/.../employees.csv?download=1
NEXT_PUBLIC_ONEDRIVE_PROJECTS_URL=https://perkinseastman-my.sharepoint.com/.../projects.csv?download=1
NEXT_PUBLIC_ONEDRIVE_PROJECT_EMPLOYEES_URL=https://perkinseastman-my.sharepoint.com/.../project_employees.csv?download=1
NEXT_PUBLIC_OPENASSET_BASE_URL=https://perkinseastman.openasset.com
```

## Security Considerations

⚠️ **Important Security Notes:**

1. **Data Exposure**: CSV files are downloaded to the browser and visible in DevTools
2. **URL Exposure**: SharePoint URLs are visible in browser Network tab
3. **Access Control**: Relies entirely on SharePoint permissions ("People in org" sharing)
4. **No Server Validation**: All filtering happens client-side

✅ **Mitigations Implemented:**

- `cache: 'no-store'` headers to prevent caching
- Proper error handling for authentication failures
- SharePoint permissions enforce access control
- Data only accessible to authenticated Perkins Eastman employees

## User Flow

1. User visits app → Browser fetches CSV files from SharePoint
2. SharePoint checks authentication → If not signed in, shows login page
3. User signs in → Browser cookies are set for SharePoint domain
4. CSV files download → Data is parsed and displayed
5. User filters/searches → All filtering happens client-side (instant)
6. User exports Excel → Still uses API (requires server-side ExcelJS library)

## Benefits

✅ **Solves Cookie Problem**: Browser cookies work correctly with SharePoint domain
✅ **Faster Filtering**: No API calls needed for filtering (instant results)
✅ **Better UX**: Real-time filtering as user types/changes filters
✅ **Simpler Architecture**: No cookie forwarding needed

## Limitations

⚠️ **Data Visibility**: All CSV data is visible in browser DevTools
⚠️ **No Server-Side Validation**: Client-side code can be modified
⚠️ **Excel Export**: Still requires API call (server-side library needed)
⚠️ **Initial Load**: Must download all CSV files on first load

## Testing

1. **Local Testing**: 
   - Set `FORCE_LOCAL_CSV=true` to use local CSV files
   - Or ensure you're signed into SharePoint in browser

2. **Vercel Testing**:
   - Set `NEXT_PUBLIC_ONEDRIVE_*` environment variables
   - Ensure CSV files are shared as "People in org"
   - User must be signed into SharePoint

## Troubleshooting

### Issue: "No cookies received"
- **Solution**: User must visit SharePoint first to establish session
- Then return to app and refresh

### Issue: "Authentication required"
- **Solution**: CSV files must be shared as "People in org" not "Anyone"
- User must sign in with Perkins Eastman Microsoft 365 account

### Issue: Environment variables not working
- **Solution**: Must use `NEXT_PUBLIC_` prefix for client-side access
- Redeploy after setting environment variables

### Issue: CSV files not loading
- **Check**: Browser console for errors
- **Check**: Network tab to see if requests are being made
- **Check**: SharePoint file sharing settings

## Next Steps

1. ✅ Set `NEXT_PUBLIC_ONEDRIVE_*` environment variables in Vercel
2. ✅ Ensure CSV files are shared correctly in SharePoint
3. ✅ Test authentication flow
4. ✅ Deploy to Vercel
5. ✅ Verify CSV files load correctly

## Files Modified Summary

- ✅ Created `lib/client-csv-loader.ts`
- ✅ Created `lib/client-filter.ts`
- ✅ Modified `app/page.tsx` (client-side CSV loading)
- ✅ Modified `components/EmployeeModal.tsx` (client-side data)
- ✅ Updated `VERCEL_DEPLOYMENT_STEPS.md` (environment variables)

