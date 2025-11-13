# Local Development Setup

## Quick Start

### 1. Install Dependencies (if not already done)
```bash
npm install
```

### 2. Create `.env.local` File

Create a file named `.env.local` in the root directory with:

```env
# Force using local CSV files instead of SharePoint (bypasses authentication)
# IMPORTANT: Both are needed - one for server-side, one for client-side
FORCE_LOCAL_CSV=true
NEXT_PUBLIC_FORCE_LOCAL_CSV=true

# Optional: If you want to test SharePoint URLs locally, uncomment these:
# NEXT_PUBLIC_ONEDRIVE_EMPLOYEES_URL=https://perkinseastman-my.sharepoint.com/.../employees.csv?download=1
# NEXT_PUBLIC_ONEDRIVE_PROJECTS_URL=https://perkinseastman-my.sharepoint.com/.../projects.csv?download=1
# NEXT_PUBLIC_ONEDRIVE_PROJECT_EMPLOYEES_URL=https://perkinseastman-my.sharepoint.com/.../project_employees.csv?download=1
```

### 3. Verify CSV Files Exist

Make sure you have CSV files in the `Data/` folder:
- `Data/employees.csv`
- `Data/projects.csv`
- `Data/project_employees.csv`

### 4. Start Development Server

```bash
npm run dev
```

The app will be available at: **http://localhost:3000**

## How It Works Locally

With `FORCE_LOCAL_CSV=true`:
- ✅ Uses local CSV files from `Data/` folder
- ✅ No authentication needed
- ✅ No SharePoint access required
- ✅ Fast development cycle
- ✅ Changes to CSV files are automatically detected

## Testing SharePoint Integration Locally

If you want to test SharePoint integration locally:

1. **Remove or comment out** `FORCE_LOCAL_CSV=true` in `.env.local`
2. **Add** your SharePoint URLs:
   ```env
   NEXT_PUBLIC_ONEDRIVE_EMPLOYEES_URL=https://perkinseastman-my.sharepoint.com/.../employees.csv?download=1
   NEXT_PUBLIC_ONEDRIVE_PROJECTS_URL=https://perkinseastman-my.sharepoint.com/.../projects.csv?download=1
   NEXT_PUBLIC_ONEDRIVE_PROJECT_EMPLOYEES_URL=https://perkinseastman-my.sharepoint.com/.../project_employees.csv?download=1
   ```
3. **Sign into SharePoint** in your browser first
4. **Restart** the dev server: `npm run dev`

**Note:** SharePoint cookies won't work with `localhost`, so you'll likely see authentication errors. The proxy endpoint will fall back to local CSV files automatically in development mode.

## Troubleshooting

### Issue: "CSV files not found"
- **Solution:** Make sure CSV files exist in `Data/` folder
- Check file names match exactly: `employees.csv`, `projects.csv`, `project_employees.csv`

### Issue: "Port 3000 already in use"
- **Solution:** Kill the process using port 3000 or use a different port:
  ```bash
  npm run dev -- -p 3001
  ```

### Issue: Changes to CSV files not reflected
- **Solution:** The app automatically detects file changes and reloads
- If not working, restart the dev server

### Issue: Still trying to fetch from SharePoint
- **Solution:** Make sure `FORCE_LOCAL_CSV=true` is set in `.env.local`
- Restart the dev server after changing `.env.local`

## Development Workflow

1. **Edit CSV files** in `Data/` folder
2. **Save changes**
3. **App automatically reloads** with new data
4. **Test changes** in browser at `http://localhost:3000`

## Available Scripts

- `npm run dev` - Start development server (port 3000)
- `npm run build` - Build for production
- `npm run start` - Start production server (after build)
- `npm run lint` - Run ESLint

