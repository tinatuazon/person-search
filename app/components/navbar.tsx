// app/components/navbar.tsx
'use client'

import Link from 'next/link';
import { Search, Moon, Sun, User } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import LogoutButton from "@/components/logout-button";

export default function Navbar() {
  const { theme, setTheme } = useTheme();
  const { isAuthenticated, user, isLoading } = useAuth();

  return (
    <nav className="bg-background shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex-shrink-0 flex items-center">
            <Link href="/" className="flex items-center">
              <Search className="h-8 w-8 text-primary" aria-hidden="true" />
              <span className="ml-2 text-lg font-semibold text-foreground">Person Search</span>
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            <Link href="/" className="text-foreground hover:text-primary px-3 py-2 rounded-md text-sm font-medium">
              Home
            </Link>
            <Link href="/about" className="text-foreground hover:text-primary px-3 py-2 rounded-md text-sm font-medium">
              About
            </Link>
            <Link href="/mcp" className="text-foreground hover:text-primary px-3 py-2 rounded-md text-sm font-medium">
              MCP Server
            </Link>
            
            {/* Authentication Section */}
            {!isLoading && (
              <>
                {isAuthenticated && user ? (
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-2 text-sm text-foreground">
                      <User className="h-4 w-4" />
                      <span className="hidden sm:inline">{user.name || user.email}</span>
                    </div>
                    <LogoutButton variant="ghost" size="sm" />
                  </div>
                ) : (
                  <Link 
                    href="/auth/login" 
                    className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    Sign In
                  </Link>
                )}
              </>
            )}
            
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              aria-label="Toggle theme"
            >
              <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}