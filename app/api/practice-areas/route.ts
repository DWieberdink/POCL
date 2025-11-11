// app/api/practice-areas/route.ts
import { NextResponse } from 'next/server';
import { ensureDataLoaded, getProjectsData } from '@/lib/csv-loader';

export async function GET() {
  try {
    await ensureDataLoaded();
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
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

