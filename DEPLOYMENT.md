# Deployment Guide for Perkins Eastman Employee Directory

## Why GitHub Pages Won't Work

GitHub Pages (https://dwieberdink.github.io/POCL/) only serves **static websites** (HTML, CSS, JavaScript). It cannot run:
- Python/Flask applications
- Server-side code
- Backend APIs

Your Flask application needs a platform that can execute Python code.

## Recommended Deployment Options

### Option 1: Azure App Service (Recommended for Azure AD Integration)

Since you're using Azure AD authentication, Azure App Service is the best choice:

**Steps:**
1. Go to [Azure Portal](https://portal.azure.com)
2. Create a new "Web App" resource
3. Choose Python runtime (3.8 or higher)
4. Configure deployment from GitHub
5. Set environment variables:
   - `AZURE_CLIENT_ID`
   - `AZURE_CLIENT_SECRET`
   - `AZURE_TENANT_ID`
   - `FLASK_SECRET_KEY`
6. Upload CSV files to the server (via FTP or Azure Storage)
7. Update Azure AD redirect URI to your production URL

**Benefits:**
- Native Azure AD integration
- Easy environment variable management
- Automatic HTTPS
- Scales easily

### Option 2: Render (Free Tier Available)

**Steps:**
1. Go to [Render](https://render.com)
2. Connect your GitHub repository
3. Create a new "Web Service"
4. Choose Python environment
5. Set build command: `pip install -r requirements.txt`
6. Set start command: `python app.py` or `gunicorn app:app`
7. Add environment variables in dashboard
8. Upload CSV files via Render's file system or S3

**Benefits:**
- Free tier available
- Easy GitHub integration
- Automatic deployments

### Option 3: Railway

**Steps:**
1. Go to [Railway](https://railway.app)
2. Connect GitHub repository
3. Deploy automatically
4. Add environment variables
5. Upload CSV files

### Option 4: PythonAnywhere

**Steps:**
1. Sign up at [PythonAnywhere](https://www.pythonanywhere.com)
2. Upload your code via Git or file upload
3. Configure web app
4. Set environment variables
5. Upload CSV files to the server

## Important: CSV Files

Since CSV files are excluded from git (for security), you'll need to:

1. **Upload them separately** to your hosting platform
2. **Place them in the `Data/` folder** on the server
3. **Or use a secure storage solution** like:
   - Azure Blob Storage
   - AWS S3
   - Google Cloud Storage
   - Then modify `app.py` to read from cloud storage

## Quick Start: Render Deployment

Here's a quick guide for Render (easiest free option):

1. **Create `render.yaml`** (optional, for configuration):
```yaml
services:
  - type: web
    name: perkins-eastman-directory
    env: python
    buildCommand: pip install -r requirements.txt
    startCommand: gunicorn app:app
    envVars:
      - key: AZURE_CLIENT_ID
        sync: false
      - key: AZURE_CLIENT_SECRET
        sync: false
      - key: AZURE_TENANT_ID
        sync: false
      - key: FLASK_SECRET_KEY
        generateValue: true
```

2. **Create `Procfile`** (for Render/Heroku):
```
web: gunicorn app:app
```

3. **Update `requirements.txt`** to include gunicorn:
```
Flask==2.3.3
Flask-CORS==4.0.0
Werkzeug==2.3.7
openpyxl==3.1.2
msal==1.28.0
gunicorn==21.2.0
```

4. **Deploy:**
   - Connect GitHub repo to Render
   - Render will auto-detect Python
   - Add environment variables
   - Deploy!

## Disable GitHub Pages (Optional)

If you want to disable GitHub Pages since it won't work for Flask:

1. Go to your repository settings
2. Scroll to "Pages" section
3. Set source to "None"
4. Save

The repository will still be accessible at: `https://github.com/DWieberdink/POCL`

## Next Steps

1. Choose a deployment platform (Azure App Service recommended)
2. Set up environment variables
3. Upload CSV files securely
4. Configure Azure AD redirect URI for production
5. Test authentication
6. Share the production URL with your team

Need help with a specific platform? Let me know!

