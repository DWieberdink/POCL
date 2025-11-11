// app/api/sub-practice-areas/route.ts
import { NextResponse } from 'next/server';
import { ensureDataLoaded, getProjectsData } from '@/lib/csv-loader';

export async function GET() {
  try {
    await ensureDataLoaded();
    const projectsData = getProjectsData();
    
    const subPracticeAreas = new Set<string>();
    for (const project of projectsData) {
      const spa = project.sub_practice_area?.trim();
      if (spa) {
        subPracticeAreas.add(spa);
      }
    }
    
    return NextResponse.json({
      sub_practice_areas: Array.from(subPracticeAreas).sort()
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

