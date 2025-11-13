'use client';

import { useEffect, useState } from 'react';

interface AuthRequiredProps {
  onRetry?: () => void;
}

export function AuthRequired({ onRetry }: AuthRequiredProps) {
  const [checkingAuth, setCheckingAuth] = useState(false);
  // Get the current app URL for redirect
  const appUrl = typeof window !== 'undefined' ? window.location.href : '';
  const appOrigin = typeof window !== 'undefined' ? window.location.origin : '';
  
  // Get SharePoint CSV URL from environment (if available) to trigger authentication
  // Otherwise use a SharePoint page that requires authentication
  const getSignInUrl = () => {
    const sharePointBaseUrl = process.env.NEXT_PUBLIC_SHAREPOINT_URL || 'https://perkinseastman.sharepoint.com';
    
    // Try to get CSV URL from environment - linking to CSV will trigger auth
    // If not available, use SharePoint home page
    const csvUrl = process.env.NEXT_PUBLIC_ONEDRIVE_EMPLOYEES_URL;
    
    if (csvUrl) {
      // Link directly to CSV file - this will trigger Microsoft login
      // After authentication, user can return to the app
      return csvUrl.split('?')[0]; // Remove query params, just get the file URL
    }
    
    // Fallback: Use SharePoint home page which requires authentication
    return `${sharePointBaseUrl}/_layouts/15/sharepoint.aspx`;
  };
  
  const handleSignIn = () => {
    // Check if we're already on SharePoint (user might have navigated there)
    if (window.location.hostname.includes('sharepoint.com')) {
      // Already on SharePoint - just retry the app
      if (onRetry) {
        onRetry();
      } else {
        window.location.href = appOrigin;
      }
      return;
    }
    
    // Store the app URL and return flag in sessionStorage
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('returnToApp', appUrl);
      sessionStorage.setItem('returnFromAuth', 'true');
    }
    
    // Open SharePoint login page in same window
    // After login, user can use browser back button or navigate to app URL
    window.location.href = getSignInUrl();
  };
  
  const handleReturnToApp = () => {
    window.location.href = appOrigin;
  };
  
  // Check if user might already be authenticated by trying to access the API
  const checkIfAlreadySignedIn = async () => {
    setCheckingAuth(true);
    try {
      // Try multiple endpoints to check authentication
      const [practiceRes, employeesRes] = await Promise.all([
        fetch('/api/practice-areas'),
        fetch('/api/employees?limit=1')
      ]);
      
      // If either endpoint works, we're authenticated
      if (practiceRes.ok || employeesRes.ok) {
        console.log('[Auth] Already authenticated! Reloading...');
        // Already authenticated! Just reload
        window.location.reload();
        return;
      }
      
      // Check if it's an auth error
      if (practiceRes.status === 401 || employeesRes.status === 401) {
        console.log('[Auth] Not authenticated, redirecting to SharePoint...');
        // Not authenticated, proceed with sign-in
        handleSignIn();
      } else {
        // Other error - might be a different issue
        console.log('[Auth] Unexpected error:', practiceRes.status, employeesRes.status);
        handleSignIn();
      }
    } catch (error) {
      console.error('[Auth] Error checking authentication:', error);
      // Error checking - proceed with sign-in
      handleSignIn();
    } finally {
      setCheckingAuth(false);
    }
  };
  
  // Auto-check on mount if we're coming back from SharePoint
  useEffect(() => {
    // Check if we have a return flag in URL or sessionStorage
    const urlParams = new URLSearchParams(window.location.search);
    const returnFromAuth = urlParams.get('auth') === 'success' || sessionStorage.getItem('returnFromAuth');
    
    if (returnFromAuth) {
      sessionStorage.removeItem('returnFromAuth');
      // Small delay then check authentication
      setTimeout(() => {
        checkIfAlreadySignedIn();
      }, 500);
    }
    
    // Also check on page load if user might be coming back from SharePoint
    // Check after a short delay to allow cookies to be available
    const checkOnLoad = setTimeout(() => {
      // Only auto-check if we haven't already tried
      if (!sessionStorage.getItem('authChecked')) {
        sessionStorage.setItem('authChecked', 'true');
        checkIfAlreadySignedIn();
      }
    }, 1000);
    
    return () => clearTimeout(checkOnLoad);
  }, []);

  return (
    <div className="auth-required-container">
      <div className="auth-required-content">
        <div className="auth-required-icon">
          <i className="fas fa-lock"></i>
        </div>
        <h2>Authentication Required</h2>
        <p>
          You must be signed into your <strong>Perkins Eastman</strong> Microsoft 365 account to view this page.
        </p>
        <p className="auth-instructions">
          The employee directory data is protected and only accessible to members of your organization.
        </p>
        <div className="auth-actions">
          <button 
            className="btn btn-primary" 
            onClick={checkIfAlreadySignedIn}
            disabled={checkingAuth}
          >
            <i className="fab fa-microsoft"></i>
            {checkingAuth ? 'Checking...' : 'Sign in with Microsoft'}
          </button>
          {onRetry && (
            <button 
              className="btn btn-outline" 
              onClick={async () => {
                // First check if we're actually authenticated
                setCheckingAuth(true);
                try {
                  const response = await fetch('/api/practice-areas');
                  if (response.ok) {
                    // We're authenticated! Reload
                    window.location.reload();
                  } else {
                    // Not authenticated, call the retry handler
                    onRetry();
                  }
                } catch (error) {
                  // Try anyway
                  onRetry();
                } finally {
                  setCheckingAuth(false);
                }
              }}
              disabled={checkingAuth}
            >
              <i className="fas fa-redo"></i>
              {checkingAuth ? 'Checking...' : 'I\'m Already Signed In - Retry Now'}
            </button>
          )}
          <button className="btn btn-outline" onClick={handleReturnToApp} style={{ marginTop: '0.5rem' }}>
            <i className="fas fa-arrow-left"></i>
            Return to App
          </button>
        </div>
        <div className="auth-help">
          <p>
            <strong>Instructions:</strong>
          </p>
          <ol>
            <li>Click "Sign in with Microsoft" above (opens SharePoint)</li>
            <li>Sign in with your Perkins Eastman Microsoft 365 account</li>
            <li><strong>After signing in, click "Return to App" button above</strong></li>
            <li>Or manually navigate to: <strong>{appOrigin}</strong></li>
            <li>The app will automatically detect your authentication</li>
          </ol>
          <div style={{ marginTop: '1rem', padding: '0.75rem', background: '#fff3cd', borderRadius: '6px', border: '1px solid #ffc107' }}>
            <p style={{ margin: 0, fontSize: '0.9rem', color: '#856404', marginBottom: '0.5rem' }}>
              <strong>💡 Already signed in?</strong> If you're already signed into SharePoint:
            </p>
            <ol style={{ margin: 0, paddingLeft: '1.25rem', fontSize: '0.9rem', color: '#856404' }}>
              <li>Click "I'm Already Signed In - Retry Now" above</li>
              <li>Or click "Return to App" and refresh the page</li>
              <li>Or manually refresh this page (F5)</li>
            </ol>
          </div>
          <div style={{ marginTop: '1rem', padding: '0.75rem', background: '#d1ecf1', borderRadius: '6px', border: '1px solid #bee5eb' }}>
            <p style={{ margin: 0, fontSize: '0.85rem', color: '#0c5460' }}>
              <strong>🔍 Debugging:</strong> Visit <code style={{ background: 'white', padding: '2px 4px' }}>/api/test-auth</code> to check authentication status and environment configuration.
            </p>
          </div>
          <p style={{ marginTop: '1rem', fontSize: '0.85rem', color: 'var(--pe-gray-medium)' }}>
            App URL: <code style={{ background: 'var(--gray-100)', padding: '2px 6px', borderRadius: '3px' }}>{appOrigin}</code>
          </p>
        </div>
      </div>
    </div>
  );
}

