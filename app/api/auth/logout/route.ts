import { NextRequest, NextResponse } from "next/server";

/**
 * OAuth 2.1 Logout Handler
 * Securely terminates user sessions and provides logout redirect
 */
export async function POST(): Promise<NextResponse> {
  try {
    console.log("🚪 Logout request received");
    
    // Clear the session cookie
    const response = NextResponse.json({ 
      success: true, 
      message: "Logged out successfully" 
    });

    // Remove session cookie
    response.cookies.delete('oauth_session');
    
    // Additional security: clear any other auth-related cookies
    response.cookies.delete('oauth_state'); // if you had state cookies
    response.cookies.delete('oauth_nonce'); // if you had nonce cookies

    console.log("✅ Session cleared successfully");
    
    return response;

  } catch (error) {
    console.error("❌ Logout error:", error);
    
    // Even if there's an error, still try to clear cookies
    const response = NextResponse.json(
      { success: false, error: "Logout failed" },
      { status: 500 }
    );
    
    response.cookies.delete('oauth_session');
    return response;
  }
}

/**
 * GET handler for logout redirect
 * Allows users to logout via direct URL access
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);
    const redirectUrl = searchParams.get('redirect') || '/auth/login';
    
    console.log("🚪 Logout redirect request");
    
    // Create redirect response
    const response = NextResponse.redirect(new URL(redirectUrl, request.url));
    
    // Clear session cookie
    response.cookies.delete('oauth_session');
    
    // Add logout success indicator
    const finalUrl = new URL(redirectUrl, request.url);
    if (!finalUrl.searchParams.has('logout')) {
      finalUrl.searchParams.set('logout', 'success');
    }
    
    console.log("✅ Logout successful, redirecting to:", finalUrl.pathname);
    
    return NextResponse.redirect(finalUrl);

  } catch (error) {
    console.error("❌ Logout redirect error:", error);
    
    // Fallback to login page
    const response = NextResponse.redirect(new URL('/auth/login', request.url));
    response.cookies.delete('oauth_session');
    
    return response;
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
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Max-Age": "3600",
    },
  });
}