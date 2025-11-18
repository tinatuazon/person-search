/**
 * Environment-aware URL resolution for OAuth endpoints
 * Handles development, staging, and production environments
 */

const DEFAULT_LOCAL_PORT = "3000";
const DEFAULT_LOCAL_HOST = "localhost";

/**
 * Detect current environment and return appropriate base URL
 */
export function getBaseUrl(): string {
  // Production URL override (highest priority)
  if (process.env.PRODUCTION_URL) {
    return process.env.PRODUCTION_URL.replace(/\/$/, "");
  }

  // Production (Vercel or similar)
  if (process.env.NEXTAUTH_URL) {
    return process.env.NEXTAUTH_URL.replace(/\/$/, "");
  }

  // Vercel environment variables
  if (process.env.VERCEL_URL) {
    // For production deployments, use custom domain if available
    if (process.env.VERCEL_ENV === "production" && process.env.VERCEL_PROJECT_PRODUCTION_URL) {
      return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
    }
    return `https://${process.env.VERCEL_URL}`;
  }

  // Development environment
  if (process.env.NODE_ENV === "development") {
    const port = process.env.PORT || DEFAULT_LOCAL_PORT;
    const host = process.env.HOST || DEFAULT_LOCAL_HOST;
    return `http://${host}:${port}`;
  }

  // Fallback for unknown environments
  return `http://${DEFAULT_LOCAL_HOST}:${DEFAULT_LOCAL_PORT}`;
}

/**
 * Get OAuth-specific URLs with environment-aware resolution
 */
export const OAuthUrls = {
  /**
   * Authorization server metadata endpoint
   */
  get authorizationServerMetadata(): string {
    return `${getBaseUrl()}/.well-known/oauth-authorization-server`;
  },

  /**
   * Protected resource metadata endpoint
   */
  get protectedResourceMetadata(): string {
    return `${getBaseUrl()}/.well-known/oauth-protected-resource`;
  },

  /**
   * Authorization endpoint
   */
  get authorize(): string {
    return `${getBaseUrl()}/api/auth/authorize`;
  },

  /**
   * Token endpoint
   */
  get token(): string {
    return `${getBaseUrl()}/api/auth/token`;
  },

  /**
   * Registration endpoint (if supported)
   */
  get register(): string {
    return `${getBaseUrl()}/api/auth/register`;
  },

  /**
   * Google OAuth callback
   */
  get googleCallback(): string {
    return `${getBaseUrl()}/api/auth/callback/google`;
  },

  /**
   * OAuth login page
   */
  get login(): string {
    return `${getBaseUrl()}/auth/login`;
  },

  /**
   * OAuth logout endpoint
   */
  get logout(): string {
    return `${getBaseUrl()}/api/auth/logout`;
  },

  /**
   * UserInfo endpoint (if supported)
   */
  get userinfo(): string {
    return `${getBaseUrl()}/api/auth/userinfo`;
  },

  /**
   * Introspection endpoint (if supported)
   */
  get introspect(): string {
    return `${getBaseUrl()}/api/auth/introspect`;
  },

  /**
   * Revocation endpoint (if supported)
   */
  get revoke(): string {
    return `${getBaseUrl()}/api/auth/revoke`;
  },

  /**
   * MCP endpoint (secured)
   */
  get mcp(): string {
    return `${getBaseUrl()}/api/mcp`;
  },

  /**
   * People API endpoint (secured)
   */
  get people(): string {
    return `${getBaseUrl()}/api/people`;
  },
} as const;

/**
 * Get redirect URIs for different OAuth providers
 */
export function getRedirectUris() {
  const baseUrl = getBaseUrl();
  
  return {
    google: `${baseUrl}/api/auth/callback/google`,
    // Add other providers as needed
    // microsoft: `${baseUrl}/api/auth/callback/microsoft`,
    // github: `${baseUrl}/api/auth/callback/github`,
  };
}

/**
 * Validate if a redirect URI is allowed for this environment
 */
export function isAllowedRedirectUri(uri: string): boolean {
  const allowedRedirects = [
    // Current environment URLs
    ...Object.values(getRedirectUris()),
    // Development URLs
    "http://localhost:3000/api/auth/callback/google",
    "http://127.0.0.1:3000/api/auth/callback/google",
    // Production domain (hardcoded for security)
    "https://person-search-pearl.vercel.app/api/auth/callback/google",
  ];

  // Production URLs (if configured)
  if (process.env.NEXTAUTH_URL) {
    allowedRedirects.push(
      `${process.env.NEXTAUTH_URL}/api/auth/callback/google`.replace(/\/$/, "")
    );
  }

  // Production URL override
  if (process.env.PRODUCTION_URL) {
    allowedRedirects.push(
      `${process.env.PRODUCTION_URL}/api/auth/callback/google`.replace(/\/$/, "")
    );
  }

  // Vercel URLs
  if (process.env.VERCEL_URL) {
    allowedRedirects.push(
      `https://${process.env.VERCEL_URL}/api/auth/callback/google`
    );
  }

  console.log("🔍 Redirect URI Validation:", {
    requestedUri: uri,
    allowedRedirects,
    isAllowed: allowedRedirects.some(allowed => 
      allowed.replace("127.0.0.1", "localhost").replace(/\/$/, "") === 
      uri.replace("127.0.0.1", "localhost").replace(/\/$/, "")
    )
  });

  // Normalize URIs for comparison (handle localhost vs 127.0.0.1)
  const normalizedUri = uri.replace("127.0.0.1", "localhost").replace(/\/$/, "");
  const normalizedAllowed = allowedRedirects.map(url => 
    url.replace("127.0.0.1", "localhost").replace(/\/$/, "")
  );

  return normalizedAllowed.includes(normalizedUri);
}

/**
 * Get Google OAuth authorization URL with proper environment resolution
 */
export function getGoogleAuthUrl(
  clientId: string,
  scope: string = "openid profile email",
  state?: string,
  codeChallenge?: string,
  codeChallengeMethod?: string
): string {
  const redirectUri = getRedirectUris().google;
  
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope,
    access_type: "offline",
    prompt: "consent",
  });

  if (state) {
    params.set("state", state);
  }

  if (codeChallenge && codeChallengeMethod) {
    params.set("code_challenge", codeChallenge);
    params.set("code_challenge_method", codeChallengeMethod);
  }

  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

/**
 * Development mode detection and utilities
 */
export const DevUtils = {
  /**
   * Check if we're in development mode
   */
  get isDevelopment(): boolean {
    return process.env.NODE_ENV === "development";
  },

  /**
   * Check if we're in production mode
   */
  get isProduction(): boolean {
    return process.env.NODE_ENV === "production";
  },

  /**
   * Get environment name for logging
   */
  get environmentName(): string {
    if (this.isDevelopment) return "development";
    if (this.isProduction) return "production";
    return process.env.NODE_ENV || "unknown";
  },

  /**
   * Log URL resolution for debugging
   */
  logUrlResolution(): void {
    console.log("🌐 URL Resolution Debug:", {
      environment: this.environmentName,
      baseUrl: getBaseUrl(),
      authUrls: {
        authorize: OAuthUrls.authorize,
        token: OAuthUrls.token,
        googleCallback: OAuthUrls.googleCallback,
      },
      envVars: {
        NEXTAUTH_URL: process.env.NEXTAUTH_URL || "not set",
        PRODUCTION_URL: process.env.PRODUCTION_URL || "not set",
        VERCEL_URL: process.env.VERCEL_URL || "not set",
        VERCEL_ENV: process.env.VERCEL_ENV || "not set",
        VERCEL_PROJECT_PRODUCTION_URL: process.env.VERCEL_PROJECT_PRODUCTION_URL || "not set",
        PORT: process.env.PORT || "not set",
        HOST: process.env.HOST || "not set",
      },
    });
  },
} as const;

/**
 * Utility for constructing URLs with query parameters
 */
export function buildUrl(baseUrl: string, path: string, params?: Record<string, string>): string {
  let url = `${baseUrl.replace(/\/$/, "")}/${path.replace(/^\//, "")}`;
  
  if (params && Object.keys(params).length > 0) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.set(key, value);
      }
    });
    
    const queryString = searchParams.toString();
    if (queryString) {
      url += `?${queryString}`;
    }
  }
  
  return url;
}

/**
 * Extract hostname from URL for logging/debugging
 */
export function getUrlHost(url: string): string {
  try {
    return new URL(url).hostname;
  } catch {
    return "invalid-url";
  }
}