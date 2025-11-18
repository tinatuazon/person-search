import { NextResponse } from "next/server";
import { OAuthUrls } from "@/lib/url-resolver";
import { createCORSHeaders, CORS_CONFIGS } from "@/lib/oauth-utils";

/**
 * OAuth 2.1 Protected Resource Metadata
 * RFC 8414 compliant metadata for protected resources
 */
export async function GET(): Promise<NextResponse> {
  try {
    const metadata = {
      // Resource server identifier
      resource: OAuthUrls.mcp.replace("/api/mcp", ""),
      
      // Authorization server that protects this resource
      authorization_servers: [
        OAuthUrls.authorize.replace("/api/auth/authorize", "")
      ],
      
      // Scopes required for this protected resource
      scopes_required: [
        "read:mcp",
        "write:mcp",
        "persons:read", 
        "persons:write"
      ],
      
      // Bearer token usage
      bearer_methods_supported: ["header"],
      
      // Protected resource endpoints
      resource_endpoints: [
        {
          endpoint: OAuthUrls.mcp,
          scopes: ["read:mcp", "write:mcp"],
          methods: ["GET", "POST"],
          description: "Model Context Protocol server endpoint"
        },
        {
          endpoint: OAuthUrls.people,
          scopes: ["persons:read", "persons:write"],
          methods: ["GET", "POST", "PUT", "DELETE"],
          description: "Person data management API"
        }
      ],
      
      // Token introspection endpoint (for resource server validation)
      introspection_endpoint: OAuthUrls.introspect,
      
      // Introspection authentication methods
      introspection_endpoint_auth_methods_supported: [
        "client_secret_basic",
        "client_secret_post"
      ],
      
      // Token types accepted
      token_types_supported: [
        "Bearer",
        "access_token"
      ],
      
      // Security requirements
      tls_client_certificate_bound_access_tokens: false,
      
      // OAuth 2.1 compliance features
      resource_indicators_supported: true,
      authorization_details_supported: false,
      
      // Additional metadata
      resource_documentation: "https://docs.mcp.app/protected-resources",
      resource_policy_uri: "https://docs.mcp.app/privacy-policy",
      resource_tos_uri: "https://docs.mcp.app/terms-of-service",
      
      // Custom metadata for MCP
      mcp_version: "1.0.3",
      supported_protocols: ["mcp"],
      api_version: "v1",
      
      // Rate limiting information
      rate_limit_policy: {
        requests_per_minute: 100,
        burst_limit: 20
      }
    };

    console.log("🛡️ Serving OAuth Protected Resource Metadata");

    return NextResponse.json(metadata, {
      status: 200,
      headers: {
        ...createCORSHeaders(CORS_CONFIGS.wellKnown),
        "Cache-Control": "public, max-age=86400", // 24 hours
        "Content-Type": "application/json",
      },
    });

  } catch (error) {
    console.error("❌ Error serving protected resource metadata:", error);
    
    return NextResponse.json(
      { 
        error: "server_error", 
        error_description: "Failed to serve protected resource metadata" 
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