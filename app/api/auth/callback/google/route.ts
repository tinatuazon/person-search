import { NextRequest, NextResponse } from "next/server";
import { exchangeCodeForGoogleTokens, OAuthLogger } from "@/lib/oauth-utils";
import { getRedirectUris } from "@/lib/url-resolver";

/**
 * Google OAuth Callback Handler
 * Processes the authorization code from Google OAuth
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);
    
    const code = searchParams.get("code");
    const state = searchParams.get("state");
    const error = searchParams.get("error");
    const errorDescription = searchParams.get("error_description");

    console.log("🔗 Google OAuth Callback:", {
      hasCode: !!code,
      hasError: !!error,
      state: state?.substring(0, 10) + "...",
    });

    // Handle OAuth errors from Google
    if (error) {
      OAuthLogger.error("google-callback", `${error}: ${errorDescription}`);
      
      return NextResponse.redirect(
        new URL(`/auth/error?error=${encodeURIComponent(error)}&description=${encodeURIComponent(errorDescription || "")}`, request.url)
      );
    }

    // Validate authorization code
    if (!code) {
      return NextResponse.redirect(
        new URL("/auth/error?error=invalid_request&description=Missing authorization code", request.url)
      );
    }

    // Get OAuth credentials
    const googleClientId = process.env.GOOGLE_CLIENT_ID;
    const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;
    
    console.log("🔧 Environment Check:", {
      hasGoogleClientId: !!googleClientId,
      hasGoogleClientSecret: !!googleClientSecret,
      clientIdPreview: googleClientId?.substring(0, 10) + "...",
      nodeEnv: process.env.NODE_ENV
    });
    
    if (!googleClientId || !googleClientSecret) {
      console.error("❌ Missing OAuth credentials:", {
        googleClientId: !!googleClientId,
        googleClientSecret: !!googleClientSecret
      });
      OAuthLogger.error("google-callback", "Missing Google OAuth credentials");
      return NextResponse.redirect(
        new URL("/auth/error?error=server_error&description=OAuth not configured", request.url)
      );
    }

    // Exchange code for tokens
    const redirectUri = getRedirectUris().google;
    
    console.log("🔄 Token Exchange Request:", {
      redirectUri,
      hasClientId: !!googleClientId,
      hasClientSecret: !!googleClientSecret,
      codeLength: code.length
    });
    
    const { success, tokens, error: exchangeError } = await exchangeCodeForGoogleTokens(
      code,
      redirectUri,
      googleClientId,
      googleClientSecret
    );

    if (!success || !tokens) {
      OAuthLogger.error("google-token-exchange", exchangeError || "Unknown error");
      return NextResponse.redirect(
        new URL("/auth/error?error=invalid_grant&description=Token exchange failed", request.url)
      );
    }

    // Verify and extract user information
    let userInfo;
    try {
      // Use the ID token or access token to get user info
      const tokenToVerify = tokens.id_token || tokens.access_token || "";
      
      if (!tokenToVerify) {
        throw new Error("No valid token received from Google");
      }

      console.log("🔍 Verifying Google token...");
      
      // For ID tokens, we can decode and verify directly
      if (tokens.id_token) {
        // Verify ID token with Google
        const response = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${tokens.id_token}`);
        if (!response.ok) {
          throw new Error("Google token verification failed");
        }
        userInfo = await response.json();
      } else if (tokens.access_token) {
        // Use access token to get user info
        const response = await fetch(`https://www.googleapis.com/oauth2/v2/userinfo?access_token=${tokens.access_token}`);
        if (!response.ok) {
          throw new Error("Failed to fetch user info from Google");
        }
        userInfo = await response.json();
      }

      if (!userInfo || !userInfo.sub) {
        throw new Error("Invalid user information received from Google");
      }

    } catch (verifyError) {
      OAuthLogger.error("google-token-verification", verifyError instanceof Error ? verifyError.message : String(verifyError));
      return NextResponse.redirect(
        new URL("/auth/error?error=invalid_token&description=Token verification failed", request.url)
      );
    }

    console.log("✅ Google OAuth Success:", {
      sub: userInfo.sub,
      email: userInfo.email,
      name: userInfo.name,
      picture: userInfo.picture,
    });

    // Create session (in a real app, you'd use NextAuth.js or similar)
    // For this demo, we'll redirect to a success page with basic user info
    let redirectPath = "/auth/success";
    
    // Check if there's a return URL in the state
    if (state) {
      try {
        const stateData = JSON.parse(atob(state));
        if (stateData.returnUrl && stateData.returnUrl !== '/auth/login') {
          // Redirect directly to the intended page after setting session
          redirectPath = stateData.returnUrl;
        }
      } catch {
        // If state parsing fails, use default success page
      }
    }
    
    const successUrl = new URL(redirectPath, request.url);
    
    // Only add user info to URL if going to success page
    if (redirectPath === "/auth/success") {
      successUrl.searchParams.set("user", btoa(JSON.stringify({
        id: userInfo.sub,
        name: userInfo.name,
        email: userInfo.email,
        picture: userInfo.picture,
      })));

      if (state) {
        successUrl.searchParams.set("state", state);
      }
    }

    // Set an HTTP-only cookie for session management
    const response = NextResponse.redirect(successUrl);
    
    // In production, you'd use a proper session token here
    const sessionToken = btoa(JSON.stringify({
      sub: userInfo.sub,
      email: userInfo.email,
      name: userInfo.name,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24), // 24 hours
    }));

    response.cookies.set("oauth_session", sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24, // 24 hours
      path: "/",
    });

    return response;

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    OAuthLogger.error("google-callback-handler", errorMessage);
    
    return NextResponse.redirect(
      new URL(`/auth/error?error=server_error&description=${encodeURIComponent("Callback processing failed")}`, request.url)
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