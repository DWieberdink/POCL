'use client';

import { useEffect } from 'react';

interface AuthRequiredProps {
  onRetry?: () => void;
}

export function AuthRequired({ onRetry }: AuthRequiredProps) {
  // Get the current app URL for redirect
  const appUrl = typeof window !== 'undefined' ? window.location.origin : '';
  
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
    // Open SharePoint login page in same window
    // After login, user can use browser back button or navigate to app URL
    window.location.href = getSignInUrl();
  };

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
          <button className="btn btn-primary" onClick={handleSignIn}>
            <i className="fab fa-microsoft"></i>
            Sign in with Microsoft
          </button>
          {onRetry && (
            <button className="btn btn-outline" onClick={onRetry}>
              <i className="fas fa-redo"></i>
              Retry
            </button>
          )}
        </div>
        <div className="auth-help">
          <p>
            <strong>Instructions:</strong>
          </p>
          <ol>
            <li>Click "Sign in with Microsoft" above</li>
            <li>Sign in with your Perkins Eastman Microsoft 365 account</li>
            <li>After signing in, navigate back to: <strong>{appUrl}</strong></li>
            <li>The app will automatically detect your authentication</li>
          </ol>
          <p style={{ marginTop: '1rem', fontSize: '0.9rem', color: 'var(--pe-gray-medium)' }}>
            App URL: <code style={{ background: 'var(--gray-100)', padding: '2px 6px', borderRadius: '3px' }}>{appUrl}</code>
          </p>
        </div>
      </div>
    </div>
  );
}

