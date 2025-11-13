# SharePoint Permissions-Based Authentication Implementation

This document describes the implementation of OneDrive/SharePoint permissions as the authentication gate for the Employee Directory application.

## Overview

The application now uses OneDrive/SharePoint file sharing permissions as the primary authentication mechanism, eliminating the need for complex OAuth implementation. This approach relies on Microsoft's built-in authentication when accessing SharePoint resources.

## How It Works

### 1. File Sharing Configuration

**Critical:** CSV files in OneDrive/SharePoint must be shared as:
- ✅ **"People in <YourOrg> with the link"** 
- ❌ **NOT "Anyone with the link"**

This ensures that:
- Only authenticated members of your organization can access the files
- External users are automatically blocked at Microsoft's login/permissions level
- No additional authentication code is required

### 2. Authentication Flow

1. **User visits the application** → Frontend makes API requests
2. **API routes forward browser cookies** → Server-side fetch includes user's Microsoft 365 session cookies
3. **SharePoint validates cookies** → If user is signed into Microsoft 365, access is granted
4. **If not authenticated** → SharePoint returns 401/403, app shows sign-in message

### 3. Sign-In Process

When authentication is required:
- User sees an "Authentication Required" message
- Clicks "Sign in with Microsoft" button
- Opens SharePoint in a new tab (triggers Microsoft login)
- After signing in, user returns to the app and refreshes
- Browser cookies are now available, and CSV fetch succeeds

## Implementation Details

### Backend Changes

#### `lib/csv-loader.ts`
- Removed Graph API authentication code
- Added cookie forwarding from browser requests to SharePoint
- Created `SharePointAuthError` class for authentication errors
- Updated `downloadFromSharePointDirect()` to accept and forward cookies

#### API Routes
All API routes (`/api/employees`, `/api/practice-areas`, `/api/sub-practice-areas`, `/api/export/employees`) now:
- Extract `Cookie` header from incoming requests
- Forward cookies to SharePoint when fetching CSV files
- Return 401 status with `requiresAuth: true` flag when authentication fails

### Frontend Changes

#### `app/page.tsx`
- Removed MSAL (Microsoft Authentication Library) dependencies
- Removed access token handling
- Added `requiresAuth` state to track authentication status
- Detects 401 responses and shows `AuthRequired` component

#### `components/AuthRequired.tsx`
- New component that displays authentication instructions
- "Sign in with Microsoft" button opens SharePoint
- "Retry After Signing In" button reloads the page

### CSS Styling

Added styles in `app/employee-directory.css` for the auth required component:
- Centered layout with clear messaging
- Instructions for users
- Responsive design for mobile devices

## Environment Variables

No new environment variables are required. Continue using:
- `ONEDRIVE_EMPLOYEES_URL` - SharePoint URL for employees.csv
- `ONEDRIVE_PROJECTS_URL` - SharePoint URL for projects.csv
- `ONEDRIVE_PROJECT_EMPLOYEES_URL` - SharePoint URL for project_employees.csv

Optional:
- `NEXT_PUBLIC_SHAREPOINT_URL` - Custom SharePoint URL for sign-in button (defaults to `https://perkinseastman.sharepoint.com`)

## Security Notes

✅ **Secure by default:**
- CSV files are protected by SharePoint permissions
- Only authenticated org members can access data
- No authentication tokens stored in the application
- Data never bundled into static HTML at build time

⚠️ **Important considerations:**
- Cookies are forwarded from browser to server to SharePoint
- Server-side fetch in Next.js API routes includes user's browser cookies
- This works because cookies are sent with every request from the browser

## User Experience

### For Authenticated Users
1. User is already signed into Microsoft 365
2. Browser has valid cookies
3. CSV fetch succeeds automatically
4. Application works seamlessly

### For Unauthenticated Users
1. User visits the application
2. API requests fail with 401
3. User sees "Authentication Required" message
4. User clicks "Sign in with Microsoft"
5. SharePoint opens in new tab, user signs in
6. User returns to app and refreshes
7. Application now works with authenticated session

## Testing

To test the implementation:

1. **Test authenticated access:**
   - Sign into Microsoft 365 in your browser
   - Visit the application
   - Should work immediately

2. **Test unauthenticated access:**
   - Sign out of Microsoft 365
   - Clear browser cookies
   - Visit the application
   - Should show "Authentication Required" message

3. **Test sign-in flow:**
   - Click "Sign in with Microsoft"
   - Complete Microsoft login
   - Return to app and refresh
   - Should now work

## Migration Notes

### Removed Components
- MSAL authentication code (can be removed if not used elsewhere)
- `AuthButton` component (no longer needed)
- Access token handling in API routes

### Kept Components
- `AuthProvider` component (may still be used for other features)
- All existing functionality remains the same

## Troubleshooting

### Issue: Still getting 401 errors after signing in
- **Solution:** Ensure CSV files are shared as "People in <YourOrg> with the link"
- **Solution:** Clear browser cache and cookies, then sign in again
- **Solution:** Verify SharePoint URLs are correct in environment variables

### Issue: Cookies not being forwarded
- **Solution:** Ensure API routes are extracting `Cookie` header correctly
- **Solution:** Check that fetch calls include the cookie header

### Issue: Sign-in button doesn't work
- **Solution:** Set `NEXT_PUBLIC_SHAREPOINT_URL` environment variable
- **Solution:** Verify SharePoint URL is accessible

## Future Enhancements

Potential improvements:
- Add automatic retry after detecting successful sign-in
- Cache authentication status in localStorage
- Add more detailed error messages
- Support for different SharePoint tenant URLs

