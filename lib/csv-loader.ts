// lib/csv-loader.ts - CSV loading utilities for Next.js
import { parse } from 'csv-parse/sync';
import { readFileSync, statSync } from 'fs';
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
let lastLoadTime: { employees: number; projects: number; projectEmployees: number } | null = null;

// Custom error class for authentication errors
export class SharePointAuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'SharePointAuthError';
  }
}

async function downloadFromSharePointDirect(url: string, cookieHeader?: string): Promise<string> {
  // Convert SharePoint link to direct download format
  // SharePoint URLs format: .../Documents/.../file.csv?d=...&csf=1&web=1&e=...
  // Need to convert to: .../Documents/.../file.csv?download=1
  
  let downloadUrl = url;
  
  // Remove web=1 and e= parameters, add download=1
  if (url.includes('web=1')) {
    downloadUrl = url.replace(/[?&]web=1/g, '').replace(/[?&]e=[^&]*/g, '').replace(/[?&]csf=1/g, '');
    // Clean up any double ? or &
    downloadUrl = downloadUrl.replace(/\?&/, '?').replace(/&+/g, '&').replace(/\?$/, '');
    // Add download=1
    const separator = downloadUrl.includes('?') ? '&' : '?';
    downloadUrl = `${downloadUrl}${separator}download=1`;
  } else if (!url.includes('download=1')) {
    // If no web=1, try adding download=1
    const separator = url.includes('?') ? '&' : '?';
    downloadUrl = `${url}${separator}download=1`;
  }

  const headers: HeadersInit = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'text/csv,text/plain,*/*',
    'Accept-Language': 'en-US,en;q=0.9'
  };

  // Forward cookies from the browser request to SharePoint
  // This allows SharePoint to authenticate the user based on their browser session
  if (cookieHeader) {
    headers['Cookie'] = cookieHeader;
    console.log('[CSV Loader] Forwarding cookies to SharePoint (length:', cookieHeader.length, 'chars)');
  } else {
    console.log('[CSV Loader] No cookies provided - request will likely require authentication');
  }
  
  console.log('[CSV Loader] Fetching CSV from:', downloadUrl.substring(0, 100) + '...');

  const response = await fetch(downloadUrl, {
    headers,
    cache: 'no-store', // Don't cache CSV files
    redirect: 'follow'
  });

  console.log('[CSV Loader] Response status:', response.status, response.statusText);
  
  // Check for authentication errors (401, 403) or redirects to login
  if (response.status === 401 || response.status === 403) {
    console.log('[CSV Loader] Authentication error:', response.status);
    throw new SharePointAuthError('Authentication required. Please sign in with your Microsoft 365 account to access this data.');
  }

  if (!response.ok) {
    const errorText = await response.text();
    console.log('[CSV Loader] Error response (first 200 chars):', errorText.substring(0, 200));
    
    // Check if we got HTML instead of CSV (likely a login page)
    if (errorText.includes('<html') || errorText.includes('<!DOCTYPE') || 
        errorText.includes('Sign in') || errorText.includes('Microsoft account')) {
      console.log('[CSV Loader] Detected HTML login page');
      throw new SharePointAuthError('Authentication required. Please sign in with your Microsoft 365 account to access this data.');
    }
    throw new Error(`Failed to download CSV: ${response.status} ${response.statusText}`);
  }

  const content = await response.text();
  console.log('[CSV Loader] Successfully downloaded CSV (length:', content.length, 'chars)');
  
  // Check if response is HTML (authentication/login page)
  if (content.trim().startsWith('<!DOCTYPE') || content.trim().startsWith('<html') || 
      content.includes('<!-- Copyright (C) Microsoft Corporation') ||
      content.includes('Sign in') || content.includes('Microsoft account')) {
    console.log('[CSV Loader] Response is HTML login page, not CSV');
    throw new SharePointAuthError('Authentication required. Please sign in with your Microsoft 365 account to access this data.');
  }

  return content;
}

async function loadCSVData(cookieHeader?: string) {
  const onedriveEmployeesUrl = process.env.ONEDRIVE_EMPLOYEES_URL || '';
  const onedriveProjectsUrl = process.env.ONEDRIVE_PROJECTS_URL || '';
  const onedriveProjectEmployeesUrl = process.env.ONEDRIVE_PROJECT_EMPLOYEES_URL || '';

  const useOneDrive = !!(onedriveEmployeesUrl || onedriveProjectsUrl || onedriveProjectEmployeesUrl);

  try {
    let employeesContent: string;
    let projectsContent: string;
    let projectEmployeesContent: string;

    if (useOneDrive) {
      // Load from OneDrive/SharePoint - relies on browser cookies for authentication
      // CSV files should be shared as "People in <YourOrg> with the link" NOT "Anyone with the link"
      // Cookies are forwarded from the browser request to authenticate with SharePoint
      employeesContent = await downloadFromSharePointDirect(onedriveEmployeesUrl, cookieHeader);
      projectsContent = await downloadFromSharePointDirect(onedriveProjectsUrl, cookieHeader);
      projectEmployeesContent = await downloadFromSharePointDirect(onedriveProjectEmployeesUrl, cookieHeader);
    } else {
      // Load from local files (for local development)
      const dataDir = join(process.cwd(), 'Data');
      const employeesPath = join(dataDir, 'employees.csv');
      const projectsPath = join(dataDir, 'projects.csv');
      const projectEmployeesPath = join(dataDir, 'project_employees.csv');
      
      employeesContent = readFileSync(employeesPath, 'utf-8');
      projectsContent = readFileSync(projectsPath, 'utf-8');
      projectEmployeesContent = readFileSync(projectEmployeesPath, 'utf-8');
      
      // Store file modification times for cache invalidation
      lastLoadTime = {
        employees: statSync(employeesPath).mtimeMs,
        projects: statSync(projectsPath).mtimeMs,
        projectEmployees: statSync(projectEmployeesPath).mtimeMs
      };
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

export function ensureDataLoaded(cookieHeader?: string): Promise<void> {
  const onedriveEmployeesUrl = process.env.ONEDRIVE_EMPLOYEES_URL || '';
  const onedriveProjectsUrl = process.env.ONEDRIVE_PROJECTS_URL || '';
  const onedriveProjectEmployeesUrl = process.env.ONEDRIVE_PROJECT_EMPLOYEES_URL || '';
  const useOneDrive = !!(onedriveEmployeesUrl || onedriveProjectsUrl || onedriveProjectEmployeesUrl);

  // For local CSV files, check if files have been modified since last load
  if (!useOneDrive && lastLoadTime) {
    try {
      const dataDir = join(process.cwd(), 'Data');
      const employeesStat = statSync(join(dataDir, 'employees.csv'));
      const projectsStat = statSync(join(dataDir, 'projects.csv'));
      const projectEmployeesStat = statSync(join(dataDir, 'project_employees.csv'));

      // If any file has been modified, clear cache and reload
      if (
        employeesStat.mtimeMs > lastLoadTime.employees ||
        projectsStat.mtimeMs > lastLoadTime.projects ||
        projectEmployeesStat.mtimeMs > lastLoadTime.projectEmployees
      ) {
        console.log('CSV files modified, reloading data...');
        employeesData = [];
        projectsData = [];
        projectEmployeesData = [];
        dataLoadPromise = null;
        lastLoadTime = null;
      }
    } catch (error) {
      // If we can't check file times, continue with normal flow
      console.warn('Could not check file modification times:', error);
    }
  }

  // If data is already loaded, return immediately
  if (employeesData.length > 0 && projectsData.length > 0) {
    return Promise.resolve();
  }

  // If a load is already in progress, return that promise
  if (dataLoadPromise) {
    return dataLoadPromise;
  }

  // Start loading - relies on SharePoint permissions via browser cookies
  // Cookie header is forwarded from the browser request to authenticate with SharePoint
  dataLoadPromise = loadCSVData(cookieHeader);
  return dataLoadPromise;
}

// Function to manually clear cache (useful for development)
export function clearDataCache(): void {
  employeesData = [];
  projectsData = [];
  projectEmployeesData = [];
  dataLoadPromise = null;
  lastLoadTime = null;
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

  const projects = projectsData.filter(proj => projectIds.includes(proj.id));
  
  // Ensure each project has an OpenAsset URL constructed from its ID
  // OpenAsset URL format: https://perkinseastman.openasset.com/page/project/{id}/
  const openAssetBaseUrl = process.env.OPENASSET_BASE_URL || 'https://perkinseastman.openasset.com';
  
  return projects.map(proj => {
    // Use existing URL if present, otherwise construct from ID
    // Correct format: /page/project/{id}/
    const openassetUrl = proj.openasset_url || (proj.id ? `${openAssetBaseUrl}/page/project/${proj.id}/` : undefined);
    
    return {
      ...proj,
      openasset_url: openassetUrl
    };
  });
}

// Initialize data on module load (for serverless, this will run on cold start)
if (typeof window === 'undefined') {
  ensureDataLoaded().catch(console.error);
}

