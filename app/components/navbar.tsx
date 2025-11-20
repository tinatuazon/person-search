// app/components/navbar.tsx
'use client'

import Link from 'next/link';
import { Search, Moon, Sun, User, LogOut, Github } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function Navbar() {
  const { theme, setTheme } = useTheme();
  const { isAuthenticated, user, isLoading, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

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
            {/* Add border and rounded corners to each header section */}
              <div className="border rounded-lg flex items-center justify-center px-1 py-1 h-9 min-w-[90px] hover:bg-muted transition-colors">
                <Link href="/" className="w-full text-center text-foreground px-3 py-2 rounded-md text-sm font-medium">
                  Home
                </Link>
              </div>
            <div className="border rounded-lg flex items-center justify-center px-1 py-1 h-9 min-w-[90px] hover:bg-muted transition-colors">
              <Link href="/directory" className="w-full text-center text-foreground px-3 py-2 rounded-md text-sm font-medium">
                Directory
              </Link>
            </div>
            <div className="border rounded-lg flex items-center justify-center px-1 py-1 h-9 min-w-[90px] hover:bg-muted transition-colors">
              <Link href="/about" className="w-full text-center text-foreground px-3 py-2 rounded-md text-sm font-medium">
                About
              </Link>
            </div>
            <div className="border rounded-lg flex items-center justify-center px-1 py-1 h-9 min-w-[90px] hover:bg-muted transition-colors">
              <Link href="/mcp" className="w-full text-center text-foreground px-3 py-2 rounded-md text-sm font-medium">
                MCP Server
              </Link>
            </div>
            {/* Authentication Section */}
            {!isLoading && (
              <>
                {isAuthenticated && user ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <div className="border rounded-lg flex items-center justify-center px-1 py-1 h-9 min-w-[90px] hover:bg-muted transition-colors">
                        <Button variant="ghost" className="w-full flex items-center justify-center space-x-2 text-sm">
                          <User className="h-4 w-4" />
                          <span className="sm:inline text-center">{user.name || user.email}</span>
                        </Button>
                      </div>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56" align="end">
                      <DropdownMenuLabel>My Account</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={handleLogout} className="text-red-600 focus:text-red-600">
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>Sign out</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                    <div className="flex items-center justify-center px-1 py-1 h-9 min-w-[90px]">
                    <Link 
                      href="/auth/login" 
                      className="w-full text-center bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md text-sm font-medium transition-colors"
                    >
                      Sign In
                    </Link>
                  </div>
                )}
              </>
            )}
            <div className="border rounded-lg flex items-center justify-center px-1 py-1 h-9 min-w-[44px] hover:bg-muted transition-colors">
              <Link
                href="/database"
                className="w-full flex items-center justify-center"
                aria-label="Database Page"
              >
                {/* Neon logo SVG */}
                <svg className="h-5 w-5" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="16" cy="16" r="16" fill="#00E599" />
                  <path d="M10 16c0-3.31 2.69-6 6-6s6 2.69 6 6-2.69 6-6 6-6-2.69-6-6zm6-4a4 4 0 100 8 4 4 0 000-8z" fill="#fff" />
                </svg>
              </Link>
            </div>
            <div className="border rounded-lg flex items-center justify-center px-1 py-1 h-9 min-w-[44px] hover:bg-muted transition-colors">
              <Link
                href="/github"
                className="w-full flex items-center justify-center"
                aria-label="GitHub Page"
              >
                <Github className="h-5 w-5 text-foreground" />
              </Link>
            </div>
            <div className="border rounded-lg flex items-center justify-center px-1 py-1 h-9 min-w-[44px] hover:bg-muted transition-colors">
              <Button
                variant="ghost"
                size="icon"
                className="w-full flex items-center justify-center"
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                aria-label="Toggle theme"
              >
                <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}