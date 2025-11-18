'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

interface ErrorDetails {
  title: string;
  message: string;
  icon: string;
  suggestions: string[];
}

function AuthErrorContent() {
  const searchParams = useSearchParams();
  const [error, setError] = useState<string>('Unknown error');
  const [description, setDescription] = useState<string>('');
  const [details, setDetails] = useState<ErrorDetails | null>(null);

  useEffect(() => {
    const errorParam = searchParams.get('error') || 'unknown_error';
    const descriptionParam = searchParams.get('description') || '';
    
    setError(errorParam);
    setDescription(descriptionParam);

    // Set user-friendly details based on error type
    switch (errorParam) {
      case 'access_denied':
        setDetails({
          title: 'Access Denied',
          message: 'You denied the authentication request.',
          icon: '🚫',
          suggestions: [
            'Click "Allow" when prompted by Google',
            'Ensure you have a Google account',
            'Try logging in again'
          ]
        });
        break;
      
      case 'invalid_request':
        setDetails({
          title: 'Invalid Request',
          message: 'The authentication request was malformed.',
          icon: '⚠️',
          suggestions: [
            'Try refreshing the page',
            'Clear your browser cache',
            'Contact support if the issue persists'
          ]
        });
        break;
      
      case 'server_error':
        setDetails({
          title: 'Server Error',
          message: 'Our authentication server encountered an error.',
          icon: '🔧',
          suggestions: [
            'Please try again in a few moments',
            'Check if the service is under maintenance',
            'Contact support if the issue persists'
          ]
        });
        break;
      
      case 'invalid_grant':
        setDetails({
          title: 'Invalid Grant',
          message: 'The authorization code was invalid or expired.',
          icon: '⏰',
          suggestions: [
            'Try the authentication process again',
            'Ensure you complete the process quickly',
            'Clear cookies and try again'
          ]
        });
        break;

      case 'invalid_token':
        setDetails({
          title: 'Invalid Token',
          message: 'The authentication token could not be verified.',
          icon: '🔒',
          suggestions: [
            'Try authenticating again',
            'Ensure your system clock is accurate',
            'Contact support if using a corporate network'
          ]
        });
        break;
      
      default:
        setDetails({
          title: 'Authentication Error',
          message: 'An unexpected error occurred during authentication.',
          icon: '❌',
          suggestions: [
            'Try the authentication process again',
            'Ensure JavaScript is enabled',
            'Contact support with the error code below'
          ]
        });
    }
  }, [searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-100">
      <div className="bg-white p-8 rounded-xl shadow-xl max-w-lg w-full mx-4">
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">{details?.icon}</div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {details?.title}
          </h1>
          <p className="text-gray-600">
            {details?.message}
          </p>
        </div>

        {/* Error Details */}
        <div className="bg-red-50 p-4 rounded-lg mb-6">
          <h3 className="font-semibold text-red-900 mb-2">Error Details</h3>
          <div className="text-sm text-red-800 space-y-1">
            <p><strong>Code:</strong> <code className="bg-red-100 px-1 rounded">{error}</code></p>
            {description && (
              <p><strong>Description:</strong> {description}</p>
            )}
          </div>
        </div>

        {/* Suggestions */}
        {details?.suggestions && (
          <div className="bg-blue-50 p-4 rounded-lg mb-6">
            <h3 className="font-semibold text-blue-900 mb-2">💡 What to try:</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              {details.suggestions.map((suggestion: string, index: number) => (
                <li key={index}>• {suggestion}</li>
              ))}
            </ul>
          </div>
        )}

        {/* OAuth 2.1 Information */}
        <div className="bg-gray-50 p-4 rounded-lg mb-6">
          <h3 className="font-semibold text-gray-900 mb-2">🔒 Security Information</h3>
          <ul className="text-sm text-gray-700 space-y-1">
            <li>• OAuth 2.1 compliant authentication</li>
            <li>• Secure token exchange process</li>
            <li>• PKCE protection enabled</li>
            <li>• Session state validation</li>
          </ul>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <Link 
            href="/auth/login"
            className="block w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 text-center"
          >
            Try Authentication Again
          </Link>
          
          <div className="grid grid-cols-2 gap-3">
            <Link 
              href="/"
              className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200 text-center text-sm"
            >
              Go Home
            </Link>
            
            <Link 
              href="/.well-known/oauth-authorization-server"
              target="_blank"
              className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200 text-center text-sm"
            >
              OAuth Info
            </Link>
          </div>
        </div>

        {/* Debug Information */}
        <div className="mt-6 text-xs text-gray-500 text-center">
          <details>
            <summary className="cursor-pointer">Debug Information</summary>
            <div className="mt-2 bg-gray-100 p-2 rounded text-left">
              <p><strong>Error:</strong> {error}</p>
              <p><strong>Description:</strong> {description || 'None provided'}</p>
              <p><strong>Timestamp:</strong> {new Date().toISOString()}</p>
              <p><strong>User Agent:</strong> {typeof window !== 'undefined' ? navigator.userAgent.substring(0, 50) + '...' : 'N/A'}</p>
            </div>
          </details>
        </div>
      </div>
    </div>
  );
}

export default function AuthErrorPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AuthErrorContent />
    </Suspense>
  );
}