# POCL - Perkins Eastman Employee Directory

A modern, responsive web application for searching and viewing employee information at Perkins Eastman, built with Next.js and React.

## Features

- 🔍 **Advanced Search**: Search employees by name, filters, and multiple criteria
- 📊 **Filter Options**: 
  - Filter by Project Details (practice area, sub-practice area, region)
  - Filter by People Details (studio, experience, title, job title)
- 📱 **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices
- 📈 **Excel Export**: Export search results to Excel
- 👤 **Employee Profiles**: View detailed employee information and project history

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Backend**: Next.js API Routes
- **Data Source**: CSV files from OneDrive/SharePoint
- **Export**: ExcelJS for Excel generation
- **Styling**: CSS with Font Awesome icons

## Setup Instructions

### Prerequisites

- Node.js 18+ and npm
- OneDrive/SharePoint URLs for CSV files (configured via environment variables)

### Installation

1. Clone the repository
   ```bash
   git clone <repository-url>
   cd <repository-name>
   ```

2. Install dependencies
   ```bash
   npm install
   ```

3. Set up environment variables
   
   Create a `.env.local` file in the root directory:
   ```
   ONEDRIVE_EMPLOYEES_URL=https://...
   ONEDRIVE_PROJECTS_URL=https://...
   ONEDRIVE_PROJECT_EMPLOYEES_URL=https://...
   ```

4. Run the development server
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

```
.
├── app/
│   ├── api/              # Next.js API routes
│   │   ├── employees/
│   │   ├── practice-areas/
│   │   ├── sub-practice-areas/
│   │   ├── employee/[id]/projects/
│   │   └── export/employees/
│   ├── page.tsx          # Main page component
│   ├── layout.tsx        # Root layout
│   └── employee-directory.css  # Styles
├── components/           # React components
│   ├── MultiSelect.tsx
│   ├── FilterSection.tsx
│   ├── EmployeeCard.tsx
│   └── EmployeeModal.tsx
├── lib/
│   └── csv-loader.ts     # CSV loading utilities
├── public/               # Static assets
└── package.json
```

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import your repository in Vercel
3. Add environment variables in Vercel dashboard:
   - `ONEDRIVE_EMPLOYEES_URL`
   - `ONEDRIVE_PROJECTS_URL`
   - `ONEDRIVE_PROJECT_EMPLOYEES_URL`
4. Deploy!

Vercel will automatically detect Next.js and deploy your application.

### Other Platforms

This Next.js application can be deployed to:
- **Vercel** (recommended - zero config)
- **Netlify**
- **Railway**
- **Render**
- Any platform that supports Next.js

## CSV Data Files

The application loads CSV files from OneDrive/SharePoint URLs configured via environment variables. The CSV files should contain:

- **employees.csv**: Employee information
- **projects.csv**: Project information
- **project_employees.csv**: Employee-project relationships

See `ONEDRIVE_INTEGRATION.md` for details on setting up OneDrive URLs.

## Development

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Security Notes

⚠️ **Never commit sensitive data:**
- Never commit CSV files containing employee information
- Never commit `.env.local` or environment variables
- Use environment variables for all sensitive configuration

## License

Internal use for Perkins Eastman Architects DPC.

## Support

For issues or questions, contact the development team.
