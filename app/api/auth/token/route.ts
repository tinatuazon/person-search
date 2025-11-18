import { NextRequest, NextResponse } from "next/server";
import {
  createOAuth21ErrorResponse,
  validateTokenParams,
  buildTokenResponse,
  exchangeCodeForGoogleTokens,
  CORS_CONFIGS,
  OAuthLogger,
} from "@/lib/oauth-utils";
import { verifyGoogleToken } from "@/lib/auth";
import { isAllowedRedirectUri } from "@/lib/url-resolver";
import type { TokenExchangeParams } from "@/lib/auth-types";

/**
 * OAuth 2.1 Token Endpoint
 * Exchanges authorization code for access tokens
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const contentType = request.headers.get("content-type") || "";
    let tokenParams: TokenExchangeParams;

    // Parse request based on content type
    if (contentType.includes("application/json")) {
      tokenParams = await request.json();
    } else {
      // Form-encoded (standard OAuth 2.1)
      const formData = await request.formData();
      tokenParams = {
        grant_type: formData.get("grant_type")?.toString() || "",
        code: formData.get("code")?.toString() || "",
        redirect_uri: formData.get("redirect_uri")?.toString() || "",
        client_id: formData.get("client_id")?.toString() || "",
        client_secret: formData.get("client_secret")?.toString() || "",
        code_verifier: formData.get("code_verifier")?.toString(),
      };
    }

    console.log("🔄 OAuth Token Exchange Request:", {
      grant_type: tokenParams.grant_type,
      client_id: tokenParams.client_id?.substring(0, 10) + "...",
      redirect_uri: tokenParams.redirect_uri || '',
      hasCodeVerifier: !!tokenParams.code_verifier,
      hasCode: !!tokenParams.code,
    });

    // Validate token exchange parameters
    const paramValidation = validateTokenParams(tokenParams);
    if (!paramValidation.isValid) {
      return createOAuth21ErrorResponse(
        paramValidation.error!,
        paramValidation.errorDescription!
      );
    }

    // Validate client credentials
    const googleClientId = process.env.GOOGLE_CLIENT_ID;
    const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;
    
    if (!googleClientId || !googleClientSecret) {
      return createOAuth21ErrorResponse(
        "server_error",
        "OAuth client not configured"
      );
    }

    if (tokenParams.client_id !== googleClientId) {
      return createOAuth21ErrorResponse(
        "invalid_client",
        "Invalid client identifier"
      );
    }

    // Client authentication (client_secret_post or client_secret_basic)
    let clientSecret = tokenParams.client_secret;
    
    // Check for Basic authentication if no secret in body
    if (!clientSecret) {
      const authHeader = request.headers.get("authorization");
      if (authHeader?.startsWith("Basic ")) {
        try {
          const credentials = atob(authHeader.slice(6));
          const [clientId, secret] = credentials.split(":");
          if (clientId === googleClientId) {
            clientSecret = secret;
          }
        } catch {
          // Invalid Basic auth format
        }
      }
    }

    if (!clientSecret || clientSecret !== googleClientSecret) {
      return createOAuth21ErrorResponse(
        "invalid_client",
        "Invalid client authentication"
      );
    }

    // Validate redirect URI
    if (!isAllowedRedirectUri(tokenParams.redirect_uri || '')) {
      return createOAuth21ErrorResponse(
        "invalid_request",
        "Invalid redirect_uri"
      );
    }

    // Exchange code for Google tokens
    const { success, tokens, error } = await exchangeCodeForGoogleTokens(
      tokenParams.code || '',
      tokenParams.redirect_uri || '',
      googleClientId,
      googleClientSecret
    );

    if (!success || !tokens) {
      OAuthLogger.error("token-exchange", error || "Unknown error");
      return createOAuth21ErrorResponse(
        "invalid_grant",
        "Invalid authorization code"
      );
    }

    // Verify Google tokens
    let userInfo;
    try {
      userInfo = await verifyGoogleToken(
        request,
        tokens.id_token || tokens.access_token || ""
      );
    } catch (verifyError) {
      OAuthLogger.error("token-verification", verifyError instanceof Error ? verifyError.message : String(verifyError));
      return createOAuth21ErrorResponse(
        "invalid_grant",
        "Token verification failed"
      );
    }

    if (!userInfo) {
      return createOAuth21ErrorResponse(
        "invalid_grant",
        "Failed to verify user information"
      );
    }

    // PKCE verification (if code_verifier provided)
    if (tokenParams.code_verifier) {
      // Note: In a real implementation, you'd store the code_challenge 
      // during authorization and retrieve it here for verification
      // For this demo, we'll skip PKCE verification as it requires session storage
      console.log("🔐 PKCE code_verifier received (verification skipped in demo)");
    }

    // Build OAuth 2.1 compliant token response
    const tokenResponse = buildTokenResponse(
      tokens,
      "openid profile email read:mcp write:mcp persons:read persons:write"
    );

    OAuthLogger.tokenSuccess(tokenResponse);

    // Store user session (in real app, you'd use a proper session store)
    console.log("👤 User authenticated:", {
      sub: userInfo.sub,
      email: userInfo.email,
      name: userInfo.name,
    });

    return NextResponse.json(tokenResponse, {
      status: 200,
      headers: {
        "Cache-Control": "no-store",
        "Pragma": "no-cache",
        "Content-Type": "application/json",
        ...CORS_CONFIGS.oauth,
      },
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    OAuthLogger.error("token-endpoint", errorMessage);
    
    return createOAuth21ErrorResponse(
      "server_error",
      "Token endpoint error"
    );
  }
}

export async function OPTIONS(): Promise<NextResponse> {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Access-Control-Max-Age": "3600",
    },
  });
}