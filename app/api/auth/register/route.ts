import { NextRequest, NextResponse } from "next/server";
import { createOAuth21ErrorResponse, CORS_CONFIGS } from "@/lib/oauth-utils";

/**
 * OAuth 2.1 Client Registration Endpoint (Optional)
 * Dynamic client registration per RFC 7591
 */
export async function POST(): Promise<NextResponse> {
  try {
    // For this demo, we don't support dynamic client registration
    // In production, you might implement this for programmatic client setup
    
    return createOAuth21ErrorResponse(
      "unsupported_operation",
      "Dynamic client registration is not supported. Use static client configuration.",
      501, // Not Implemented
      {
        error_uri: "https://docs.mcp.app/oauth/static-registration"
      },
      CORS_CONFIGS.oauth
    );
    
  } catch (error) {
    console.error("❌ Registration endpoint error:", error);
    
    return createOAuth21ErrorResponse(
      "server_error",
      "Registration endpoint error",
      500,
      {},
      CORS_CONFIGS.oauth
    );
  }
}

/**
 * GET method to return registration information
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const registrationInfo = {
      registration_endpoint: new URL("/api/auth/register", request.url).toString(),
      supported: false,
      message: "Dynamic client registration is not supported",
      static_registration: {
        documentation: "https://docs.mcp.app/oauth/static-registration",
        instructions: [
          "1. Configure GOOGLE_CLIENT_ID in environment variables",
          "2. Configure GOOGLE_CLIENT_SECRET in environment variables", 
          "3. Set redirect URI to: /api/auth/callback/google",
          "4. Use the Google Client ID as client_id in OAuth requests"
        ]
      },
      supported_grant_types: ["authorization_code"],
      supported_response_types: ["code"],
      supported_scopes: [
        "openid",
        "profile", 
        "email",
        "read:mcp",
        "write:mcp",
        "persons:read",
        "persons:write"
      ]
    };

    return NextResponse.json(registrationInfo, {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...CORS_CONFIGS.api,
      },
    });

  } catch (error) {
    console.error("❌ Registration info error:", error);
    
    return createOAuth21ErrorResponse(
      "server_error", 
      "Failed to retrieve registration information",
      500,
      {},
      CORS_CONFIGS.oauth
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