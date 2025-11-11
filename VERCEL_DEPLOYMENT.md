# Vercel Deployment Guide for Flask Application

## Overview

Vercel supports Python serverless functions, but Flask apps need to be adapted. This guide shows you how to deploy your Flask app to Vercel.

## Important Considerations

⚠️ **Limitations:**
- Vercel uses serverless functions (not long-running servers)
- Each request is handled independently
- CSV files should be committed to the repo (or use external storage)
- File system is read-only except `/tmp`
- Cold starts may occur (first request slower)

✅ **Benefits:**
- Free tier available
- Automatic HTTPS
- Easy GitHub integration
- Global CDN
- Auto-deploys on push

## Step-by-Step Deployment

### Step 1: Prepare Your Code

The code is already prepared with:
- `vercel.json` - Vercel configuration
- `api/index.py` - Serverless function handler

### Step 2: Add CSV Files to Repository (Required for Vercel)

Since Vercel's file system is read-only, you have two options:

**Option A: Commit CSV files (Simplest)**
1. Remove CSV files from `.gitignore` temporarily:
   ```bash
   # Edit .gitignore, comment out:
   # Data/*.csv
   ```
2. Add CSV files:
   ```bash
   git add Data/*.csv
   git commit -m "Add CSV files for Vercel deployment"
   git push
   ```

**Option B: Use External Storage (More Secure)**
- Store CSV files in Azure Blob Storage, AWS S3, or similar
- Modify `app.py` to read from cloud storage
- Keep CSV files out of git

### Step 3: Deploy to Vercel

1. **Sign up/Login to Vercel**
   - Go to https://vercel.com
   - Sign in with GitHub

2. **Import Project**
   - Click "Add New..." → "Project"
   - Import from GitHub: `DWieberdink/POCL`
   - Click "Import"

3. **Configure Project**
   - **Framework Preset**: Other
   - **Root Directory**: `./` (root)
   - **Build Command**: Leave empty (Vercel will auto-detect)
   - **Output Directory**: Leave empty
   - **Install Command**: `pip install -r requirements.txt`

4. **Add Environment Variables**
   Click "Environment Variables" and add:
   ```
   AZURE_CLIENT_ID = [your-client-id]
   AZURE_CLIENT_SECRET = [your-client-secret]
   AZURE_TENANT_ID = [your-tenant-id]
   FLASK_SECRET_KEY = [generate: python -c "import secrets; print(secrets.token_hex(32))"]
   ```

5. **Deploy**
   - Click "Deploy"
   - Wait for build to complete (2-5 minutes)
   - Your app will be live!

### Step 4: Update Azure AD Redirect URI

1. **Get your Vercel URL**
   - After deployment, you'll get: `https://pocl-[hash].vercel.app`
   - Or your custom domain if configured

2. **Update Azure AD**
   - Azure Portal → Azure AD → App registrations
   - Your app → Authentication
   - Add redirect URI:
     ```
     https://your-app.vercel.app/getAToken
     ```
   - Click "Save"

### Step 5: Configure Custom Domain (Optional)

1. **In Vercel Dashboard**
   - Go to your project → Settings → Domains
   - Add your domain
   - Follow DNS configuration instructions

## File Structure for Vercel

```
.
├── api/
│   └── index.py          # Serverless function handler
├── app.py                # Flask application
├── vercel.json           # Vercel configuration
├── requirements.txt       # Python dependencies
├── Data/                 # CSV files (committed for Vercel)
│   ├── employees.csv
│   ├── projects.csv
│   └── project_employees.csv
└── static/              # Static files
    └── ...
```

## Important Code Changes for Vercel

The `api/index.py` file wraps your Flask app for Vercel's serverless environment. Your main `app.py` doesn't need changes.

## Troubleshooting

### Issue: "Module not found" errors
- **Solution**: Ensure all dependencies are in `requirements.txt`
- Check Vercel build logs for missing packages

### Issue: CSV files not found
- **Solution**: Make sure CSV files are committed to git
- Or use external storage (Azure Blob Storage, S3)

### Issue: Cold starts are slow
- **Solution**: This is normal for serverless
- Consider Vercel Pro plan for better performance
- Or use Azure App Service for always-on server

### Issue: Azure AD redirect fails
- **Solution**: Verify redirect URI matches exactly
- Check environment variables are set correctly

### Issue: Session not persisting
- **Solution**: Vercel serverless functions are stateless
- Consider using Vercel KV (Redis) for sessions
- Or use JWT tokens instead of sessions

## Vercel vs Azure App Service

| Feature | Vercel | Azure App Service |
|---------|--------|-------------------|
| **Cost** | Free tier available | Free tier limited |
| **Performance** | Serverless (cold starts) | Always-on server |
| **File Storage** | Read-only (need git or external) | Full file system |
| **Best For** | Static + API | Full Flask apps |
| **Azure AD** | ✅ Works | ✅ Native integration |
| **CSV Files** | Need to commit or use storage | Can upload directly |

## Recommendation

**For your use case (Flask + CSV files + Azure AD):**
- **Azure App Service** is recommended because:
  - Better for Flask applications
  - Easier CSV file management
  - Native Azure integration
  - No cold starts

**Vercel is good if:**
- You want free hosting
- You're okay committing CSV files
- You want automatic deployments
- You don't mind serverless limitations

## Next Steps

1. Choose: Vercel (serverless) or Azure App Service (full server)
2. If Vercel: Commit CSV files or set up external storage
3. Deploy and test
4. Update Azure AD redirect URI
5. Share URL with your team

Your app will be live at: `https://your-app.vercel.app`

