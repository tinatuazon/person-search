import { NextRequest, NextResponse } from "next/server";
import {
  createOAuth21ErrorResponse,
  createOAuth21ErrorRedirect,
  validateAuthParams,
  normalizeRedirectUri,
  OAuthLogger,
} from "@/lib/oauth-utils";
import { getGoogleAuthUrl, isAllowedRedirectUri } from "@/lib/url-resolver";
import type { OAuth21AuthParams } from "@/lib/auth-types";

/**
 * OAuth 2.1 Authorization Endpoint
 * 
 * ⚠️  IMPORTANT: This endpoint is designed for MCP (Model Context Protocol) client authentication,
 * not for regular user authentication via the web interface.
 * 
 * For regular users:
 * - Web users should authenticate directly with Google OAuth
 * - The login page redirects directly to Google, not this endpoint
 * 
 * For MCP clients:
 * - MCP tools (like GitHub Copilot, Claude Desktop) use this endpoint
 * - This acts as an OAuth 2.1 proxy to Google OAuth for API access
 * 
 * Handles authorization requests and redirects to Google OAuth
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);
    
    console.log("🔐 OAuth Authorization Request received:", {
      userAgent: request.headers.get('user-agent')?.substring(0, 50),
      origin: request.headers.get('origin'),
      referer: request.headers.get('referer'),
    });
    
    // Extract OAuth 2.1 parameters
    const authParams: OAuth21AuthParams = {
      response_type: searchParams.get("response_type") || "",
      client_id: searchParams.get("client_id") || "",
      redirect_uri: searchParams.get("redirect_uri") || "",
      scope: searchParams.get("scope") || "openid profile email",
      state: searchParams.get("state"),
      code_challenge: searchParams.get("code_challenge"),
      code_challenge_method: searchParams.get("code_challenge_method") || undefined,
    };

    OAuthLogger.authRequest(authParams);

    // Validate OAuth 2.1 parameters
    const paramValidation = validateAuthParams(authParams);
    if (!paramValidation.isValid) {
      return createOAuth21ErrorRedirect(
        authParams.redirect_uri || '',
        paramValidation.error!,
        paramValidation.errorDescription!,
        authParams.state
      );
    }

    // Validate client_id (Google OAuth client)
    const googleClientId = process.env.GOOGLE_CLIENT_ID;
    if (!googleClientId || authParams.client_id !== googleClientId) {
      return createOAuth21ErrorRedirect(
        authParams.redirect_uri || '',
        "invalid_client",
        "Invalid client identifier",
        authParams.state
      );
    }

    // Validate redirect_uri
    const normalizedRedirectUri = normalizeRedirectUri(authParams.redirect_uri || '');
    if (!isAllowedRedirectUri(normalizedRedirectUri)) {
      return createOAuth21ErrorResponse(
        "invalid_request",
        "Invalid redirect_uri"
      );
    }

    // Build Google OAuth URL with PKCE support
    const googleAuthUrl = getGoogleAuthUrl(
      googleClientId,
      authParams.scope || undefined,
      authParams.state || undefined,
      authParams.code_challenge || undefined,
      authParams.code_challenge_method || undefined
    );

    console.log("🚀 Redirecting to Google OAuth:", {
      redirect_uri: authParams.redirect_uri || '',
      scope: authParams.scope,
      hasPKCE: !!authParams.code_challenge,
      hasState: !!authParams.state,
    });

    // Redirect to Google OAuth
    return NextResponse.redirect(googleAuthUrl);

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    OAuthLogger.error("authorization", errorMessage);
    
    return createOAuth21ErrorResponse(
      "server_error",
      "Authorization server error"
    );
  }
}

/**
 * Handle POST requests (form submissions)
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const formData = await request.formData();
    
    const authParams: OAuth21AuthParams = {
      response_type: formData.get("response_type")?.toString() || "",
      client_id: formData.get("client_id")?.toString() || "",
      redirect_uri: formData.get("redirect_uri")?.toString() || "",
      scope: formData.get("scope")?.toString() || "openid profile email",
      state: formData.get("state")?.toString(),
      code_challenge: formData.get("code_challenge")?.toString(),
      code_challenge_method: formData.get("code_challenge_method")?.toString(),
    };

    // Redirect to GET handler with query parameters
    const authUrl = new URL(request.url);
    authUrl.search = ""; // Clear existing params
    
    Object.entries(authParams).forEach(([key, value]) => {
      if (value) {
        authUrl.searchParams.set(key, value);
      }
    });

    return NextResponse.redirect(authUrl.toString());

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    OAuthLogger.error("authorization-post", errorMessage);
    
    return createOAuth21ErrorResponse(
      "server_error",
      "Authorization server error"
    );
  }
}

export async function OPTIONS(): Promise<NextResponse> {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Access-Control-Max-Age": "3600",
    },
  });
}