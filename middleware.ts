import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Define routes that require authentication
const protectedRoutes = [
  '/',
  '/about',
  '/mcp',
  // Add other routes you want to protect
]

// Define routes that should be accessible without authentication
const publicRoutes = [
  '/auth/login',
  '/auth/success', 
  '/auth/error',
  '/api/auth',
  '/api/mcp', // MCP has its own Bearer token auth
  '/.well-known',
  '/favicon.ico',
  '/_next'
]

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Skip middleware for public routes and API routes that have their own auth
  if (publicRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.next()
  }

  // Check if the current path is a protected route
  const isProtectedRoute = protectedRoutes.some(route => {
    if (route === '/') {
      return pathname === '/'
    }
    return pathname.startsWith(route)
  })

  if (isProtectedRoute) {
    // Check for authentication session cookie
    const sessionCookie = request.cookies.get('oauth_session')
    
    if (!sessionCookie) {
      // No session - redirect to login with return URL
      const loginUrl = new URL('/auth/login', request.url)
      loginUrl.searchParams.set('returnUrl', pathname)
      
      console.log(`🔒 Redirecting unauthenticated user from ${pathname} to login`)
      return NextResponse.redirect(loginUrl)
    }

    // Verify session validity (basic check)
    try {
      const sessionData = JSON.parse(atob(sessionCookie.value))
      const now = Math.floor(Date.now() / 1000)
      
      if (sessionData.exp && sessionData.exp < now) {
        // Session expired - redirect to login
        const loginUrl = new URL('/auth/login', request.url)
        loginUrl.searchParams.set('returnUrl', pathname)
        loginUrl.searchParams.set('expired', 'true')
        
        console.log(`⏰ Session expired for user ${sessionData.email} - redirecting to login`)
        
        // Clear expired session cookie
        const response = NextResponse.redirect(loginUrl)
        response.cookies.delete('oauth_session')
        return response
      }
      
      console.log(`✅ Authenticated user ${sessionData.email} accessing ${pathname}`)
      
    } catch (error) {
      // Invalid session cookie - redirect to login
      const loginUrl = new URL('/auth/login', request.url)
      loginUrl.searchParams.set('returnUrl', pathname)
      
      console.log(`❌ Invalid session cookie - redirecting to login`)
      
      const response = NextResponse.redirect(loginUrl)
      response.cookies.delete('oauth_session')
      return response
    }
  }

  return NextResponse.next()
}

// Configure which routes this middleware runs on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (OAuth endpoints handle their own auth)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api/auth|_next/static|_next/image|favicon.ico).*)',
  ],
}