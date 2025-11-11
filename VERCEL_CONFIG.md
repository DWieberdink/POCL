# Vercel Configuration File

This `vercel.json` configures Vercel to run your Flask application as a serverless function.

## Configuration Details

- **Build**: Uses `@vercel/python` to build the Python function
- **Routes**: 
  - `/static/*` files are served directly
  - All other routes go to the Flask app handler
- **Python Version**: 3.11

## Function Timeout

If you need longer timeouts (default is 10s on free tier), you can:
1. Upgrade to Vercel Pro (30s timeout)
2. Or optimize your Flask app to respond faster

## Note

The `functions` property was removed because it conflicts with `builds` in Vercel's configuration.
Timeout settings are now managed through Vercel dashboard → Project Settings → Functions.

