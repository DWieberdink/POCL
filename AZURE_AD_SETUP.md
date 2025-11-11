# Azure AD Authentication Setup Guide

This guide will help you set up Microsoft Azure AD authentication for the Perkins Eastman Employee Directory.

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
     - Platform: **Web**
     - URI: `http://localhost:5000/getAToken` (for local development)
     - For production, add: `https://your-domain.com/getAToken`
5. **Click "Register"**

## Step 2: Configure Authentication

1. **In your app registration**, go to **Authentication**
2. **Under "Implicit grant and hybrid flows"**, check:
   - ✅ **ID tokens** (used for implicit and hybrid flows)
3. **Under "Redirect URIs"**, ensure your redirect URI is listed
4. **Click "Save"**

## Step 3: Create a Client Secret

1. **Go to "Certificates & secrets"** in your app registration
2. **Click "New client secret"**
3. **Add a description**: `Employee Directory Secret`
4. **Choose expiration**: Select an appropriate expiration (recommend 12-24 months)
5. **Click "Add"**
6. **IMPORTANT**: Copy the **Value** immediately (you won't be able to see it again!)
   - This is your `AZURE_CLIENT_SECRET`

## Step 4: Get Your Application Details

From your app registration **Overview** page, copy:

1. **Application (client) ID** → This is your `AZURE_CLIENT_ID`
2. **Directory (tenant) ID** → This is your `AZURE_TENANT_ID`
3. **Client Secret Value** (from Step 3) → This is your `AZURE_CLIENT_SECRET`

## Step 5: Configure API Permissions

1. **Go to "API permissions"** in your app registration
2. **Click "Add a permission"**
3. **Select "Microsoft Graph"**
4. **Select "Delegated permissions"**
5. **Add the following permissions**:
   - `User.Read` (to read user profile)
   - `User.ReadBasic.All` (optional, if you need to read other users' basic info)
6. **Click "Add permissions"**
7. **Click "Grant admin consent for [Your Organization]"** (if you have admin rights)
   - This allows all Perkins Eastman employees to use the app

## Step 6: Configure Environment Variables

You have two options:

### Option A: Environment Variables (Recommended for Production)

Create a `.env` file in your project root (or set environment variables):

```env
AZURE_CLIENT_ID=your-client-id-here
AZURE_CLIENT_SECRET=your-client-secret-here
AZURE_TENANT_ID=your-tenant-id-here
FLASK_SECRET_KEY=your-secret-key-here
```

**For Windows (PowerShell)**:
```powershell
$env:AZURE_CLIENT_ID="your-client-id-here"
$env:AZURE_CLIENT_SECRET="your-client-secret-here"
$env:AZURE_TENANT_ID="your-tenant-id-here"
$env:FLASK_SECRET_KEY="your-secret-key-here"
```

**For Linux/Mac**:
```bash
export AZURE_CLIENT_ID="your-client-id-here"
export AZURE_CLIENT_SECRET="your-client-secret-here"
export AZURE_TENANT_ID="your-tenant-id-here"
export FLASK_SECRET_KEY="your-secret-key-here"
```

### Option B: Direct Configuration (For Testing Only)

⚠️ **NOT RECOMMENDED FOR PRODUCTION** - Edit `app.py` directly:

```python
AZURE_CLIENT_ID = 'your-client-id-here'
AZURE_CLIENT_SECRET = 'your-client-secret-here'
AZURE_TENANT_ID = 'your-tenant-id-here'
```

## Step 7: Install Dependencies

```bash
pip install -r requirements.txt
```

This will install `msal==1.28.0` (Microsoft Authentication Library).

## Step 8: Test the Authentication

1. **Start your Flask app**:
   ```bash
   python app.py
   ```

2. **Open your browser** and go to: `http://localhost:5000`

3. **You should be redirected to Microsoft login**

4. **Sign in with your Perkins Eastman email**

5. **After successful login**, you'll be redirected back to the app

## Step 9: Production Deployment

For production deployment:

1. **Update Redirect URI** in Azure Portal:
   - Add your production URL: `https://your-domain.com/getAToken`

2. **Set environment variables** on your hosting platform:
   - Azure App Service: Use "Configuration" → "Application settings"
   - Heroku: Use `heroku config:set`
   - Other platforms: Follow their environment variable documentation

3. **Update the redirect URI** in `app.py` if needed:
   ```python
   AZURE_REDIRECT_PATH = "/getAToken"  # This should match your Azure Portal setting
   ```

## Troubleshooting

### "Invalid client" error
- Check that `AZURE_CLIENT_ID` is correct
- Verify the app registration exists in Azure Portal

### "Redirect URI mismatch" error
- Ensure the redirect URI in Azure Portal matches exactly: `http://localhost:5000/getAToken`
- Check for trailing slashes or http vs https mismatches

### "AADSTS50011: The reply URL specified in the request does not match"
- Go to Azure Portal → Your App → Authentication
- Verify the redirect URI is listed and matches exactly

### Authentication not working
- Check that all three environment variables are set correctly
- Verify the client secret hasn't expired
- Check browser console for errors
- Review Flask terminal output for error messages

### "Access denied" or "Insufficient privileges"
- Ensure admin consent was granted in Azure Portal
- Check that the required API permissions are added
- Verify the user has a valid Perkins Eastman account

## Security Notes

1. **Never commit secrets to version control** (Git)
2. **Use environment variables** for all sensitive data
3. **Rotate client secrets** regularly (before expiration)
4. **Use HTTPS** in production (required for Azure AD)
5. **Restrict to single tenant** (Perkins Eastman only) for security

## Additional Resources

- [Microsoft Identity Platform Documentation](https://docs.microsoft.com/en-us/azure/active-directory/develop/)
- [MSAL Python Documentation](https://msal-python.readthedocs.io/)
- [Azure AD App Registration Guide](https://docs.microsoft.com/en-us/azure/active-directory/develop/quickstart-register-app)

