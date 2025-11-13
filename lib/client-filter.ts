// lib/client-filter.ts - Client-side filtering utilities
'use client';

import { Employee, Project, ProjectEmployee } from './client-csv-loader';

export interface FilterParams {
  practiceArea?: string[];
  subPracticeArea?: string[];
  region?: string[];
  studio?: string[];
  yearsExperience?: string[];
  yearsAtPE?: string[];
  role?: string[];
  jobTitle?: string[];
  nameSearch?: string;
}

function matchesFilter(value: string | number | undefined, filterList: string[]): boolean {
  if (!filterList || filterList.length === 0) return true;
  if (value === undefined || value === null) return false;
  return filterList.some(f => String(value).toLowerCase().includes(String(f).toLowerCase()));
}

function matchesExactFilter(value: string | number | undefined, filterList: string[]): boolean {
  if (!filterList || filterList.length === 0) return true;
  if (value === undefined || value === null) return false;
  return filterList.some(f => String(value).toLowerCase() === String(f).toLowerCase());
}

function matchesRangeFilter(value: number | undefined, rangeFilters: string[]): boolean {
  if (!rangeFilters || rangeFilters.length === 0 || value === undefined || value === null) return true;
  
  for (const rangeFilter of rangeFilters) {
    if (rangeFilter.includes('-')) {
      const [min, max] = rangeFilter.split('-').map(v => parseInt(v.trim()));
      if (!isNaN(min) && !isNaN(max) && min <= value && value <= max) {
        return true;
      }
    } else if (rangeFilter.endsWith('+')) {
      const min = parseInt(rangeFilter.slice(0, -1));
      if (!isNaN(min) && value >= min) {
        return true;
      }
    }
  }
  return false;
}

/**
 * Filter employees based on search criteria
 */
export function filterEmployees(
  employees: Employee[],
  projects: Project[],
  projectEmployees: ProjectEmployee[],
  filters: FilterParams
): Employee[] {
  const {
    practiceArea = [],
    subPracticeArea = [],
    region = [],
    studio = [],
    yearsExperience = [],
    yearsAtPE = [],
    role = [],
    jobTitle = [],
    nameSearch = '',
  } = filters;

  return employees.filter(emp => {
    // Name search
    if (nameSearch.trim()) {
      const searchTerm = nameSearch.toLowerCase().trim();
      const fullName = `${emp.first_name} ${emp.last_name}`.toLowerCase();
      const firstName = emp.first_name?.toLowerCase() || '';
      const lastName = emp.last_name?.toLowerCase() || '';
      if (!fullName.includes(searchTerm) && 
          !firstName.includes(searchTerm) && 
          !lastName.includes(searchTerm)) {
        return false;
      }
    }

    // Studio filter (exact match)
    if (!matchesExactFilter(emp.studio_office || emp.office, studio)) {
      return false;
    }

    // Role filter (exact match)
    if (!matchesExactFilter(emp.title, role)) {
      return false;
    }

    // Job title filter
    if (!matchesFilter(emp.job_title, jobTitle)) {
      return false;
    }

    // Years experience filter
    if (!matchesRangeFilter(emp.total_years_in_industry, yearsExperience)) {
      return false;
    }

    // Years at PE filter
    if (!matchesRangeFilter(emp.current_years_with_this_firm, yearsAtPE)) {
      return false;
    }

    // Practice area and sub-practice area filters (based on projects)
    if (practiceArea.length > 0 || subPracticeArea.length > 0 || region.length > 0) {
      const employeeProjectIds = projectEmployees
        .filter(rel => rel.EmployeeID === emp.EmployeeID || rel.EmployeeID === emp.id)
        .map(rel => rel.ProjectID);

      const employeeProjects = projects.filter(proj => 
        employeeProjectIds.includes(proj.id)
      );

      if (practiceArea.length > 0) {
        const hasMatchingPracticeArea = employeeProjects.some(proj =>
          matchesFilter(proj.practice_area, practiceArea)
        );
        if (!hasMatchingPracticeArea) return false;
      }

      if (subPracticeArea.length > 0) {
        const hasMatchingSubPracticeArea = employeeProjects.some(proj =>
          matchesFilter(proj.sub_practice_area, subPracticeArea)
        );
        if (!hasMatchingSubPracticeArea) return false;
      }

      if (region.length > 0) {
        const hasMatchingRegion = employeeProjects.some(proj =>
          matchesFilter(proj.region, region)
        );
        if (!hasMatchingRegion) return false;
      }
    }

    return true;
  });
}

/**
 * Extract unique practice areas from projects
 */
export function getPracticeAreas(projects: Project[]): string[] {
  const practiceAreas = new Set<string>();
  projects.forEach(proj => {
    if (proj.practice_area) {
      practiceAreas.add(proj.practice_area);
    }
  });
  return Array.from(practiceAreas).sort();
}

/**
 * Extract unique sub-practice areas from projects
 */
export function getSubPracticeAreas(projects: Project[]): string[] {
  const subPracticeAreas = new Set<string>();
  projects.forEach(proj => {
    if (proj.sub_practice_area) {
      subPracticeAreas.add(proj.sub_practice_area);
    }
  });
  return Array.from(subPracticeAreas).sort();
}

