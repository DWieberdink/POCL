// app/api/employee/[id]/projects/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { ensureDataLoaded, getEmployeeProjects } from '@/lib/csv-loader';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await ensureDataLoaded();
    const employeeId = parseInt(params.id);
    
    if (isNaN(employeeId)) {
      return NextResponse.json({ error: 'Invalid employee ID' }, { status: 400 });
    }
    
    const projects = getEmployeeProjects(employeeId);
    
    return NextResponse.json({ projects });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

