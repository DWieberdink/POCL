# GitHub Setup Instructions

## Step 1: Create a GitHub Repository

1. Go to [GitHub](https://github.com) and sign in
2. Click the "+" icon in the top right corner
3. Select "New repository"
4. Name your repository (e.g., `perkins-eastman-employee-directory`)
5. Choose visibility (Private recommended for internal use)
6. **DO NOT** initialize with README, .gitignore, or license (we already have these)
7. Click "Create repository"

## Step 2: Add GitHub Remote and Push

After creating the repository, GitHub will show you commands. Run these in your terminal:

```bash
# Add the remote (replace YOUR_USERNAME and REPO_NAME with your actual values)
git remote add origin https://github.com/YOUR_USERNAME/REPO_NAME.git

# Rename branch to main (if needed)
git branch -M main

# Push to GitHub
git push -u origin main
```

## Step 3: Verify Azure AD Configuration

The application is configured to use environment variables for Azure AD credentials. Make sure:

1. **Never commit** `.env` files or Azure AD secrets
2. Set environment variables on your deployment platform:
   - `AZURE_CLIENT_ID`
   - `AZURE_CLIENT_SECRET`
   - `AZURE_TENANT_ID`
   - `FLASK_SECRET_KEY`

### For Local Development

Create a `.env` file (already in .gitignore):
```
AZURE_CLIENT_ID=your-client-id
AZURE_CLIENT_SECRET=your-client-secret
AZURE_TENANT_ID=your-tenant-id
FLASK_SECRET_KEY=your-secret-key
```

### For Production Deployment

Set environment variables in your hosting platform:
- **Azure App Service**: Configuration → Application settings
- **Heroku**: Settings → Config Vars
- **AWS**: Environment variables in your deployment configuration
- **Other platforms**: Follow their documentation for setting environment variables

## Step 4: Verify CSV Files Are Not Committed

The `.gitignore` file is configured to exclude CSV files from the repository. Verify:

```bash
git status
```

You should NOT see `Data/*.csv` files in the output.

## Security Checklist

- ✅ Azure AD credentials are in environment variables (not in code)
- ✅ CSV files are excluded from git (in .gitignore)
- ✅ `.env` files are excluded from git
- ✅ Flask secret key is in environment variable
- ✅ Repository is private (if containing sensitive information)

## Next Steps

1. Push your code to GitHub
2. Set up your deployment platform
3. Configure environment variables on your hosting platform
4. Deploy the application
5. Test Azure AD authentication

For detailed Azure AD setup, see `AZURE_AD_SETUP.md`.

