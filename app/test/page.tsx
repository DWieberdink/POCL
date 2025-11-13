'use client';

import { useState } from 'react';

export default function TestPage() {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const testAuth = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/test-auth');
      const data = await response.json();
      setResult(data);
    } catch (error: any) {
      setResult({ error: error.message });
    } finally {
      setLoading(false);
    }
  };

  const testEmployees = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/employees?limit=5');
      const data = await response.json();
      setResult({
        status: response.status,
        ok: response.ok,
        data: data
      });
    } catch (error: any) {
      setResult({ error: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <h1>Authentication Test Page</h1>
      <p>Use this page to test authentication and cookie forwarding.</p>
      
      <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem' }}>
        <button 
          onClick={testAuth}
          disabled={loading}
          style={{ padding: '0.75rem 1.5rem', fontSize: '1rem', cursor: loading ? 'not-allowed' : 'pointer' }}
        >
          Test Auth Endpoint
        </button>
        <button 
          onClick={testEmployees}
          disabled={loading}
          style={{ padding: '0.75rem 1.5rem', fontSize: '1rem', cursor: loading ? 'not-allowed' : 'pointer' }}
        >
          Test Employees API
        </button>
      </div>

      {loading && <p>Loading...</p>}

      {result && (
        <div style={{ marginTop: '2rem', padding: '1rem', background: '#f5f5f5', borderRadius: '8px' }}>
          <h2>Result:</h2>
          <pre style={{ background: 'white', padding: '1rem', overflow: 'auto', maxHeight: '500px' }}>
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}

      <div style={{ marginTop: '2rem', padding: '1rem', background: '#e3f2fd', borderRadius: '8px' }}>
        <h3>Testing Instructions:</h3>
        <ol>
          <li>Check if you're using local CSV files (no auth needed) or OneDrive URLs (auth needed)</li>
          <li>If using OneDrive URLs, make sure you're signed into SharePoint in your browser</li>
          <li>Click "Test Auth Endpoint" to see cookie information</li>
          <li>Click "Test Employees API" to test the actual data loading</li>
          <li>Check the browser console and server logs for detailed debugging info</li>
        </ol>
      </div>
    </div>
  );
}

