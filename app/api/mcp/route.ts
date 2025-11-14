// app/api/mcp/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { handleMCPTool } from '@/app/actions/mcp-actions'
import { MCP_TOOLS } from '@/lib/mcp-server'

interface MCPRequest {
  jsonrpc: string
  id: number | string
  method: string
  params?: {
    name?: string
    arguments?: Record<string, unknown>
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: MCPRequest = await request.json()

    // Handle MCP protocol methods
    switch (body.method) {
      case 'initialize':
        return NextResponse.json({
          jsonrpc: '2.0',
          id: body.id,
          result: {
            protocolVersion: '2024-11-05',
            capabilities: {
              tools: {}
            },
            serverInfo: {
              name: 'person-search-mcp-server',
              version: '1.0.0'
            }
          }
        })

      case 'tools/list':
        return NextResponse.json({
          jsonrpc: '2.0',
          id: body.id,
          result: {
            tools: MCP_TOOLS
          }
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
          })
        }

        try {
          const result = await handleMCPTool(name as typeof validTools[number], args)
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
          })
        } catch (error) {
          console.error('Tool execution error:', error)
          return NextResponse.json({
            jsonrpc: '2.0',
            id: body.id,
            error: {
              code: -32603,
              message: 'Tool execution failed',
              data: error instanceof Error ? error.message : 'Unknown error'
            }
          })
        }
      }

      case 'notifications/initialized':
        // Client has initialized, just acknowledge
        return new NextResponse(null, { status: 204 })

      default:
        return NextResponse.json({
          jsonrpc: '2.0',
          id: body.id,
          error: {
            code: -32601,
            message: `Method '${body.method}' not found`
          }
        })
    }
  } catch (error) {
    console.error('MCP server error:', error)
    return NextResponse.json(
      {
        jsonrpc: '2.0',
        id: null,
        error: {
          code: -32700,
          message: 'Parse error'
        }
      },
      { status: 400 }
    )
  }
}

// Handle OPTIONS for CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}

// Handle GET for server info
export async function GET() {
  return NextResponse.json({
    name: 'person-search-mcp-server',
    version: '1.0.0',
    description: 'MCP Server for Person Search App CRUD operations',
    tools: MCP_TOOLS.map(tool => ({
      name: tool.name,
      description: tool.description
    })),
    status: 'ready'
  })
}