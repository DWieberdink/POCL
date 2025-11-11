# Azure App Service Deployment Guide

## Prerequisites

- Azure account (sign up at https://azure.microsoft.com/free/)
- GitHub repository: https://github.com/DWieberdink/POCL
- Azure AD app registration (for authentication)

## Step-by-Step Deployment

### Step 1: Create Azure App Service

1. **Sign in to Azure Portal**
   - Go to https://portal.azure.com
   - Sign in with your Microsoft account

2. **Create a new Web App**
   - Click "Create a resource" (or the "+" icon)
   - Search for "Web App"
   - Click "Create"

3. **Configure Basic Settings**
   - **Subscription**: Choose your subscription
   - **Resource Group**: Create new or use existing
     - Name: `perkins-eastman-rg` (or your choice)
   - **Name**: `perkins-eastman-directory` (must be globally unique)
     - Azure will check availability
   - **Publish**: Code
   - **Runtime stack**: Python 3.11 or 3.12
   - **Operating System**: Linux (recommended) or Windows
   - **Region**: Choose closest to your users (e.g., East US)
   - **App Service Plan**: 
     - Create new plan
     - Name: `perkins-eastman-plan`
     - Pricing tier: **Free F1** (for testing) or **Basic B1** (for production)
   - Click "Review + create"
   - Click "Create"

4. **Wait for deployment** (2-3 minutes)
   - You'll see "Deployment in progress..."
   - Click "Go to resource" when done

### Step 2: Configure Deployment from GitHub

1. **In your App Service, go to Deployment Center**
   - Left sidebar → "Deployment Center"

2. **Set up source**
   - **Source**: GitHub
   - Click "Authorize" if needed
   - **Organization**: Your GitHub username/organization
   - **Repository**: `POCL`
   - **Branch**: `main`
   - **Build provider**: GitHub Actions (recommended) or App Service build service
   - Click "Save"

3. **GitHub Actions will be created**
   - Azure will create `.github/workflows/` in your repo
   - First deployment will start automatically
   - You can monitor progress in "Deployment Center" → "Logs"

### Step 3: Configure Environment Variables

1. **In App Service, go to Configuration**
   - Left sidebar → "Configuration"
   - Click "Application settings" tab

2. **Add these environment variables:**
   Click "New application setting" for each:

   ```
   Name: AZURE_CLIENT_ID
   Value: [Your Azure AD Client ID]
   ```

   ```
   Name: AZURE_CLIENT_SECRET
   Value: [Your Azure AD Client Secret]
   ```

   ```
   Name: AZURE_TENANT_ID
   Value: [Your Azure AD Tenant ID]
   ```

   ```
   Name: FLASK_SECRET_KEY
   Value: [Generate a random secret key - use: python -c "import secrets; print(secrets.token_hex(32))"]
   ```

   ```
   Name: SCM_DO_BUILD_DURING_DEPLOYMENT
   Value: true
   ```

   ```
   Name: ENABLE_ORYX_BUILD
   Value: true
   ```

3. **Click "Save"** at the top
   - App will restart with new settings

### Step 4: Configure Startup Command

1. **In Configuration → General settings**
   - Scroll to "Startup Command"
   - Enter: `gunicorn --bind 0.0.0.0:8000 --timeout 600 app:app`
   - Click "Save"

### Step 5: Update Azure AD Redirect URI

1. **Go to Azure Portal → Azure Active Directory**
   - Left sidebar → "App registrations"
   - Find your app registration
   - Click on it

2. **Add Redirect URI**
   - Left sidebar → "Authentication"
   - Under "Redirect URIs", click "Add a platform"
   - Choose "Web"
   - Add your App Service URL:
     ```
     https://perkins-eastman-directory.azurewebsites.net/getAToken
     ```
   - Click "Configure"

3. **Update Front-channel logout URL** (optional):
   ```
   https://perkins-eastman-directory.azurewebsites.net/logout
   ```

### Step 6: Upload CSV Files

**Option A: Using Azure Cloud Shell (Recommended)**

1. **Open Cloud Shell**
   - Top bar → Cloud Shell icon (>_)
   - Choose Bash

2. **Upload files**
   ```bash
   # Navigate to your App Service
   cd /home
   
   # Create Data directory
   mkdir -p Data
   
   # Upload files (you'll need to download from OneDrive first)
   # Use Azure Storage Explorer or upload via portal
   ```

**Option B: Using Kudu Console**

1. **Go to Kudu**
   - URL: `https://perkins-eastman-directory.scm.azurewebsites.net`
   - Or: App Service → "Advanced Tools" → "Go"

2. **Navigate to site/wwwroot**
   - Click "Debug console" → "CMD" or "Bash"
   - Navigate to `site/wwwroot`
   - Create `Data` folder
   - Upload CSV files via drag-and-drop or file upload

**Option C: Using Azure Storage (Recommended for Production)**

1. **Create Azure Storage Account**
   - Create → Storage account
   - Create a container for CSV files

2. **Modify app.py** to read from Azure Blob Storage
   - More secure and scalable
   - See Azure Blob Storage SDK documentation

### Step 7: Verify Deployment

1. **Check deployment status**
   - App Service → "Deployment Center" → "Logs"
   - Look for successful deployment

2. **Test your app**
   - Go to: `https://perkins-eastman-directory.azurewebsites.net`
   - Should see your Flask app
   - Test Azure AD login

3. **Check logs if issues**
   - App Service → "Log stream" (real-time)
   - Or "Logs" → "Download log file"

### Step 8: Configure Custom Domain (Optional)

1. **In App Service → Custom domains**
   - Click "Add custom domain"
   - Enter your domain name
   - Follow DNS configuration instructions

## Troubleshooting

### Issue: App shows "Application Error"
- **Check logs**: App Service → "Log stream"
- **Verify startup command**: Should be `gunicorn --bind 0.0.0.0:8000 app:app`
- **Check Python version**: Should match your local version

### Issue: CSV files not found
- **Verify Data folder exists**: Use Kudu console
- **Check file paths**: Ensure CSV files are in `site/wwwroot/Data/`
- **Check permissions**: Files should be readable

### Issue: Azure AD authentication fails
- **Verify redirect URI**: Must match exactly in Azure AD
- **Check environment variables**: All three Azure AD vars must be set
- **Check logs**: Look for authentication errors

### Issue: Deployment fails
- **Check GitHub Actions**: Go to your repo → Actions tab
- **Verify requirements.txt**: All dependencies listed
- **Check build logs**: Deployment Center → Logs

## Production Checklist

- [ ] App Service created and running
- [ ] GitHub deployment configured
- [ ] Environment variables set (Azure AD + Flask secret)
- [ ] Startup command configured
- [ ] Azure AD redirect URI updated
- [ ] CSV files uploaded to Data/ folder
- [ ] HTTPS enabled (automatic with Azure)
- [ ] Custom domain configured (optional)
- [ ] Monitoring/alerts set up (optional)
- [ ] Backup configured (optional)

## Cost Estimation

- **Free Tier (F1)**: Free, but limited resources
- **Basic B1**: ~$13/month - good for small teams
- **Standard S1**: ~$70/month - better performance

## Next Steps

1. Test authentication flow
2. Verify CSV data loads correctly
3. Test all features (search, filters, export)
4. Set up monitoring/alerts
5. Configure backups
6. Share URL with your team

## Useful Azure Portal Links

- **App Service Overview**: Monitor your app
- **Log Stream**: Real-time logs
- **Metrics**: Performance metrics
- **Deployment Center**: Deployment history
- **Configuration**: Environment variables
- **Custom domains**: Domain configuration

## Support

If you encounter issues:
1. Check App Service logs
2. Review GitHub Actions deployment logs
3. Check Azure AD app registration settings
4. Verify all environment variables are set correctly

Your app will be live at: `https://[your-app-name].azurewebsites.net`

