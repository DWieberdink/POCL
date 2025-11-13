// app/api/employee/[id]/projects/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { ensureDataLoaded, getEmployeeProjects, SharePointAuthError } from '@/lib/csv-loader';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Forward cookies from browser request to SharePoint for authentication
    const cookieHeader = request.headers.get('cookie') || undefined;
    await ensureDataLoaded(cookieHeader);
    
    const employeeId = parseInt(params.id);
    
    if (isNaN(employeeId)) {
      return NextResponse.json({ error: 'Invalid employee ID' }, { status: 400 });
    }
    
    const projects = getEmployeeProjects(employeeId);
    
    return NextResponse.json({ projects });
  } catch (error: any) {
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

