# Securing Your Rolldice MCP Server with OAuth 2.1

## Overview
This guide shows how to add OAuth 2.1 authentication to your existing rolldice MCP server using patterns from the [mcp-auth-demo](https://github.com/gocallum/mcp-auth-demo.git) project.

## Prerequisites
- Working rolldice MCP server (locally tested)
- Deployed rolldice MCP server on Vercel
- Google OAuth credentials from previous steps
- Familiarity with the mcp-auth-demo authentication patterns

## Step 1: Study the Authentication Demo
```bash
# Clone the authentication demo for reference
git clone https://github.com/gocallum/mcp-auth-demo.git
cd mcp-auth-demo
```

## Step 2: Copy Authentication Patterns
Apply these key authentication patterns from the demo to your rolldice server:

### 1. Authentication Utilities (lib/auth.ts)
- Google OAuth token verification
- User session management
- Token validation middleware

### 2. Protected MCP Handler (app/api/mcp/route.ts)
- Wrap existing rolldice functionality with authentication
- Maintain dice rolling logic while adding security
- Handle authentication errors gracefully

### 3. OAuth Endpoints
- Authorization server metadata (/.well-known/oauth-authorization-server)
- Protected resource metadata (/.well-known/oauth-protected-resource)
- Authentication callback handlers

## Step 3: Environment Variables
Add these environment variables to both local and production environments:

```env
# Google OAuth Configuration
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

## Step 4: Test Authentication Flow
1. Test locally with http://localhost:3000
2. Verify OAuth login redirects work
3. Test dice rolling after authentication
4. Deploy to production with same environment variables
5. Update MCP client configurations

## Step 5: MCP Client Configuration
Update your MCP clients to use the authenticated server:

### VS Code MCP Extension
```json
{
  "servers": {
    "secure-rolldice": {
      "type": "http",
      "url": "https://your-secure-rolldice.vercel.app/api/mcp"
    }
  }
}
```

### Claude Desktop
```json
{
  "mcpServers": {
    "secure-rolldice": {
      "command": "npx",
      "args": [
        "-y",
        "mcp-remote",
        "https://your-secure-rolldice.vercel.app/api/mcp"
      ]
    }
  }
}
```

## Success Criteria
- [ ] OAuth login prompt appears when accessing rolldice tools
- [ ] Google authentication completes successfully
- [ ] Dice rolling works after authentication
- [ ] Unauthenticated requests are properly rejected
- [ ] Both VS Code MCP extension and Claude Desktop work

## Troubleshooting
- Verify Google OAuth redirect URIs include your production domain
- Check environment variables are set in Vercel
- Ensure discovery endpoints return proper OAuth metadata
- Test authentication flow in incognito/private browser window
