'use client';

interface AuthRequiredProps {
  onRetry?: () => void;
}

export function AuthRequired({ onRetry }: AuthRequiredProps) {
  // Default SharePoint URL - can be customized via environment variable
  const sharePointUrl = process.env.NEXT_PUBLIC_SHAREPOINT_URL || 'https://perkinseastman.sharepoint.com';
  
  const handleSignIn = () => {
    // Open SharePoint in a new tab to trigger Microsoft login
    window.open(sharePointUrl, '_blank');
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
              Retry After Signing In
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
            <li>Return to this page and refresh</li>
          </ol>
        </div>
      </div>
    </div>
  );
}

