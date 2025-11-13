// app/api/proxy-csv/route.ts - Proxy endpoint to fetch CSV files from SharePoint
// This bypasses CORS by fetching server-side and forwarding to client
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const fileType = searchParams.get('type'); // 'employees', 'projects', 'project_employees'
  
  if (!fileType || !['employees', 'projects', 'project_employees'].includes(fileType)) {
    return NextResponse.json({ error: 'Invalid file type' }, { status: 400 });
  }

  // Get the URL from environment variables
  let csvUrl: string | undefined;
  switch (fileType) {
    case 'employees':
      csvUrl = process.env.ONEDRIVE_EMPLOYEES_URL || process.env.NEXT_PUBLIC_ONEDRIVE_EMPLOYEES_URL;
      break;
    case 'projects':
      csvUrl = process.env.ONEDRIVE_PROJECTS_URL || process.env.NEXT_PUBLIC_ONEDRIVE_PROJECTS_URL;
      break;
    case 'project_employees':
      csvUrl = process.env.ONEDRIVE_PROJECT_EMPLOYEES_URL || process.env.NEXT_PUBLIC_ONEDRIVE_PROJECT_EMPLOYEES_URL;
      break;
  }

  if (!csvUrl) {
    return NextResponse.json({ 
      error: `CSV URL not configured for ${fileType}` 
    }, { status: 500 });
  }

  try {
    // Forward cookies from browser request
    const cookieHeader = request.headers.get('cookie') || undefined;
    
    // Log cookie information for debugging
    const cookieNames = cookieHeader ? cookieHeader.split(';').map(c => c.split('=')[0].trim()).filter(Boolean) : [];
    const hasSharePointCookies = cookieHeader && (
      cookieHeader.includes('FedAuth') || 
      cookieHeader.includes('rtFa') ||
      cookieHeader.includes('Microsoft') ||
      cookieHeader.includes('SharePoint')
    );
    
    console.log('[Proxy CSV] Cookie info:', {
      hasCookies: !!cookieHeader,
      cookieCount: cookieNames.length,
      cookieNames: cookieNames,
      hasSharePointCookies: !!hasSharePointCookies,
    });
    
    if (!hasSharePointCookies && cookieHeader) {
      console.warn('[Proxy CSV] WARNING: No SharePoint cookies found. SharePoint cookies are domain-specific and won\'t be sent to Vercel.');
    }
    
    // Convert SharePoint link to direct download format
    let downloadUrl = csvUrl;
    if (csvUrl.includes('web=1')) {
      downloadUrl = csvUrl.replace(/[?&]web=1/g, '').replace(/[?&]e=[^&]*/g, '').replace(/[?&]csf=1/g, '');
      downloadUrl = downloadUrl.replace(/\?&/, '?').replace(/&+/g, '&').replace(/\?$/, '');
      const separator = downloadUrl.includes('?') ? '&' : '?';
      downloadUrl = `${downloadUrl}${separator}download=1`;
    } else if (!csvUrl.includes('download=1')) {
      const separator = csvUrl.includes('?') ? '&' : '?';
      downloadUrl = `${csvUrl}${separator}download=1`;
    }

    console.log('[Proxy CSV] Fetching:', downloadUrl.substring(0, 100) + '...');

    const headers: HeadersInit = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      'Accept': 'text/csv,text/plain,*/*',
    };

    if (cookieHeader) {
      headers['Cookie'] = cookieHeader;
      console.log('[Proxy CSV] Forwarding cookies to SharePoint (length:', cookieHeader.length, 'chars)');
    } else {
      console.warn('[Proxy CSV] No cookies to forward - request will likely require authentication');
    }

    const response = await fetch(downloadUrl, {
      headers,
      cache: 'no-store',
      redirect: 'follow',
    });

    console.log('[Proxy CSV] Response status:', response.status);

    if (response.status === 401 || response.status === 403) {
      console.log('[Proxy CSV] Authentication error:', response.status);
      console.log('[Proxy CSV] This likely means SharePoint cookies are not available (domain-specific cookies)');
      
      return NextResponse.json({ 
        error: 'Authentication required',
        requiresAuth: true,
        details: {
          status: response.status,
          hasCookies: !!cookieHeader,
          hasSharePointCookies: !!hasSharePointCookies,
          note: 'SharePoint cookies are domain-specific and cannot be forwarded from browser to Vercel server. ' +
                'The CSV files must be accessible without authentication, or you need to use OAuth/MSAL for proper authentication.'
        }
      }, { status: 401 });
    }

    if (!response.ok) {
      const errorText = await response.text();
      if (errorText.includes('<html') || errorText.includes('Sign in')) {
        return NextResponse.json({ 
          error: 'Authentication required',
          requiresAuth: true 
        }, { status: 401 });
      }
      return NextResponse.json({ 
        error: `Failed to fetch CSV: ${response.status}` 
      }, { status: response.status });
    }

    const content = await response.text();
    
    // Check if response is HTML (login page)
    if (content.trim().startsWith('<!DOCTYPE') || content.trim().startsWith('<html') ||
        content.includes('Sign in') || content.includes('Microsoft account')) {
      return NextResponse.json({ 
        error: 'Authentication required',
        requiresAuth: true 
      }, { status: 401 });
    }

    // Return CSV content with proper headers
    return new NextResponse(content, {
      headers: {
        'Content-Type': 'text/csv',
        'Cache-Control': 'no-store, no-cache, must-revalidate',
        'Access-Control-Allow-Origin': '*', // Allow CORS from client
      },
    });
  } catch (error: any) {
    console.error('[Proxy CSV] Error:', error);
    return NextResponse.json({ 
      error: `Failed to fetch CSV: ${error.message}` 
    }, { status: 500 });
  }
}

