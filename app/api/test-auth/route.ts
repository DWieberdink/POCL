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
  
  // Check environment configuration
  const envCheck = {
    hasOneDriveUrls: !!(process.env.ONEDRIVE_EMPLOYEES_URL || process.env.ONEDRIVE_PROJECTS_URL),
    hasEmployeesUrl: !!process.env.ONEDRIVE_EMPLOYEES_URL,
    hasProjectsUrl: !!process.env.ONEDRIVE_PROJECTS_URL,
    hasProjectEmployeesUrl: !!process.env.ONEDRIVE_PROJECT_EMPLOYEES_URL,
    forceLocalCsv: process.env.FORCE_LOCAL_CSV === 'true',
    nodeEnv: process.env.NODE_ENV,
    vercelUrl: process.env.VERCEL_URL,
    vercelEnv: process.env.VERCEL_ENV
  };
  
  // Determine the issue
  let diagnosis = '';
  if (!envCheck.hasOneDriveUrls) {
    diagnosis = 'MISSING_ENV_VARS: OneDrive URLs are not set in Vercel environment variables. The app cannot fetch CSV files from SharePoint.';
  } else if (!cookieHeader) {
    diagnosis = 'NO_COOKIES: No cookies received. SharePoint cookies are domain-specific and won\'t be sent to Vercel domain. This is expected - cookies need to be established by visiting SharePoint first.';
  } else {
    diagnosis = 'COOKIES_PRESENT: Cookies are being sent, but may not include SharePoint authentication cookies.';
  }
  
  return NextResponse.json({
    message: 'Authentication test endpoint',
    diagnosis: diagnosis,
    browserInfo: info,
    sharePointTest: sharePointTest || 'No ONEDRIVE_EMPLOYEES_URL set or no cookies',
    environment: envCheck,
    recommendations: {
      ifMissingEnvVars: 'Set ONEDRIVE_EMPLOYEES_URL, ONEDRIVE_PROJECTS_URL, and ONEDRIVE_PROJECT_EMPLOYEES_URL in Vercel environment variables',
      ifNoCookies: 'SharePoint cookies are domain-specific. User must visit SharePoint first to establish session, then cookies can be forwarded.',
      ifStuck: 'If stuck on auth page: 1) Visit SharePoint first to sign in 2) Then return to app 3) Click "I\'m Already Signed In - Retry Now"',
      if401Errors: 'If getting 401 errors: Verify CSV files are shared as "People in org" not "Anyone" and user is signed into SharePoint'
    },
    instructions: {
      local: 'For local testing, use FORCE_LOCAL_CSV=true to skip authentication',
      vercel: 'For Vercel: 1) Set OneDrive URLs in environment variables 2) User visits SharePoint to sign in 3) User returns to app 4) Cookies are forwarded from browser'
    }
  });
}

