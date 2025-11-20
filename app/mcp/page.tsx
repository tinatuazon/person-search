// app/mcp/page.tsx

'use client'

import { useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { AlertCircle, CheckCircle, Copy, Server } from 'lucide-react'
import { MCP_TOOLS } from '@/lib/mcp-server'

export default function MCPTestPage() {
  const router = useRouter();
  const pathname = usePathname();
  const [response, setResponse] = useState<string>('')
  const [loading, setLoading] = useState(false)

  const handleToolCall = async (toolName: string, toolArgs: Record<string, unknown>) => {
    setLoading(true)
    try {
      const mcpRequest = {
        jsonrpc: '2.0',
        id: Date.now(),
        method: 'tools/call',
        params: {
          name: toolName,
          arguments: toolArgs
        }
      }

      // Get session token to authenticate MCP request
      const sessionResponse = await fetch('/api/auth/session', {
        method: 'GET',
        credentials: 'include',
      })
      
      const authHeaders: Record<string, string> = {
        'Content-Type': 'application/json',
      }
      
      // If we have a valid session, we can make authenticated requests
      if (sessionResponse.ok) {
        const sessionData = await sessionResponse.json()
        if (sessionData.authenticated) {
          // For web requests, the session cookie will be sent automatically
          // The MCP endpoint should check for the session cookie as an alternative to Bearer token
          console.log('Making authenticated MCP request for user:', sessionData.user.email)
        }
      }

      const response = await fetch('/api/mcp', {
        method: 'POST',
        headers: authHeaders,
        credentials: 'include', // Include cookies for authentication
        body: JSON.stringify(mcpRequest),
      })

      const result = await response.json()
      setResponse(JSON.stringify(result, null, 2))
    } catch (error) {
      setResponse(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setLoading(false)
    }
  }

  const handleQuickAction = async (action: string, params: Record<string, unknown> = {}) => {
    await handleToolCall(action, params)
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const serverUrl = typeof window !== 'undefined' ? `${window.location.origin}/api/mcp` : ''

  // Tabs logic
  const [tab, setTab] = useState<string>(() => {
    if (pathname === '/mcp-setup') return 'setup';
    if (pathname === '/mcp-demo') return 'test';
    return 'test';
  });

  const handleTabChange = (value: string) => {
    setTab(value);
    if (value === 'setup') {
      router.replace('/mcp-setup');
    } else if (value === 'test') {
      router.replace('/mcp-demo');
    } else {
      router.replace('/mcp');
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <Server className="h-8 w-8 text-blue-600" />
          <div>
            <h1 className="text-3xl font-bold">Person Search MCP Server</h1>
            <p className="text-muted-foreground">Model Context Protocol for Person CRUD operations</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg">
          <CheckCircle className="h-5 w-5 text-green-600" />
          <span className="text-green-800 dark:text-green-200 font-medium">MCP Server Ready</span>
        </div>
      </div>

      <Tabs value={tab} onValueChange={handleTabChange} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="test">Test Server</TabsTrigger>
          <TabsTrigger value="tools">Available Tools</TabsTrigger>
          <TabsTrigger value="setup">Setup Guide</TabsTrigger>
          <TabsTrigger value="examples">Usage Examples</TabsTrigger>
        </TabsList>

        <TabsContent value="test" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>MCP Server Interface</CardTitle>
              <CardDescription>Test the Person CRUD operations using MCP protocol</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Quick Actions */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <Button 
                  onClick={() => handleQuickAction('search_users', { query: '' })}
                  disabled={loading}
                  variant="outline"
                >
                  List All Users
                </Button>
                <Button 
                  onClick={() => handleQuickAction('search_users', { query: 'John' })}
                  disabled={loading}
                  variant="outline"
                >
                  Search &ldquo;John&rdquo;
                </Button>
                <Button 
                  onClick={() => handleQuickAction('add_user', {
                    name: 'Test User',
                    email: 'test@example.com',
                    phoneNumber: '0422123456'
                  })}
                  disabled={loading}
                  variant="outline"
                >
                  Add Test User
                </Button>
                <Button 
                  onClick={() => handleQuickAction('get_user_by_id', { id: 'example-id' })}
                  disabled={loading}
                  variant="outline"
                >
                  Get User by ID
                </Button>
              </div>

              {/* Response Display */}
              {response && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Server Response:</Label>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => copyToClipboard(response)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <Textarea 
                    value={response} 
                    readOnly 
                    className="min-h-[300px] font-mono text-sm"
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tools" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Available MCP Tools</CardTitle>
              <CardDescription>Complete list of Person CRUD operations available via MCP</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {MCP_TOOLS.map((tool) => (
                  <div key={tool.name} className="border rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="secondary">{tool.name}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">{tool.description}</p>
                    <details className="text-sm">
                      <summary className="cursor-pointer font-medium">View Schema</summary>
                      <pre className="mt-2 p-3 bg-muted rounded text-xs overflow-auto">
                        {JSON.stringify(tool.inputSchema, null, 2)}
                      </pre>
                    </details>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="setup" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Claude Desktop Setup</CardTitle>
              <CardDescription>Configure Claude Desktop to use this MCP server</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-sm font-medium">MCP Server URL:</Label>
                <div className="flex items-center gap-2 mt-1">
                  <Input 
                    value={serverUrl}
                    readOnly
                    className="font-mono text-sm"
                  />
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => copyToClipboard(serverUrl)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium">Claude Desktop Configuration:</Label>
                <div className="mt-2">
                  <pre className="p-4 bg-muted rounded text-sm overflow-auto">
{`{
  "mcpServers": {
    "person-search": {
      "command": "npx",
      "args": [
        "-y",
        "mcp-remote",
        "${serverUrl}"
      ]
    }
  }
}`}
                  </pre>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="mt-2"
                    onClick={() => copyToClipboard(`{
  "mcpServers": {
    "person-search": {
      "command": "npx",
      "args": [
        "-y", 
        "mcp-remote",
        "${serverUrl}"
      ]
    }
  }
}`)}
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copy Configuration
                  </Button>
                </div>
              </div>

              <div className="p-4 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium text-blue-900 dark:text-blue-100">Configuration Path:</p>
                    <p className="text-blue-800 dark:text-blue-200 mt-1">
                      <strong>Windows:</strong> <code>%APPDATA%\\Claude\\claude_desktop_config.json</code>
                    </p>
                    <p className="text-blue-800 dark:text-blue-200">
                      <strong>macOS:</strong> <code>~/Library/Application Support/Claude/claude_desktop_config.json</code>
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="examples" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Usage Examples</CardTitle>
              <CardDescription>How to interact with the Person Search MCP server in Claude</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4">
                <div className="border rounded-lg p-4">
                  <h4 className="font-medium mb-2">🔍 Search Users</h4>
                  <p className="text-sm text-muted-foreground mb-2">
                    &ldquo;Can you search for users with the name &lsquo;John&rsquo;?&rdquo;
                  </p>
                  <div className="bg-muted p-3 rounded text-sm">
                    <strong>Claude will call:</strong> search_users with query &ldquo;John&rdquo;
                  </div>
                </div>

                <div className="border rounded-lg p-4">
                  <h4 className="font-medium mb-2">➕ Add New User</h4>
                  <p className="text-sm text-muted-foreground mb-2">
                    &ldquo;Please add a new user named &lsquo;Sarah Wilson&rsquo; with email &lsquo;sarah@example.com&rsquo; and phone &lsquo;0422987654&rsquo;&rdquo;
                  </p>
                  <div className="bg-muted p-3 rounded text-sm">
                    <strong>Claude will call:</strong> add_user with the provided details
                  </div>
                </div>

                <div className="border rounded-lg p-4">
                  <h4 className="font-medium mb-2">✏️ Update User</h4>
                  <p className="text-sm text-muted-foreground mb-2">
                    &ldquo;Update user ID &lsquo;abc123&rsquo; with new email &lsquo;newemail@example.com&rsquo;&rdquo;
                  </p>
                  <div className="bg-muted p-3 rounded text-sm">
                    <strong>Claude will call:</strong> update_user with ID and new email
                  </div>
                </div>

                <div className="border rounded-lg p-4">
                  <h4 className="font-medium mb-2">🗑️ Delete User</h4>
                  <p className="text-sm text-muted-foreground mb-2">
                    &ldquo;Delete the user with ID &lsquo;xyz789&rsquo;&rdquo;
                  </p>
                  <div className="bg-muted p-3 rounded text-sm">
                    <strong>Claude will call:</strong> delete_user with the specified ID
                  </div>
                </div>

                <div className="border rounded-lg p-4">
                  <h4 className="font-medium mb-2">👤 Get User by ID</h4>
                  <p className="text-sm text-muted-foreground mb-2">
                    &ldquo;Show me the details for user ID &lsquo;def456&rsquo;&rdquo;
                  </p>
                  <div className="bg-muted p-3 rounded text-sm">
                    <strong>Claude will call:</strong> get_user_by_id with the specified ID
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}