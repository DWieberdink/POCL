// app/api/test-auth/route.ts - Test endpoint to verify cookie forwarding
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const cookieHeader = request.headers.get('cookie') || undefined;
  
  const info = {
    hasCookies: !!cookieHeader,
    cookieLength: cookieHeader?.length || 0,
    cookieNames: cookieHeader ? cookieHeader.split(';').map(c => c.split('=')[0].trim()).filter(Boolean) : [],
    userAgent: request.headers.get('user-agent'),
    origin: request.headers.get('origin'),
    referer: request.headers.get('referer'),
  };
  
  // Test fetching a SharePoint URL if environment variable is set
  const testUrl = process.env.ONEDRIVE_EMPLOYEES_URL;
  let sharePointTest: any = null;
  
  if (testUrl) {
    // Check for SharePoint/Microsoft cookies
    const hasSharePointCookies = cookieHeader && (
      cookieHeader.includes('FedAuth') || 
      cookieHeader.includes('rtFa') ||
      cookieHeader.includes('Microsoft') ||
      cookieHeader.includes('SharePoint')
    );
    
    if (!cookieHeader) {
      sharePointTest = {
        error: 'No cookies received from browser',
        note: 'SharePoint cookies are domain-specific and won\'t be sent to localhost. This is normal for local testing.',
        solution: 'Test authentication on Vercel deployment where cookies will work correctly'
      };
    } else if (!hasSharePointCookies) {
      sharePointTest = {
        error: 'No SharePoint/Microsoft authentication cookies found',
        receivedCookies: cookieNames,
        note: 'SharePoint cookies are only sent to sharepoint.com domain, not localhost',
        solution: 'For local testing: Use local CSV files OR test on Vercel deployment'
      };
    } else {
      // Try fetching with cookies
      try {
        const headers: HeadersInit = {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Accept': 'text/csv,text/plain,*/*',
          'Cookie': cookieHeader
        };
        
        const response = await fetch(testUrl, { headers, redirect: 'follow' });
        sharePointTest = {
          status: response.status,
          statusText: response.statusText,
          contentType: response.headers.get('content-type'),
          isHTML: response.headers.get('content-type')?.includes('text/html'),
          success: response.ok
        };
      } catch (error: any) {
        sharePointTest = {
          error: error.message
        };
      }
    }
  } else {
    sharePointTest = {
      note: 'No ONEDRIVE_EMPLOYEES_URL set - using local CSV files (no authentication needed)',
      currentMode: 'Local CSV files'
    };
  }
  
  return NextResponse.json({
    message: 'Authentication test endpoint',
    browserInfo: info,
    sharePointTest: sharePointTest || 'No ONEDRIVE_EMPLOYEES_URL set or no cookies',
    instructions: {
      local: 'For local testing, ensure you are signed into SharePoint in your browser',
      vercel: 'For Vercel, cookies will be forwarded from browser requests'
    }
  });
}

