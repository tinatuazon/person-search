// app/api/mcp/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { handleMCPTool } from '@/app/actions/mcp-actions'
import { MCP_TOOLS } from '@/lib/mcp-server'
import { verifyGoogleToken } from '@/lib/auth'
import { createCORSHeaders, CORS_CONFIGS } from '@/lib/oauth-utils'

interface MCPRequest {
  jsonrpc: string
  id: number | string
  method: string
  params?: {
    name?: string
    arguments?: Record<string, unknown>
  }
}

/**
 * OAuth 2.1 Authentication Middleware for MCP
 */
async function authenticateMCPRequest(request: NextRequest): Promise<{
  authenticated: boolean;
  user?: Record<string, unknown>;
  error?: string;
  errorResponse?: NextResponse;
}> {
  try {
    // First, try Authorization header (for API clients)
    const authHeader = request.headers.get('authorization');
    
    if (authHeader) {
      // Extract Bearer token
      const token = authHeader.startsWith('Bearer ') 
        ? authHeader.slice(7) 
        : authHeader;

      if (!token) {
        return {
          authenticated: false,
          error: 'Invalid authorization header format',
          errorResponse: NextResponse.json({
            jsonrpc: '2.0',
            id: null,
            error: {
              code: -32603,
              message: 'Unauthorized - Invalid token format'
            }
          }, {
            status: 401,
            headers: {
              'WWW-Authenticate': 'Bearer realm="mcp", scope="read:mcp write:mcp"',
              ...createCORSHeaders(CORS_CONFIGS.api)
            }
          })
        };
      }

      // Verify Google token
      try {
        const userInfo = await verifyGoogleToken(request, token);
        
        if (userInfo) {
          console.log('✅ MCP Bearer Token Authentication Success:', {
            sub: userInfo.sub,
            email: userInfo.email,
            name: userInfo.name,
          });

          return {
            authenticated: true,
            user: userInfo.user
          };
        }
      } catch (verifyError) {
        console.error('🚫 MCP Bearer Token Verification Failed:', verifyError);
      }
    }
    
    // If no Authorization header or Bearer token failed, try session cookie (for web requests)
    const sessionCookie = request.cookies.get('oauth_session');
    
    if (sessionCookie) {
      try {
        const sessionData = JSON.parse(atob(sessionCookie.value));
        const now = Math.floor(Date.now() / 1000);
        
        // Check if session is expired
        if (sessionData.exp && sessionData.exp < now) {
          return {
            authenticated: false,
            error: 'Session expired',
            errorResponse: NextResponse.json({
              jsonrpc: '2.0',
              id: null,
              error: {
                code: -32603,
                message: 'Unauthorized - Session expired'
              }
            }, {
              status: 401,
              headers: createCORSHeaders(CORS_CONFIGS.api)
            })
          };
        }

        console.log('✅ MCP Session Cookie Authentication Success:', {
          sub: sessionData.sub,
          email: sessionData.email,
          name: sessionData.name,
        });

        // Convert session data to AuthInfo format
        const userInfo = {
          token: 'session-based',
          clientId: sessionData.sub,
          scopes: ['read:mcp', 'write:mcp', 'persons:read', 'persons:write'],
          extra: {
            email: sessionData.email,
            name: sessionData.name,
            provider: 'session',
            tokenType: 'session_cookie',
            mcpCompliant: '2025-06-18',
          }
        };

        return {
          authenticated: true,
          user: userInfo
        };

      } catch (parseError) {
        console.error('❌ Invalid session cookie format:', parseError);
        
        return {
          authenticated: false,
          error: 'Invalid session cookie',
          errorResponse: NextResponse.json({
            jsonrpc: '2.0',
            id: null,
            error: {
              code: -32603,
              message: 'Unauthorized - Invalid session'
            }
          }, {
            status: 401,
            headers: createCORSHeaders(CORS_CONFIGS.api)
          })
        };
      }
    }

    // No valid authentication found
    return {
      authenticated: false,
      error: 'Missing authorization header or session cookie',
      errorResponse: NextResponse.json({
        jsonrpc: '2.0',
        id: null,
        error: {
          code: -32603,
          message: 'Unauthorized - Missing authorization header or session cookie'
        }
      }, {
        status: 401,
        headers: {
          'WWW-Authenticate': 'Bearer realm="mcp", scope="read:mcp write:mcp"',
          ...createCORSHeaders(CORS_CONFIGS.api)
        }
      })
    };

  } catch (error) {
    console.error('❌ MCP Authentication Error:', error);
    
    return {
      authenticated: false,
      error: 'Authentication system error',
      errorResponse: NextResponse.json({
        jsonrpc: '2.0',
        id: null,
        error: {
          code: -32603,
          message: 'Internal authentication error'
        }
      }, {
        status: 500,
        headers: createCORSHeaders(CORS_CONFIGS.api)
      })
    };
  }
}

/**
 * Check if MCP method requires authentication
 */
function requiresAuthentication(method: string): boolean {
  // Allow unauthenticated access to basic info methods
  const publicMethods = ['initialize', 'tools/list'];
  return !publicMethods.includes(method);
}

export async function POST(request: NextRequest) {
  try {
    const body: MCPRequest = await request.json()

    // Check if method requires authentication
    if (requiresAuthentication(body.method)) {
      const authResult = await authenticateMCPRequest(request);
      
      if (!authResult.authenticated) {
        return authResult.errorResponse!;
      }

      // Add user context to request for tool execution
      (request as NextRequest & { user: Record<string, unknown> }).user = authResult.user || {};
    }

    console.log('🔧 MCP Request:', {
      method: body.method,
      id: body.id,
      authenticated: !requiresAuthentication(body.method) || 'user' in (request as NextRequest & { user?: Record<string, unknown> }),
      toolName: body.params?.name,
    });

    // Handle MCP protocol methods
    switch (body.method) {
      case 'initialize':
        return NextResponse.json({
          jsonrpc: '2.0',
          id: body.id,
          result: {
            protocolVersion: '2024-11-05',
            capabilities: {
              tools: {},
              resources: {},
              prompts: {}
            },
            serverInfo: {
              name: 'person-search-mcp-server',
              version: '1.0.0',
              description: 'OAuth-secured MCP Server for Person Search App'
            }
          }
        }, {
          headers: createCORSHeaders(CORS_CONFIGS.api)
        })

      case 'tools/list':
        return NextResponse.json({
          jsonrpc: '2.0',
          id: body.id,
          result: {
            tools: MCP_TOOLS
          }
        }, {
          headers: createCORSHeaders(CORS_CONFIGS.api)
        })

      case 'tools/call': {
        if (!body.params) {
          return NextResponse.json({
            jsonrpc: '2.0',
            id: body.id,
            error: {
              code: -32602,
              message: 'Missing parameters'
            }
          }, {
            headers: createCORSHeaders(CORS_CONFIGS.api)
          })
        }
        
        const { name, arguments: args } = body.params
        
        if (!name || typeof name !== 'string') {
          return NextResponse.json({
            jsonrpc: '2.0',
            id: body.id,
            error: {
              code: -32602,
              message: 'Invalid tool name'
            }
          }, {
            headers: createCORSHeaders(CORS_CONFIGS.api)
          })
        }

        // Validate tool name
        const validTools = ['search_users', 'add_user', 'update_user', 'delete_user', 'get_user_by_id'] as const
        if (!validTools.includes(name as typeof validTools[number])) {
          return NextResponse.json({
            jsonrpc: '2.0',
            id: body.id,
            error: {
              code: -32601,
              message: `Tool '${name}' not found`
            }
          }, {
            headers: createCORSHeaders(CORS_CONFIGS.api)
          })
        }

        try {
          // Execute tool with user context
          const userContext = (request as NextRequest & { user?: Record<string, unknown> }).user;
          const result = await handleMCPTool(
            name as typeof validTools[number], 
            args || {}, 
            userContext as { clientId: string; extra?: { email?: string; name?: string } } | undefined
          )
          
          console.log('✅ MCP Tool Success:', {
            tool: name,
            user: (userContext as { clientId: string; extra?: { email?: string; name?: string } } | undefined)?.extra?.email || 'anonymous',
            resultLength: result.length
          });
          
          return NextResponse.json({
            jsonrpc: '2.0',
            id: body.id,
            result: {
              content: [
                {
                  type: 'text',
                  text: result
                }
              ]
            }
          }, {
            headers: createCORSHeaders(CORS_CONFIGS.api)
          })
        } catch (error) {
          console.error('❌ MCP Tool execution error:', error)
          return NextResponse.json({
            jsonrpc: '2.0',
            id: body.id,
            error: {
              code: -32603,
              message: 'Tool execution failed',
              data: error instanceof Error ? error.message : 'Unknown error'
            }
          }, {
            headers: createCORSHeaders(CORS_CONFIGS.api)
          })
        }
      }

      case 'notifications/initialized':
        // Client has initialized, just acknowledge
        return new NextResponse(null, { 
          status: 204,
          headers: createCORSHeaders(CORS_CONFIGS.api)
        })

      default:
        return NextResponse.json({
          jsonrpc: '2.0',
          id: body.id,
          error: {
            code: -32601,
            message: `Method '${body.method}' not found`
          }
        }, {
          headers: createCORSHeaders(CORS_CONFIGS.api)
        })
    }
  } catch (error) {
    console.error('❌ MCP server error:', error)
    return NextResponse.json(
      {
        jsonrpc: '2.0',
        id: null,
        error: {
          code: -32700,
          message: 'Parse error'
        }
      },
      { 
        status: 400,
        headers: createCORSHeaders(CORS_CONFIGS.api)
      }
    )
  }
}

// Handle OPTIONS for CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: createCORSHeaders(CORS_CONFIGS.api),
  })
}

// Handle GET for server info
export async function GET() {
  return NextResponse.json({
    name: 'person-search-mcp-server',
    version: '1.0.0',
    description: 'OAuth-secured MCP Server for Person Search App CRUD operations',
    authentication: {
      required: true,
      type: 'OAuth 2.1',
      bearer_token: true,
      scopes: ['read:mcp', 'write:mcp', 'persons:read', 'persons:write']
    },
    tools: MCP_TOOLS.map(tool => ({
      name: tool.name,
      description: tool.description,
      requiresAuth: true
    })),
    endpoints: {
      oauth_metadata: '/.well-known/oauth-authorization-server',
      authorization: '/api/auth/authorize',
      token: '/api/auth/token',
      callback: '/api/auth/callback/google'
    },
    status: 'ready'
  }, {
    headers: createCORSHeaders(CORS_CONFIGS.api)
  })
}