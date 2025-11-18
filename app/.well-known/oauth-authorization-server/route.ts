import { NextResponse } from "next/server";
import { OAuthUrls } from "@/lib/url-resolver";
import { createCORSHeaders, CORS_CONFIGS } from "@/lib/oauth-utils";

/**
 * OAuth 2.1 Authorization Server Metadata
 * RFC 8414 compliant metadata endpoint
 */
export async function GET(): Promise<NextResponse> {
  try {
    const metadata = {
      issuer: OAuthUrls.authorize.replace("/api/auth/authorize", ""),
      authorization_endpoint: OAuthUrls.authorize,
      token_endpoint: OAuthUrls.token,
      
      // Supported response types
      response_types_supported: ["code"],
      
      // Supported grant types
      grant_types_supported: ["authorization_code"],
      
      // Supported scopes
      scopes_supported: [
        "openid",
        "profile", 
        "email",
        "read:mcp",
        "write:mcp", 
        "persons:read",
        "persons:write"
      ],
      
      // PKCE support (OAuth 2.1 requirement)
      code_challenge_methods_supported: ["S256"],
      
      // Token endpoint auth methods
      token_endpoint_auth_methods_supported: [
        "client_secret_post",
        "client_secret_basic"
      ],
      
      // Optional endpoints
      registration_endpoint: OAuthUrls.register,
      userinfo_endpoint: OAuthUrls.userinfo,
      introspection_endpoint: OAuthUrls.introspect,
      revocation_endpoint: OAuthUrls.revoke,
      
      // OAuth 2.1 compliance
      require_pushed_authorization_requests: false,
      pushed_authorization_request_endpoint: null,
      
      // Security features
      tls_client_certificate_bound_access_tokens: false,
      
      // Additional metadata
      service_documentation: "https://docs.mcp.app/oauth",
      ui_locales_supported: ["en"],
      
      // Custom claims (MCP-specific)
      claims_supported: [
        "sub",
        "name", 
        "email",
        "picture",
        "given_name",
        "family_name",
        "locale",
        "mcp_scopes"
      ]
    };

    console.log("📋 Serving OAuth Authorization Server Metadata");

    return NextResponse.json(metadata, {
      status: 200,
      headers: {
        ...createCORSHeaders(CORS_CONFIGS.wellKnown),
        "Cache-Control": "public, max-age=86400", // 24 hours
        "Content-Type": "application/json",
      },
    });

  } catch (error) {
    console.error("❌ Error serving authorization server metadata:", error);
    
    return NextResponse.json(
      { 
        error: "server_error", 
        error_description: "Failed to serve authorization server metadata" 
      },
      {
        status: 500,
        headers: createCORSHeaders(CORS_CONFIGS.wellKnown),
      }
    );
  }
}

export async function OPTIONS(): Promise<NextResponse> {
  return new NextResponse(null, {
    status: 200,
    headers: createCORSHeaders(CORS_CONFIGS.wellKnown),
  });
}