'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export function LoginForm({ className, ...props }: React.ComponentPropsWithoutRef<'div'>) {
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleLogin = () => {
    setIsLoading(true);
    
    // Get return URL from current page
    const urlParams = new URLSearchParams(window.location.search);
    const currentReturnUrl = urlParams.get('returnUrl') || '/';
    
    // Generate state parameter for security (include return URL)
    const state = btoa(JSON.stringify({
      timestamp: Date.now(),
      redirect: window.location.origin + '/auth/success',
      returnUrl: currentReturnUrl
    }));

    // Direct Google OAuth URL
    const googleAuthParams = new URLSearchParams({
      response_type: 'code',
      client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '',
      redirect_uri: window.location.origin + '/api/auth/callback/google',
      scope: 'openid profile email',
      state: state,
      access_type: 'offline',
      prompt: 'consent',
    });

    // Redirect directly to Google OAuth
    window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?${googleAuthParams.toString()}`;
  };

  return (
    <div className={cn('flex flex-col gap-6', className)} {...props}>
      <Card>
          <CardHeader className="flex flex-col items-center text-center">
            <CardTitle className="text-2xl font-semibold">Person Search</CardTitle>
            <CardDescription>
              Authenticate with your Google account to access the person search platform
            </CardDescription>
          </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-6">
            <Button 
              onClick={handleGoogleLogin}
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                  Authenticating...
                </>
              ) : (
                <>
                  <GoogleIcon className="w-4 h-4 mr-2" />
                  Continue with Google
                </>
              )}
            </Button>
            
            <div className="text-center text-sm text-muted-foreground">
              By continuing, you agree to our{' '}
              <span className="underline underline-offset-4 cursor-pointer hover:text-foreground">
                Terms of Service
              </span>{' '}
              and{' '}
              <span className="underline underline-offset-4 cursor-pointer hover:text-foreground">
                Privacy Policy
              </span>
              .
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Google Icon Component
function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
      <path fill="#EB4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
  );
}