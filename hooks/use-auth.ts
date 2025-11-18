'use client';

import { useState, useEffect } from 'react';

export interface User {
  sub: string;
  email: string;
  name: string;
  iat: number;
  exp: number;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      setIsLoading(true);
      
      // Make request to session endpoint to check auth status
      const response = await fetch('/api/auth/session', {
        method: 'GET',
        credentials: 'include', // Include cookies
      });
      
      if (response.ok) {
        const data = await response.json();
        
        if (data.authenticated && data.user) {
          setUser(data.user);
          setIsAuthenticated(true);
        } else {
          setUser(null);
          setIsAuthenticated(false);
        }
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
      
    } catch (error) {
      console.error('Auth check error:', error);
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        setUser(null);
        setIsAuthenticated(false);
        
        // Redirect to login
        window.location.href = '/auth/login?logout=success';
      }
    } catch (error) {
      console.error('Logout error:', error);
      // Force redirect even on error
      window.location.href = '/auth/login';
    }
  };

  return {
    user,
    isLoading,
    isAuthenticated,
    logout,
    checkAuthStatus
  };
}