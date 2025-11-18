'use client';

import { useState } from 'react';

interface LogoutButtonProps {
  className?: string;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  onLogoutStart?: () => void;
  onLogoutComplete?: () => void;
  redirectTo?: string;
}

/**
 * Secure OAuth 2.1 Logout Button Component
 * Handles session termination and provides user feedback
 */
export default function LogoutButton({ 
  className = '',
  variant = 'outline',
  size = 'md',
  onLogoutStart,
  onLogoutComplete,
  redirectTo = '/auth/login'
}: LogoutButtonProps) {
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      onLogoutStart?.();
      
      console.log("🚪 Initiating logout...");
      
      // Call logout endpoint
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      const result = await response.json();
      
      if (result.success) {
        console.log("✅ Logout successful");
        
        // Redirect to login page with logout success indicator
        const logoutUrl = new URL(redirectTo, window.location.origin);
        logoutUrl.searchParams.set('logout', 'success');
        
        // Give user feedback before redirect
        setTimeout(() => {
          window.location.href = logoutUrl.toString();
          onLogoutComplete?.();
        }, 500);
        
      } else {
        console.error("❌ Logout failed:", result.error);
        // Force redirect anyway to clear client-side state
        window.location.href = redirectTo;
      }
      
    } catch (error) {
      console.error("❌ Logout error:", error);
      // Force redirect on error to ensure user is logged out
      window.location.href = redirectTo;
    }
  };

  const getButtonClasses = () => {
    const baseClasses = "inline-flex items-center justify-center font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none";
    
    const sizeClasses = {
      sm: "h-8 px-3 text-sm",
      md: "h-10 px-4 text-sm",
      lg: "h-12 px-6 text-base"
    };
    
    const variantClasses = {
      default: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500",
      outline: "border border-red-600 text-red-600 hover:bg-red-50 focus:ring-red-500",
      ghost: "text-red-600 hover:bg-red-50 focus:ring-red-500"
    };
    
    return `${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} rounded-md ${className}`;
  };

  return (
    <button
      onClick={handleLogout}
      disabled={isLoggingOut}
      className={getButtonClasses()}
      type="button"
    >
      {isLoggingOut ? (
        <>
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
          Signing out...
        </>
      ) : (
        <>
          <svg 
            className="w-4 h-4 mr-2" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" 
            />
          </svg>
          Sign out
        </>
      )}
    </button>
  );
}