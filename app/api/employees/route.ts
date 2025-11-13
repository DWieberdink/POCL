// app/api/employees/route.ts - Next.js API route for employees
import { NextRequest, NextResponse } from 'next/server';
import { ensureDataLoaded, getEmployeesData, getProjectsData, getProjectEmployeesData, SharePointAuthError } from '@/lib/csv-loader';

function parseFilterList(param: string | null): string[] {
  if (!param) return [];
  return param.split(',').map(v => v.trim()).filter(v => v);
}

function matchesFilter(value: string | number | undefined, filterList: string[]): boolean {
  if (!filterList.length) return true;
  if (value === undefined || value === null) return false;
  return filterList.some(f => String(value).toLowerCase().includes(String(f).toLowerCase()));
}

function matchesExactFilter(value: string | number | undefined, filterList: string[]): boolean {
  if (!filterList.length) return true;
  if (value === undefined || value === null) return false;
  return filterList.some(f => String(value).toLowerCase() === String(f).toLowerCase());
}

function matchesRangeFilter(value: number | undefined, rangeFilters: string[]): boolean {
  if (!rangeFilters.length || value === undefined || value === null) return true;
  
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

export async function GET(request: NextRequest) {
  try {
    // Forward cookies from browser request to SharePoint for authentication
    // CSV files should be shared as "People in <YourOrg> with the link" NOT "Anyone with the link"
    const cookieHeader = request.headers.get('cookie') || undefined;
    await ensureDataLoaded(cookieHeader);
    
    const searchParams = request.nextUrl.searchParams;
    const practiceArea = parseFilterList(searchParams.get('practice_area'));
    const subPracticeArea = parseFilterList(searchParams.get('sub_practice_area'));
    const region = parseFilterList(searchParams.get('region'));
    const studio = parseFilterList(searchParams.get('studio'));
    const yearsExperience = parseFilterList(searchParams.get('years_experience'));
    const yearsAtPe = parseFilterList(searchParams.get('years_at_pe'));
    const role = parseFilterList(searchParams.get('role'));
    const jobTitleFilter = parseFilterList(searchParams.get('job_title'));
    const status = parseFilterList(searchParams.get('status'));
    const nameSearch = searchParams.get('name_search') || '';

    const employeesData = getEmployeesData();
    const projectsData = getProjectsData();
    const projectEmployeesData = getProjectEmployeesData();

    if (!employeesData.length) {
      return NextResponse.json({ employees: [], message: 'No employees found in CSV data.' });
    }

    const results = [];

    for (const emp of employeesData) {
      const firstName = emp.first_name || 'N/A';
      const lastName = emp.last_name || 'N/A';
      const jobTitle = emp.job_title || 'N/A';
      const email = emp.email || 'N/A';
      const phone = emp.work_phone || 'N/A';
      const title = emp.title || 'N/A';
      const office = emp.studio_office || emp.office || 'N/A';
      const totalYears = emp.total_years_in_industry ? parseInt(String(emp.total_years_in_industry)) : undefined;
      const employeeYearsAtPe = emp.current_years_with_this_firm ? parseInt(String(emp.current_years_with_this_firm)) : undefined;
      const employeeStatus = emp.status || 'Active';

      // Apply filters
      if (yearsExperience.length && totalYears !== undefined) {
        if (!matchesRangeFilter(totalYears, yearsExperience)) continue;
      }

      if (yearsAtPe.length && employeeYearsAtPe !== undefined) {
        if (!matchesRangeFilter(employeeYearsAtPe, yearsAtPe)) continue;
      }

      if (role.length && !matchesExactFilter(title, role)) continue;
      if (jobTitleFilter.length && !matchesExactFilter(jobTitle, jobTitleFilter)) continue;
      if (status.length && !matchesExactFilter(employeeStatus, status)) continue;
      if (studio.length && !matchesFilter(office, studio)) continue;

      // Name search
      if (nameSearch) {
        const fullName = `${firstName} ${lastName}`.toLowerCase();
        if (!fullName.includes(nameSearch.toLowerCase())) continue;
      }

      // Practice area filter - check employee's projects
      if (practiceArea.length || subPracticeArea.length || region.length) {
        const employeeProjects = projectEmployeesData
          .filter(rel => rel.EmployeeID === emp.id)
          .map(rel => projectsData.find(p => p.id === rel.ProjectID))
          .filter(Boolean);

        if (practiceArea.length) {
          const hasMatchingPracticeArea = employeeProjects.some(proj => 
            practiceArea.some(pa => matchesFilter(proj?.practice_area, [pa]))
          );
          if (!hasMatchingPracticeArea) continue;
        }

        if (subPracticeArea.length) {
          const hasMatchingSubPracticeArea = employeeProjects.some(proj => 
            subPracticeArea.some(spa => matchesFilter(proj?.sub_practice_area, [spa]))
          );
          if (!hasMatchingSubPracticeArea) continue;
        }

        if (region.length) {
          const hasMatchingRegion = employeeProjects.some(proj => 
            region.some(r => matchesFilter(proj?.region, [r]))
          );
          if (!hasMatchingRegion) continue;
        }
      }

      results.push({
        id: emp.id,
        first_name: firstName,
        last_name: lastName,
        email,
        phone,
        title,
        job_title: jobTitle,
        office,
        img_url: emp.img_url || '/placeholder-user.jpg',
        total_years_in_industry: totalYears,
        current_years_with_this_firm: employeeYearsAtPe,
        status: employeeStatus,
      });
    }

    return NextResponse.json({ employees: results });
  } catch (error: any) {
    console.error('Error in /api/employees:', error);
    
    // Handle authentication errors
    if (error instanceof SharePointAuthError) {
      return NextResponse.json({ 
        error: error.message,
        requiresAuth: true 
      }, { status: 401 });
    }
    
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

