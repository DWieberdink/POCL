# Disable GitHub Pages

GitHub Pages is currently enabled but **cannot run Flask applications**. 

## To Disable GitHub Pages:

1. Go to your repository: https://github.com/DWieberdink/POCL
2. Click **Settings** (top menu)
3. Scroll down to **Pages** (left sidebar)
4. Under **Source**, select **None**
5. Click **Save**

## Why Disable?

- GitHub Pages only serves static files (HTML/CSS/JS)
- Flask requires a Python server
- Your app needs to be deployed to Vercel, Azure App Service, or similar
- Having GitHub Pages enabled is confusing since it shows README instead of your app

## After Disabling:

- Your repository will still be accessible at: `https://github.com/DWieberdink/POCL`
- You can deploy to Vercel/Azure App Service using the deployment guides
- Your app will work correctly on a proper hosting platform

## Alternative: Keep Pages with Info Page

If you want to keep GitHub Pages enabled with an informational page, I've created `docs/index.html` that explains the app needs proper deployment. You can:

1. Keep Pages enabled
2. Set source to `docs/` folder
3. Users will see an informational page instead of README

But **disabling Pages is recommended** since it's less confusing.

