import { NextRequest, NextResponse } from "next/server";

/**
 * Session Status Endpoint
 * Allows client-side code to check authentication status
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    // Check for session cookie
    const sessionCookie = request.cookies.get('oauth_session');
    
    if (!sessionCookie) {
      return NextResponse.json({ 
        authenticated: false,
        user: null,
        message: "No session found"
      });
    }

    // Parse and validate session
    try {
      const sessionData = JSON.parse(atob(sessionCookie.value));
      const now = Math.floor(Date.now() / 1000);
      
      // Check if session is expired
      if (sessionData.exp && sessionData.exp < now) {
        return NextResponse.json({ 
          authenticated: false,
          user: null,
          message: "Session expired"
        });
      }

      // Session is valid
      return NextResponse.json({ 
        authenticated: true,
        user: {
          sub: sessionData.sub,
          email: sessionData.email,
          name: sessionData.name,
          exp: sessionData.exp
        },
        message: "Session valid"
      });

    } catch (parseError) {
      console.error("Invalid session cookie format:", parseError);
      
      // Clear invalid cookie
      const response = NextResponse.json({ 
        authenticated: false,
        user: null,
        message: "Invalid session format"
      });
      
      response.cookies.delete('oauth_session');
      return response;
    }

  } catch (error) {
    console.error("Session check error:", error);
    
    return NextResponse.json(
      { 
        authenticated: false, 
        user: null,
        message: "Session check failed" 
      },
      { status: 500 }
    );
  }
}

/**
 * Handle OPTIONS for CORS
 */
export async function OPTIONS(): Promise<NextResponse> {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Max-Age": "3600",
    },
  });
}