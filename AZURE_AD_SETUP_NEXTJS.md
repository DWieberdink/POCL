# Azure AD Authentication Setup Guide for Next.js

This guide will help you set up Microsoft Azure AD authentication for the Perkins Eastman Employee Directory Next.js application.

## Prerequisites

- An Azure account with admin access
- Permission to create App Registrations in Azure AD
- Your Perkins Eastman Azure AD tenant

## Step 1: Register the Application in Azure Portal

1. **Go to Azure Portal**: https://portal.azure.com
2. **Navigate to Azure Active Directory** → **App registrations**
3. **Click "New registration"**
4. **Fill in the details**:
   - **Name**: `Perkins Eastman Employee Directory` (or any name you prefer)
   - **Supported account types**: 
     - Select **"Accounts in this organizational directory only"** (Single tenant)
     - This restricts access to Perkins Eastman employees only
   - **Redirect URI**: 
     - Platform: **Single-page application (SPA)**
     - URI: `http://localhost:3000` (for local development)
     - For production, add: `https://your-vercel-domain.vercel.app`
5. **Click "Register"**

## Step 2: Get Your Application Details

From your app registration **Overview** page, copy:

1. **Application (client) ID** → This is your `NEXT_PUBLIC_AZURE_CLIENT_ID`
2. **Directory (tenant) ID** → This is your `NEXT_PUBLIC_AZURE_TENANT_ID`

**Note**: For Next.js, we use `NEXT_PUBLIC_` prefix because these values are needed in the browser.

## Step 3: Configure API Permissions

1. **Go to "API permissions"** in your app registration
2. **Click "Add a permission"**
3. **Select "Microsoft Graph"**
4. **Select "Delegated permissions"**
5. **Add the following permissions**:
   - `User.Read` (to read user profile)
   - `Files.Read.All` (to read files from OneDrive/SharePoint)
   - `Sites.Read.All` (to read SharePoint sites)
6. **Click "Add permissions"**
7. **Click "Grant admin consent for [Your Organization]"** (if you have admin rights)
   - This allows all Perkins Eastman employees to use the app without individual consent

## Step 4: Configure Authentication

1. **Go to "Authentication"** in your app registration
2. **Under "Platform configurations"**, you should see your SPA redirect URI
3. **Under "Implicit grant and hybrid flows"**, check:
   - ✅ **ID tokens** (used for authentication)
   - ✅ **Access tokens** (used for API calls)
4. **Click "Save"**

## Step 5: Configure Environment Variables

### For Local Development

Create a `.env.local` file in your project root:

```env
NEXT_PUBLIC_AZURE_CLIENT_ID=your-client-id-here
NEXT_PUBLIC_AZURE_TENANT_ID=your-tenant-id-here
ONEDRIVE_EMPLOYEES_URL=https://perkinseastman-my.sharepoint.com/.../employees.csv?...
ONEDRIVE_PROJECTS_URL=https://perkinseastman-my.sharepoint.com/.../projects.csv?...
ONEDRIVE_PROJECT_EMPLOYEES_URL=https://perkinseastman-my.sharepoint.com/.../project_employees.csv?...
```

**Important**: 
- Never commit `.env.local` to Git (it's already in `.gitignore`)
- Use `NEXT_PUBLIC_` prefix for variables needed in the browser

### For Vercel Deployment

1. **Go to your Vercel project** → **Settings** → **Environment Variables**
2. **Add these variables**:
   - `NEXT_PUBLIC_AZURE_CLIENT_ID` = your Client ID
   - `NEXT_PUBLIC_AZURE_TENANT_ID` = your Tenant ID
   - `ONEDRIVE_EMPLOYEES_URL` = SharePoint employees.csv URL
   - `ONEDRIVE_PROJECTS_URL` = SharePoint projects.csv URL
   - `ONEDRIVE_PROJECT_EMPLOYEES_URL` = SharePoint project_employees.csv URL
3. **Make sure they're set for**: Production, Preview, and Development
4. **Save**

## Step 6: Update Redirect URIs for Production

After deploying to Vercel:

1. **Go back to Azure Portal** → Your App Registration → **Authentication**
2. **Add your production redirect URI**:
   - Platform: **Single-page application (SPA)**
   - URI: `https://your-vercel-domain.vercel.app`
3. **Click "Save"**

## Step 7: Test the Authentication

### Local Testing

1. **Start the dev server**:
   ```bash
   npm run dev
   ```

2. **Open your browser** and go to: `http://localhost:3000`

3. **Click "Login with Microsoft"**

4. **Sign in with your Perkins Eastman email**

5. **Accept the permissions** when prompted:
   - Sign you in and read your profile
   - Read all files you can access
   - Read all sites you can access

6. **After successful login**, you should see:
   - Your name in the header
   - A "Logout" button
   - The app can now access SharePoint files using your credentials

### Production Testing

1. **Deploy to Vercel** (after the rate limit resets)
2. **Visit your Vercel URL**
3. **Test the login flow**
4. **Verify CSV files load correctly**

## Troubleshooting

### "Invalid client" error
- Check that `NEXT_PUBLIC_AZURE_CLIENT_ID` is correct
- Verify the app registration exists in Azure Portal

### "Redirect URI mismatch" error
- Ensure the redirect URI in Azure Portal matches exactly: `http://localhost:3000` (local) or your Vercel URL (production)
- Check for trailing slashes or http vs https mismatches

### "AADSTS50011: The reply URL specified in the request does not match"
- Go to Azure Portal → Your App → Authentication
- Verify the redirect URI is listed and matches exactly
- Make sure it's set as "Single-page application (SPA)" platform

### Authentication not working
- Check that all environment variables are set correctly
- Verify the client ID and tenant ID are correct
- Check browser console for errors (F12)

### "Access denied" or "Insufficient privileges"
- Ensure admin consent was granted in Azure Portal
- Check that the required API permissions are added:
  - `User.Read`
  - `Files.Read.All`
  - `Sites.Read.All`
- Verify the user has a valid Perkins Eastman account

### SharePoint files still not accessible
- Make sure you signed in with your Perkins Eastman account
- Verify the files are shared with "People in Perkins Eastman Architects DPC"
- Check browser console for Graph API errors
- Ensure `Files.Read.All` and `Sites.Read.All` permissions are granted

## Security Notes

1. **Never commit secrets to version control** (Git)
2. **Use environment variables** for all sensitive data
3. **Use HTTPS** in production (required for Azure AD)
4. **Restrict to single tenant** (Perkins Eastman only) for security
5. **The `NEXT_PUBLIC_` prefix** makes variables available in the browser - only use it for non-secret values like Client ID and Tenant ID

## Additional Resources

- [Microsoft Identity Platform Documentation](https://docs.microsoft.com/en-us/azure/active-directory/develop/)
- [MSAL React Documentation](https://github.com/AzureAD/microsoft-authentication-library-for-js/tree/dev/lib/msal-react)
- [Microsoft Graph API Documentation](https://docs.microsoft.com/en-us/graph/overview)
- [Azure AD App Registration Guide](https://docs.microsoft.com/en-us/azure/active-directory/develop/quickstart-register-app)

## Quick Reference

**Environment Variables Needed:**
```env
NEXT_PUBLIC_AZURE_CLIENT_ID=xxx
NEXT_PUBLIC_AZURE_TENANT_ID=xxx
ONEDRIVE_EMPLOYEES_URL=xxx
ONEDRIVE_PROJECTS_URL=xxx
ONEDRIVE_PROJECT_EMPLOYEES_URL=xxx
```

**Required API Permissions:**
- `User.Read` (Delegated)
- `Files.Read.All` (Delegated)
- `Sites.Read.All` (Delegated)

**Redirect URIs:**
- Local: `http://localhost:3000`
- Production: `https://your-vercel-domain.vercel.app`

