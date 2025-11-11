# Perkins Eastman Employee Directory

A responsive web application for searching and viewing employee information at Perkins Eastman, built with Flask and React.

## Features

- 🔍 **Advanced Search**: Search employees by name, filters, and multiple criteria
- 📊 **Filter Options**: Filter by project details (practice area, sub-practice area, region) and people details (studio, experience, title, job title)
- 📱 **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices
- 🔐 **Azure AD Authentication**: Secure login using Microsoft/Azure AD for Perkins Eastman employees
- 📈 **Excel Export**: Export search results to Excel
- 👤 **Employee Profiles**: View detailed employee information and project history

## Tech Stack

- **Backend**: Flask (Python)
- **Frontend**: React 18
- **Authentication**: Microsoft Azure AD (MSAL)
- **Data Source**: CSV files (employees.csv, projects.csv, project_employees.csv)
- **Export**: openpyxl for Excel generation

## Setup Instructions

### Prerequisites

- Python 3.8 or higher
- pip (Python package manager)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd <repository-name>
   ```

2. **Install Python dependencies**
   ```bash
   pip install -r requirements.txt
   ```

3. **Set up Azure AD Authentication** (Optional but recommended for production)

   Create a `.env` file in the root directory with your Azure AD credentials:
   ```
   AZURE_CLIENT_ID=your-client-id
   AZURE_CLIENT_SECRET=your-client-secret
   AZURE_TENANT_ID=your-tenant-id
   FLASK_SECRET_KEY=your-secret-key
   ```

   **Note**: If Azure AD is not configured, the application will run without authentication (for development only).

   See `AZURE_AD_SETUP.md` for detailed Azure AD setup instructions.

4. **Add CSV Data Files**

   Place your CSV files in the `Data/` directory:
   - `Data/employees.csv`
   - `Data/projects.csv`
   - `Data/project_employees.csv`

5. **Run the application**
   ```bash
   python app.py
   ```

6. **Access the application**

   Open your browser and navigate to:
   ```
   http://localhost:5000
   ```

## Project Structure

```
.
├── app.py                 # Flask backend application
├── requirements.txt       # Python dependencies
├── templates/
│   └── index.html        # Main HTML template
├── static/
│   ├── css/
│   │   └── style.css     # Stylesheet
│   ├── js/
│   │   ├── app.js        # Original vanilla JS (legacy)
│   │   └── app-react.jsx # React application
│   └── pe-logo.png       # Perkins Eastman logo
├── Data/                 # CSV data files (not in repo)
│   ├── employees.csv
│   ├── projects.csv
│   └── project_employees.csv
└── README.md
```

## Configuration

### Azure AD Setup

1. Register your application in Azure Portal
2. Get your Client ID, Client Secret, and Tenant ID
3. Set up redirect URI: `http://localhost:5000/getAToken` (for local development)
4. Add environment variables (see Setup Instructions above)

For detailed instructions, see `AZURE_AD_SETUP.md`.

### CSV File Format

The application expects CSV files with specific columns:

**employees.csv**:
- id (or EmployeeID)
- first_name
- last_name
- email
- title
- job_title
- office
- phone
- img_url
- (and other employee fields)

**projects.csv**:
- id (or ProjectID)
- name
- practice_area
- sub_practice_area
- region
- status
- service_type
- openasset_url
- (and other project fields)

**project_employees.csv**:
- ProjectID
- EmployeeID

## Development

### Running in Development Mode

The Flask app runs in debug mode by default. To disable:
- Set `app.run(debug=False)` in `app.py`

### Frontend Development

The React app is loaded via CDN with Babel Standalone for JSX transformation. For production, consider:
- Using a build tool (Webpack, Vite, etc.)
- Pre-compiling JSX
- Minifying JavaScript

## Security Notes

- ⚠️ **Never commit** `.env` files or Azure AD credentials to version control
- ⚠️ **Never commit** CSV data files containing sensitive employee information
- ✅ Use environment variables for all sensitive configuration
- ✅ Ensure Azure AD is properly configured in production

## License

Internal use for Perkins Eastman Architects DPC.

## Support

For issues or questions, contact the development team.
