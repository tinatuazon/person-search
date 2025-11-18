'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/hooks/use-auth';

interface UserInfo {
  id: string;
  name: string;
  email: string;
  picture?: string;
}

function AuthSuccessContent() {
  const searchParams = useSearchParams();
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [state, setState] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { checkAuthStatus } = useAuth();

  useEffect(() => {
    // Refresh auth status when page loads
    checkAuthStatus();
    
    try {
      // Extract user info from URL parameters
      const userParam = searchParams.get('user');
      const stateParam = searchParams.get('state');

      if (userParam) {
        const decoded = JSON.parse(atob(userParam));
        setUserInfo(decoded);
      }

      if (stateParam) {
        setState(stateParam);
      }
    } catch (err) {
      setError('Failed to parse authentication response');
      console.error('Auth success page error:', err);
    }
  }, [searchParams, checkAuthStatus]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-pink-100">
        <div className="bg-white p-8 rounded-xl shadow-xl max-w-md w-full mx-4">
          <div className="text-center">
            <div className="text-red-500 text-6xl mb-4">❌</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Authentication Error
            </h1>
            <p className="text-gray-600 mb-6">{error}</p>
            <Link 
              href="/auth/login"
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors duration-200"
            >
              Try Again
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!userInfo) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Processing authentication...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100">
      <div className="bg-white p-8 rounded-xl shadow-xl max-w-lg w-full mx-4">
        <div className="text-center mb-8">
          <div className="text-green-500 text-6xl mb-4">✅</div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Authentication Successful!
          </h1>
          <p className="text-gray-600">
            Welcome to the OAuth-secured Person Search App
          </p>
        </div>

        {/* User Information */}
        <div className="bg-gray-50 p-6 rounded-lg mb-6">
          <div className="flex items-center space-x-4">
            {userInfo.picture && (
              <Image
                src={userInfo.picture}
                alt={userInfo.name}
                width={64}
                height={64}
                className="w-16 h-16 rounded-full border-4 border-white shadow-md"
              />
            )}
            <div>
              <h3 className="text-xl font-semibold text-gray-900">
                {userInfo.name}
              </h3>
              <p className="text-gray-600">{userInfo.email}</p>
              <p className="text-sm text-gray-500">ID: {userInfo.id}</p>
            </div>
          </div>
        </div>

        {/* Access Information */}
        <div className="bg-blue-50 p-4 rounded-lg mb-6">
          <h4 className="font-semibold text-blue-900 mb-2">🔐 Access Granted</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>✅ Person Search App</li>
            <li>✅ MCP Server Endpoints</li>
            <li>✅ CRUD Operations</li>
            <li>✅ API Access</li>
          </ul>
        </div>

        {/* Available Scopes */}
        <div className="bg-green-50 p-4 rounded-lg mb-6">
          <h4 className="font-semibold text-green-900 mb-2">📋 Your Permissions</h4>
          <div className="grid grid-cols-2 gap-2 text-sm text-green-800">
            <div>• <code>read:mcp</code></div>
            <div>• <code>write:mcp</code></div>
            <div>• <code>persons:read</code></div>
            <div>• <code>persons:write</code></div>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <Link 
            href="/"
            className="block w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 text-center"
          >
            Go to Person Search App
          </Link>
          
          <Link 
            href="/mcp"
            className="block w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 text-center"
          >
            Test MCP Endpoints
          </Link>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => {
                navigator.clipboard.writeText(window.location.origin + '/api/mcp');
              }}
              className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200 text-sm"
            >
              Copy MCP URL
            </button>
            
            <Link 
              href="/api/mcp"
              target="_blank"
              className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200 text-center text-sm"
            >
              View MCP Info
            </Link>
          </div>
        </div>

        {/* Session Info */}
        {state && (
          <div className="mt-6 text-xs text-gray-500 text-center">
            <details>
              <summary className="cursor-pointer">Session Details</summary>
              <div className="mt-2 bg-gray-100 p-2 rounded text-left">
                <p><strong>State:</strong> {state.substring(0, 20)}...</p>
                <p><strong>Timestamp:</strong> {new Date().toLocaleString()}</p>
                <p><strong>Session:</strong> Active</p>
              </div>
            </details>
          </div>
        )}
      </div>
    </div>
  );
}

export default function AuthSuccessPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AuthSuccessContent />
    </Suspense>
  );
}