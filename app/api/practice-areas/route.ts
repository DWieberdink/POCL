// app/api/practice-areas/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { ensureDataLoaded, getProjectsData, SharePointAuthError } from '@/lib/csv-loader';

export async function GET(request: NextRequest) {
  try {
    // Forward cookies from browser request to SharePoint for authentication
    const cookieHeader = request.headers.get('cookie') || undefined;
    await ensureDataLoaded(cookieHeader);
    const projectsData = getProjectsData();
    
    const practiceAreas = new Set<string>();
    for (const project of projectsData) {
      const pa = project.practice_area?.trim();
      if (pa) {
        practiceAreas.add(pa);
      }
    }
    
    return NextResponse.json({
      practice_areas: Array.from(practiceAreas).sort()
    });
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

