// app/api/export/employees/route.ts - Excel export endpoint
import { NextRequest, NextResponse } from 'next/server';
import ExcelJS from 'exceljs';
import { ensureDataLoaded, getEmployeesData, getProjectsData, getProjectEmployeesData } from '@/lib/csv-loader';

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
    await ensureDataLoaded();
    
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
      return NextResponse.json({ error: 'No employees found in CSV data' }, { status: 404 });
    }

    // Apply same filtering logic as /api/employees
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

      // Apply filters (same logic as employees route)
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

      if (nameSearch) {
        const fullName = `${firstName} ${lastName}`.toLowerCase();
        if (!fullName.includes(nameSearch.toLowerCase())) continue;
      }

      // Practice area filters
      if (practiceArea.length || subPracticeArea.length || region.length) {
        const employeeProjects = projectEmployeesData
          .filter(rel => rel.EmployeeID === emp.id)
          .map(rel => projectsData.find(p => p.id === rel.ProjectID))
          .filter(Boolean);

        if (practiceArea.length) {
          const hasMatching = employeeProjects.some(proj => 
            practiceArea.some(pa => matchesFilter(proj?.practice_area, [pa]))
          );
          if (!hasMatching) continue;
        }
        if (subPracticeArea.length) {
          const hasMatching = employeeProjects.some(proj => 
            subPracticeArea.some(spa => matchesFilter(proj?.sub_practice_area, [spa]))
          );
          if (!hasMatching) continue;
        }
        if (region.length) {
          const hasMatching = employeeProjects.some(proj => 
            region.some(r => matchesFilter(proj?.region, [r]))
          );
          if (!hasMatching) continue;
        }
      }

      results.push({
        'First Name': firstName,
        'Last Name': lastName,
        'Email': email,
        'Phone': phone,
        'Title': title,
        'Job Title': jobTitle,
        'Office': office,
        'Years of Experience': totalYears || '',
        'Years at PE': employeeYearsAtPe || '',
        'Status': employeeStatus,
      });
    }

    // Create Excel workbook
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Employees');

    // Add headers
    const headers = Object.keys(results[0] || {});
    worksheet.addRow(headers);

    // Style header row
    const headerRow = worksheet.getRow(1);
    headerRow.font = { bold: true };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFFF6B35' } // PE Orange
    };
    headerRow.alignment = { horizontal: 'center', vertical: 'middle' };

    // Add data rows
    for (const row of results) {
      worksheet.addRow(headers.map(h => row[h]));
    }

    // Auto-adjust column widths
    worksheet.columns.forEach((column, index) => {
      let maxLength = 10;
      worksheet.getColumn(index + 1).eachCell({ includeEmpty: false }, (cell) => {
        const cellLength = cell.value ? String(cell.value).length : 10;
        if (cellLength > maxLength) {
          maxLength = cellLength;
        }
      });
      column.width = Math.min(maxLength + 2, 50);
    });

    // Generate filename
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
    const filename = `perkins_eastman_employees_${timestamp}.xlsx`;

    // Generate buffer
    const buffer = await workbook.xlsx.writeBuffer();

    // Return file
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error: any) {
    console.error('Error exporting employees:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

