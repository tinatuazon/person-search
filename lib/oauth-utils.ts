import { NextResponse } from "next/server";
import type {
  CORSConfig,
  GoogleTokens,
  OAuth21AuthParams,
  OAuth21ErrorResponse,
  TokenExchangeParams,
  TokenResponse,
} from "./auth-types";

/**
 * Standard CORS configurations for different endpoints
 */
export const CORS_CONFIGS = {
  // Standard API endpoints
  api: {
    origin: "*",
    methods: "GET, POST, OPTIONS",
    headers: "Content-Type, Authorization",
    maxAge: "86400",
  } as CORSConfig,

  // OAuth-specific endpoints
  oauth: {
    origin: "*",
    methods: "GET, POST, OPTIONS",
    headers: "Content-Type, Authorization",
    maxAge: "3600",
  } as CORSConfig,

  // Well-known endpoints
  wellKnown: {
    origin: "*",
    methods: "GET, OPTIONS",
    headers: "*",
    maxAge: "86400",
  } as CORSConfig,
} as const;

/**
 * Create CORS headers from configuration
 */
export function createCORSHeaders(config: CORSConfig): Record<string, string> {
  return {
    "Access-Control-Allow-Origin": config.origin,
    "Access-Control-Allow-Methods": config.methods,
    "Access-Control-Allow-Headers": config.headers,
    "Access-Control-Max-Age": config.maxAge,
  };
}

/**
 * Create OPTIONS response with CORS headers
 */
export function createOPTIONSResponse(
  config: CORSConfig = CORS_CONFIGS.api,
): NextResponse {
  return new NextResponse(null, {
    status: 200,
    headers: createCORSHeaders(config),
  });
}

/**
 * Create OAuth 2.1 compliant error response (JSON format)
 */
export function createOAuth21ErrorResponse(
  error: string,
  errorDescription: string,
  status: number = 400,
  additionalData?: Partial<OAuth21ErrorResponse>,
  corsConfig: CORSConfig = CORS_CONFIGS.oauth,
): NextResponse {
  const errorResponse: OAuth21ErrorResponse = {
    error,
    error_description: errorDescription,
    ...additionalData,
  };

  return NextResponse.json(errorResponse, {
    status,
    headers: createCORSHeaders(corsConfig),
  });
}

/**
 * Create OAuth 2.1 compliant error redirect
 */
export function createOAuth21ErrorRedirect(
  redirectUri: string | null,
  error: string,
  errorDescription: string,
  state?: string | null,
  corsConfig: CORSConfig = CORS_CONFIGS.oauth,
): NextResponse {
  if (!redirectUri) {
    return createOAuth21ErrorResponse(error, errorDescription, 400, {}, corsConfig);
  }

  try {
    const redirectUrl = new URL(redirectUri);
    redirectUrl.searchParams.set("error", error);
    redirectUrl.searchParams.set("error_description", errorDescription);
    
    if (state) {
      redirectUrl.searchParams.set("state", state);
    }

    return NextResponse.redirect(redirectUrl.toString(), {
      headers: createCORSHeaders(corsConfig),
    });
  } catch {
    return createOAuth21ErrorResponse("invalid_request", "Invalid redirect_uri", 400, {}, corsConfig);
  }
}

/**
 * Normalize redirect URI for OAuth 2.1 compatibility (localhost vs 127.0.0.1)
 */
export function normalizeRedirectUri(uri: string): string {
  return uri.replace("127.0.0.1", "localhost").replace(/\/$/, "").toLowerCase();
}

/**
 * Validate OAuth 2.1 authorization parameters
 */
export function validateAuthParams(params: OAuth21AuthParams): {
  isValid: boolean;
  error?: string;
  errorDescription?: string;
} {
  // response_type must be 'code'
  if (params.response_type !== "code") {
    return {
      isValid: false,
      error: "unsupported_response_type",
      errorDescription: "Only 'code' response type is supported",
    };
  }

  // client_id is required
  if (!params.client_id) {
    return {
      isValid: false,
      error: "invalid_request",
      errorDescription: "Missing client_id",
    };
  }

  // redirect_uri is required
  if (!params.redirect_uri) {
    return {
      isValid: false,
      error: "invalid_request",
      errorDescription: "Missing redirect_uri",
    };
  }

  // PKCE validation if present
  if (params.code_challenge && params.code_challenge_method !== "S256") {
    return {
      isValid: false,
      error: "invalid_request",
      errorDescription: "Only S256 code challenge method is supported",
    };
  }

  return { isValid: true };
}

/**
 * Validate token exchange parameters
 */
export function validateTokenParams(params: TokenExchangeParams): {
  isValid: boolean;
  error?: string;
  errorDescription?: string;
} {
  // grant_type must be authorization_code
  if (params.grant_type !== "authorization_code") {
    return {
      isValid: false,
      error: "unsupported_grant_type",
      errorDescription: "Only authorization_code grant type is supported",
    };
  }

  // code is required
  if (!params.code) {
    return {
      isValid: false,
      error: "invalid_request",
      errorDescription: "Missing authorization code",
    };
  }

  // redirect_uri is required
  if (!params.redirect_uri) {
    return {
      isValid: false,
      error: "invalid_request",
      errorDescription: "Missing redirect_uri",
    };
  }

  return { isValid: true };
}

/**
 * Build TokenResponse from Google tokens with consistent defaults
 */
export function buildTokenResponse(
  googleTokens: GoogleTokens,
  scope?: string,
  fallbackScope: string = "openid profile email",
): TokenResponse {
  const tokenResponse: TokenResponse = {
    access_token: googleTokens.id_token || googleTokens.access_token || "",
    token_type: "Bearer",
    expires_in: googleTokens.expires_in || 3600,
    scope: scope || fallbackScope,
  };

  // Include refresh token if available
  if (googleTokens.refresh_token) {
    tokenResponse.refresh_token = googleTokens.refresh_token;
  }

  // Include ID token if available (for OpenID Connect)
  if (googleTokens.id_token) {
    tokenResponse.id_token = googleTokens.id_token;
  }

  return tokenResponse;
}

/**
 * Exchange authorization code for Google tokens (reusable implementation)
 */
export async function exchangeCodeForGoogleTokens(
  code: string,
  redirectUri: string,
  clientId?: string,
  clientSecret?: string,
): Promise<{ success: boolean; tokens?: GoogleTokens; error?: string }> {
  try {
    const effectiveClientId = clientId || process.env.GOOGLE_CLIENT_ID;
    const effectiveClientSecret = clientSecret || process.env.GOOGLE_CLIENT_SECRET;
    
    if (!effectiveClientId || !effectiveClientSecret) {
      return {
        success: false,
        error: "Missing Google OAuth credentials (GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET)",
      };
    }

    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        client_id: effectiveClientId,
        client_secret: effectiveClientSecret,
        code: code,
        grant_type: "authorization_code",
        redirect_uri: redirectUri,
      }),
    });

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.text();
      return {
        success: false,
        error: `Google token exchange failed: ${errorData}`,
      };
    }

    const tokens = (await tokenResponse.json()) as GoogleTokens;
    return {
      success: true,
      tokens,
    };
  } catch (error) {
    return {
      success: false,
      error: `Token exchange error: ${error instanceof Error ? error.message : String(error)}`,
    };
  }
}

/**
 * Common logging patterns for OAuth operations
 */
export const OAuthLogger = {
  authRequest: (params: OAuth21AuthParams) => {
    console.log("🔐 OAuth Authorization Request:", {
      client_id: params.client_id?.substring(0, 10) + "...",
      redirect_uri: params.redirect_uri,
      response_type: params.response_type,
      scope: params.scope,
      state: params.state?.substring(0, 10) + "...",
      hasPKCE: !!params.code_challenge,
    });
  },

  tokenSuccess: (tokenResponse: TokenResponse) => {
    console.log("✅ OAuth Token Exchange Success:", {
      token_type: tokenResponse.token_type,
      expires_in: tokenResponse.expires_in,
      scope: tokenResponse.scope,
      hasRefreshToken: !!tokenResponse.refresh_token,
      hasIdToken: !!tokenResponse.id_token,
    });
  },

  error: (operation: string, error: string) => {
    console.error(`❌ OAuth Error in ${operation}:`, error);
  },
};