// lib/csv-loader.ts - CSV loading utilities for Next.js
import { parse } from 'csv-parse/sync';
import { readFileSync } from 'fs';
import { join } from 'path';

export interface Employee {
  id: number;
  EmployeeID: number;
  first_name: string;
  last_name: string;
  email: string;
  title?: string;
  job_title?: string;
  office?: string;
  studio_office?: string;
  work_phone?: string;
  total_years_in_industry?: number;
  current_years_with_this_firm?: number;
  status?: string;
  img_url?: string;
  [key: string]: any;
}

export interface Project {
  id: number;
  name: string;
  practice_area?: string;
  sub_practice_area?: string;
  region?: string;
  status?: string;
  service_type?: string;
  openasset_url?: string;
  [key: string]: any;
}

export interface ProjectEmployee {
  ProjectID: number;
  EmployeeID: number;
  [key: string]: any;
}

let employeesData: Employee[] = [];
let projectsData: Project[] = [];
let projectEmployeesData: ProjectEmployee[] = [];
let dataLoadPromise: Promise<void> | null = null;

async function downloadFromOneDrive(url: string): Promise<string> {
  // Convert SharePoint link to direct download if needed
  let downloadUrl = url;
  if (url.includes('web=1')) {
    downloadUrl = url.replace('web=1', 'download=1');
  } else if (!url.includes('download=1') && !url.includes('web=1')) {
    const separator = url.includes('?') ? '&' : '?';
    downloadUrl = `${url}${separator}download=1`;
  }

  const response = await fetch(downloadUrl, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    },
    cache: 'no-store' // Don't cache CSV files
  });

  if (!response.ok) {
    throw new Error(`Failed to download CSV: ${response.statusText}`);
  }

  return await response.text();
}

async function loadCSVData() {
  const onedriveEmployeesUrl = process.env.ONEDRIVE_EMPLOYEES_URL || '';
  const onedriveProjectsUrl = process.env.ONEDRIVE_PROJECTS_URL || '';
  const onedriveProjectEmployeesUrl = process.env.ONEDRIVE_PROJECT_EMPLOYEES_URL || '';

  const useOneDrive = !!(onedriveEmployeesUrl || onedriveProjectsUrl || onedriveProjectEmployeesUrl);

  try {
    let employeesContent: string;
    let projectsContent: string;
    let projectEmployeesContent: string;

    if (useOneDrive) {
      // Load from OneDrive
      employeesContent = await downloadFromOneDrive(onedriveEmployeesUrl);
      projectsContent = await downloadFromOneDrive(onedriveProjectsUrl);
      projectEmployeesContent = await downloadFromOneDrive(onedriveProjectEmployeesUrl);
    } else {
      // Load from local files (for local development)
      const dataDir = join(process.cwd(), 'Data');
      employeesContent = readFileSync(join(dataDir, 'employees.csv'), 'utf-8');
      projectsContent = readFileSync(join(dataDir, 'projects.csv'), 'utf-8');
      projectEmployeesContent = readFileSync(join(dataDir, 'project_employees.csv'), 'utf-8');
    }

    // Parse employees
    const employeesRecords = parse(employeesContent, {
      columns: true,
      skip_empty_lines: true,
      bom: true
    }) as any[];

    employeesData = employeesRecords.map(emp => {
      const empId = emp.id || emp.EmployeeID || 0;
      return {
        ...emp,
        id: parseInt(String(empId)) || 0,
        EmployeeID: parseInt(String(empId)) || 0,
        total_years_in_industry: emp.total_years_in_industry ? parseInt(String(emp.total_years_in_industry)) : undefined,
        current_years_with_this_firm: emp.current_years_with_this_firm ? parseInt(String(emp.current_years_with_this_firm)) : undefined,
      };
    });

    // Parse projects
    const projectsRecords = parse(projectsContent, {
      columns: true,
      skip_empty_lines: true,
      bom: true
    }) as any[];

    projectsData = projectsRecords.map(proj => ({
      ...proj,
      id: parseInt(String(proj.id)) || 0,
    }));

    // Parse project-employee relationships
    const projectEmployeesRecords = parse(projectEmployeesContent, {
      columns: true,
      skip_empty_lines: true,
      bom: true
    }) as any[];

    projectEmployeesData = projectEmployeesRecords.map(rel => ({
      ...rel,
      ProjectID: parseInt(String(rel.ProjectID)) || 0,
      EmployeeID: parseInt(String(rel.EmployeeID)) || 0,
    }));

    console.log(`Loaded ${employeesData.length} employees, ${projectsData.length} projects, ${projectEmployeesData.length} relationships`);
  } catch (error) {
    console.error('Error loading CSV data:', error);
    throw error;
  }
}

export function ensureDataLoaded(): Promise<void> {
  // If data is already loaded, return immediately
  if (employeesData.length > 0 && projectsData.length > 0) {
    return Promise.resolve();
  }

  // If a load is already in progress, return that promise
  if (dataLoadPromise) {
    return dataLoadPromise;
  }

  // Start loading
  dataLoadPromise = loadCSVData();
  return dataLoadPromise;
}

export function getEmployeesData(): Employee[] {
  return employeesData;
}

export function getProjectsData(): Project[] {
  return projectsData;
}

export function getProjectEmployeesData(): ProjectEmployee[] {
  return projectEmployeesData;
}

export function getEmployeeProjects(employeeId: number): Project[] {
  const projectIds = projectEmployeesData
    .filter(rel => rel.EmployeeID === employeeId)
    .map(rel => rel.ProjectID);

  return projectsData.filter(proj => projectIds.includes(proj.id));
}

// Initialize data on module load (for serverless, this will run on cold start)
if (typeof window === 'undefined') {
  ensureDataLoaded().catch(console.error);
}

