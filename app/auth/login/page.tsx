'use client';

import { Suspense } from 'react';
import { LoginForm } from './login-form';
import { ThemeProvider } from '@/components/theme-provider';

/**
 * OAuth Login Page
 * Clean centered design
 */
export default function LoginPage() {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
        <div className="w-full max-w-sm">
          <Suspense fallback={<div className="flex items-center justify-center">Loading...</div>}>
            <LoginForm />
          </Suspense>
        </div>
      </div>
    </ThemeProvider>
  );
}