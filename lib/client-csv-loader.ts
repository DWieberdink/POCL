// lib/client-csv-loader.ts - Client-side CSV loading utilities
'use client';

import { parse } from 'csv-parse/sync';

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

// Custom error class for authentication errors
export class SharePointAuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'SharePointAuthError';
  }
}

/**
 * Convert SharePoint link to direct download format
 */
function prepareDownloadUrl(url: string): string {
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
  
  return downloadUrl;
}

/**
 * Fetch CSV file directly from SharePoint (client-side)
 * Browser cookies will be automatically sent to SharePoint domain
 */
export async function fetchCSVFromSharePoint(url: string): Promise<string> {
  const downloadUrl = prepareDownloadUrl(url);
  
  console.log('[Client CSV Loader] Fetching CSV from:', downloadUrl.substring(0, 100) + '...');

  const response = await fetch(downloadUrl, {
    method: 'GET',
    credentials: 'include', // Include cookies for SharePoint authentication
    cache: 'no-store', // Don't cache CSV files
    redirect: 'follow',
    headers: {
      'Accept': 'text/csv,text/plain,*/*',
    }
  });

  console.log('[Client CSV Loader] Response status:', response.status, response.statusText);
  
  // Check for authentication errors (401, 403) or redirects to login
  if (response.status === 401 || response.status === 403) {
    console.log('[Client CSV Loader] Authentication error:', response.status);
    throw new SharePointAuthError('Authentication required. Please sign in with your Microsoft 365 account to access this data.');
  }

  if (!response.ok) {
    const errorText = await response.text();
    console.log('[Client CSV Loader] Error response (first 200 chars):', errorText.substring(0, 200));
    
    // Check if we got HTML instead of CSV (likely a login page)
    if (errorText.includes('<html') || errorText.includes('<!DOCTYPE') || 
        errorText.includes('Sign in') || errorText.includes('Microsoft account')) {
      console.log('[Client CSV Loader] Detected HTML login page');
      throw new SharePointAuthError('Authentication required. Please sign in with your Microsoft 365 account to access this data.');
    }
    throw new Error(`Failed to download CSV: ${response.status} ${response.statusText}`);
  }

  const content = await response.text();
  console.log('[Client CSV Loader] Successfully downloaded CSV (length:', content.length, 'chars)');
  
  // Check if response is HTML (authentication/login page)
  if (content.trim().startsWith('<!DOCTYPE') || content.trim().startsWith('<html') || 
      content.includes('<!-- Copyright (C) Microsoft Corporation') ||
      content.includes('Sign in') || content.includes('Microsoft account')) {
    console.log('[Client CSV Loader] Response is HTML login page, not CSV');
    throw new SharePointAuthError('Authentication required. Please sign in with your Microsoft 365 account to access this data.');
  }

  return content;
}

/**
 * Parse CSV content into structured data
 */
function parseCSV<T>(content: string, expectedColumns?: string[]): T[] {
  try {
    const records = parse(content, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
      bom: true, // Handle BOM (Byte Order Mark) if present
    }) as T[];
    
    return records;
  } catch (error) {
    console.error('[Client CSV Loader] Error parsing CSV:', error);
    throw new Error(`Failed to parse CSV: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Load all CSV files from SharePoint (client-side)
 * Returns parsed data ready to use
 */
export async function loadAllCSVData(): Promise<{
  employees: Employee[];
  projects: Project[];
  projectEmployees: ProjectEmployee[];
}> {
  // Get URLs from environment variables (these should be set in Vercel)
  // For client-side, we'll need to expose them via NEXT_PUBLIC_ prefix
  const employeesUrl = process.env.NEXT_PUBLIC_ONEDRIVE_EMPLOYEES_URL;
  const projectsUrl = process.env.NEXT_PUBLIC_ONEDRIVE_PROJECTS_URL;
  const projectEmployeesUrl = process.env.NEXT_PUBLIC_ONEDRIVE_PROJECT_EMPLOYEES_URL;

  if (!employeesUrl || !projectsUrl || !projectEmployeesUrl) {
    throw new Error('OneDrive URLs are not configured. Please set NEXT_PUBLIC_ONEDRIVE_* environment variables.');
  }

  try {
    // Fetch all CSV files in parallel
    const [employeesContent, projectsContent, projectEmployeesContent] = await Promise.all([
      fetchCSVFromSharePoint(employeesUrl),
      fetchCSVFromSharePoint(projectsUrl),
      fetchCSVFromSharePoint(projectEmployeesUrl),
    ]);

    // Parse CSV files
    const employees = parseCSV<Employee>(employeesContent);
    const projects = parseCSV<Project>(projectsContent);
    const projectEmployees = parseCSV<ProjectEmployee>(projectEmployeesContent);

    // Process employees: ensure EmployeeID and id are set
    const processedEmployees = employees.map((emp: any) => {
      const employeeId = emp.EmployeeID || emp.id || emp.EmployeeID;
      return {
        ...emp,
        id: emp.id || employeeId,
        EmployeeID: employeeId,
      };
    });

    // Process projects: ensure id is set
    const processedProjects = projects.map((proj: any) => ({
      ...proj,
      id: proj.id || parseInt(proj.id) || 0,
    }));

    // Process project-employee relationships: ensure IDs are numbers
    const processedProjectEmployees = projectEmployees.map((rel: any) => ({
      ProjectID: parseInt(rel.ProjectID) || 0,
      EmployeeID: parseInt(rel.EmployeeID) || 0,
    }));

    console.log('[Client CSV Loader] Loaded:', {
      employees: processedEmployees.length,
      projects: processedProjects.length,
      projectEmployees: processedProjectEmployees.length,
    });

    return {
      employees: processedEmployees,
      projects: processedProjects,
      projectEmployees: processedProjectEmployees,
    };
  } catch (error) {
    if (error instanceof SharePointAuthError) {
      throw error;
    }
    console.error('[Client CSV Loader] Error loading CSV data:', error);
    throw new Error(`Failed to load CSV data: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Get employee projects (client-side version)
 */
export function getEmployeeProjects(
  employeeId: number,
  projects: Project[],
  projectEmployees: ProjectEmployee[]
): Project[] {
  const projectIds = projectEmployees
    .filter(rel => rel.EmployeeID === employeeId)
    .map(rel => rel.ProjectID);

  const employeeProjects = projects.filter(proj => projectIds.includes(proj.id));
  
  // Ensure each project has an OpenAsset URL constructed from its ID
  const openAssetBaseUrl = process.env.NEXT_PUBLIC_OPENASSET_BASE_URL || 'https://perkinseastman.openasset.com';
  
  return employeeProjects.map(proj => {
    const openassetUrl = proj.openasset_url || (proj.id ? `${openAssetBaseUrl}/page/project/${proj.id}/` : undefined);
    
    return {
      ...proj,
      openasset_url: openassetUrl
    };
  });
}

