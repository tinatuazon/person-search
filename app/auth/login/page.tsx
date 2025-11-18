'use client';

import { useState } from "react";

/**
 * OAuth Login Page
 * Demonstrates OAuth 2.1 flow initiation
 */
export default function LoginPage() {
  const [isExpired, setIsExpired] = useState<boolean>(false)
  const [isLoggedOut, setIsLoggedOut] = useState<boolean>(false)
  
  // Get return URL and expired flag from query parameters
  useState(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      setIsExpired(params.has('expired'))
      setIsLoggedOut(params.has('logout'))
    }
  })

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="bg-white p-8 rounded-xl shadow-xl max-w-md w-full mx-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            OAuth 2.1 Authentication
          </h1>
          <p className="text-gray-600">
            Secure access to Person Search App & MCP Server
          </p>
          {isExpired && (
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-yellow-800 text-sm">
                🕐 Your session has expired. Please sign in again.
              </p>
            </div>
          )}
          {isLoggedOut && (
            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-800 text-sm">
                ✅ You have been signed out successfully.
              </p>
            </div>
          )}
        </div>

        <div className="space-y-6">
          {/* OAuth Information */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-semibold text-blue-900 mb-2">🔒 Security Features</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>✅ OAuth 2.1 Compliance</li>
              <li>✅ PKCE Support</li>
              <li>✅ Google Identity Platform</li>
              <li>✅ MCP Server Protection</li>
            </ul>
          </div>

          {/* Scopes Information */}
          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="font-semibold text-green-900 mb-2">📋 Access Scopes</h3>
            <ul className="text-sm text-green-800 space-y-1">
              <li>• <code>read:mcp</code> - Read MCP resources</li>
              <li>• <code>write:mcp</code> - Modify MCP resources</li>
              <li>• <code>persons:read</code> - View person data</li>
              <li>• <code>persons:write</code> - Manage person data</li>
            </ul>
          </div>

          {/* Login Button */}
          <LoginButton />

          {/* Development Info */}
          <div className="text-center text-sm text-gray-500">
            <p>Development Environment</p>
            <p>Redirect URI: <code className="bg-gray-100 px-1 rounded">
              {typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'}/api/auth/callback/google
            </code></p>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Client-side login button component
 */
function LoginButton() {
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = () => {
    setIsLoading(true);
    
    // Get return URL from current page
    const urlParams = new URLSearchParams(window.location.search)
    const currentReturnUrl = urlParams.get('returnUrl') || '/'
    
    // Generate state parameter for security (include return URL)
    const state = btoa(JSON.stringify({
      timestamp: Date.now(),
      redirect: window.location.origin + '/auth/success',
      returnUrl: currentReturnUrl
    }));

    // OAuth 2.1 authorization parameters  
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '',
      redirect_uri: window.location.origin + '/api/auth/callback/google',
      scope: 'openid profile email',
      state: state,
      access_type: 'offline',
      prompt: 'consent',
    });

    // Redirect to OAuth authorization endpoint
    window.location.href = `/api/auth/authorize?${params.toString()}`;
  };

  return (
    <button
      onClick={handleLogin}
      disabled={isLoading}
      className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
    >
      {isLoading ? (
        <>
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
          <span>Redirecting...</span>
        </>
      ) : (
        <>
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="currentColor"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="currentColor"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="currentColor"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          <span>Sign in with Google</span>
        </>
      )}
    </button>
  );
}