# Person Search MCP Server

A Model Context Protocol (MCP) server that provides CRUD operations for the Person Search application. This server enables AI assistants like Claude Desktop to interact with user data through a standardized protocol.

## Features

- **Complete CRUD Operations**: Create, Read, Update, and Delete users
- **Search Functionality**: Search users by name or retrieve all users
- **Input Validation**: Robust validation using Zod schemas
- **Australian Phone Format**: Validates Australian mobile numbers (04xxxxxxxx)
- **MCP Protocol Compliance**: Full JSON-RPC 2.0 implementation
- **Web Testing Interface**: Built-in test interface for development

## Available Tools

### 1. `search_users`
Search for users by name or get all users.

**Parameters:**
- `query` (string): Search query for user names. Use empty string to get all users.

**Example:**
```json
{
  "name": "search_users",
  "arguments": {
    "query": "John"
  }
}
```

### 2. `add_user`
Create a new user with name, email, and phone number.

**Parameters:**
- `name` (string): User's full name (minimum 2 characters)
- `email` (string): Valid email address
- `phoneNumber` (string): Australian mobile number format (e.g., 0422018632)

**Example:**
```json
{
  "name": "add_user",
  "arguments": {
    "name": "John Doe",
    "email": "john@example.com",
    "phoneNumber": "0422123456"
  }
}
```

### 3. `update_user`
Update an existing user's information.

**Parameters:**
- `id` (string): User ID to update (required)
- `name` (string): New name (optional)
- `email` (string): New email address (optional)
- `phoneNumber` (string): New Australian mobile number (optional)

**Example:**
```json
{
  "name": "update_user",
  "arguments": {
    "id": "user123",
    "email": "newemail@example.com"
  }
}
```

### 4. `delete_user`
Delete a user by their ID.

**Parameters:**
- `id` (string): User ID to delete

**Example:**
```json
{
  "name": "delete_user",
  "arguments": {
    "id": "user123"
  }
}
```

### 5. `get_user_by_id`
Retrieve a specific user by their ID.

**Parameters:**
- `id` (string): User ID to retrieve

**Example:**
```json
{
  "name": "get_user_by_id",
  "arguments": {
    "id": "user123"
  }
}
```

## Setup Instructions

### For Local Development

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Set up Database**
   ```bash
   npm run db:push
   npm run db:seed  # Optional: add sample data
   ```

3. **Start Development Server**
   ```bash
   npm run dev
   ```

4. **Configure Claude Desktop**
   
   Add this configuration to your `claude_desktop_config.json`:
   
   **Windows:** `%APPDATA%\Claude\claude_desktop_config.json`
   **macOS:** `~/Library/Application Support/Claude/claude_desktop_config.json`
   
   ```json
   {
     "mcpServers": {
       "person-search": {
         "command": "npx",
         "args": [
           "-y",
           "mcp-remote",
           "http://localhost:3000/api/mcp"
         ]
       }
     }
   }
   ```

### For Cloud Deployment (Vercel)

1. **Use the deployed server**
   
   Configure Claude Desktop with the production URL:
   
   ```json
   {
     "mcpServers": {
       "person-search": {
         "command": "npx",
         "args": [
           "-y",
           "mcp-remote",
           "https://your-deployment.vercel.app/api/mcp"
         ]
       }
     }
   }
   ```

2. **Restart Claude Desktop**
   - Completely close Claude Desktop
   - Reopen Claude Desktop
   - Look for the hammer icon (🔨) in the input box
   - The hammer icon indicates MCP tools are available

## Usage Examples in Claude

Once configured, you can interact with the Person Search system using natural language:

### Search Users
- "Can you search for users named 'Sarah'?"
- "Show me all users in the system"
- "Find users with 'Smith' in their name"

### Add Users
- "Add a new user named 'Alice Johnson' with email 'alice@example.com' and phone '0422987654'"
- "Create a user profile for Bob Wilson, email bob@company.com, phone 0433555666"

### Update Users
- "Update user ID 'abc123' with new email 'updated@example.com'"
- "Change the phone number for user 'xyz789' to '0444111222'"
- "Update Sarah's information: new email sarah.new@email.com and phone 0455333444"

### Delete Users
- "Delete the user with ID 'user456'"
- "Remove user 'def789' from the system"

### Get User Details
- "Show me details for user ID 'user123'"
- "Get information about user 'abc456'"

## Testing Interface

Visit `/mcp` in your browser for a comprehensive testing interface that includes:

- **Live Tool Testing**: Test all MCP tools directly in the browser
- **Tool Documentation**: Complete schema definitions for each tool
- **Setup Guide**: Step-by-step configuration instructions
- **Usage Examples**: Real-world interaction examples

## API Endpoints

- `GET /api/mcp` - Server information and status
- `POST /api/mcp` - MCP protocol endpoint for tool calls
- `GET /mcp` - Web testing interface

## Response Format

All tool responses follow this format:

```json
{
  "success": true,
  "data": { /* user data or array of users */ },
  "message": "Operation description"
}
```

Error responses:
```json
{
  "success": false,
  "message": "Error description",
  "errors": [ /* validation errors if applicable */ ]
}
```

## Technical Architecture

- **Framework**: Next.js 15 with TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Validation**: Zod schemas for runtime type safety
- **Protocol**: Model Context Protocol with JSON-RPC 2.0
- **Server Actions**: Reuses existing application logic
- **UI Components**: shadcn/ui for testing interface

## Development

The MCP server is built on top of the existing Person Search application and reuses the same server actions and validation logic, ensuring consistency between the web interface and MCP operations.

### Key Files

- `app/api/mcp/route.ts` - MCP protocol handler
- `lib/mcp-server.ts` - Tool definitions and schemas
- `app/actions/mcp-actions.ts` - MCP tool handlers
- `app/mcp/page.tsx` - Web testing interface

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test using the web interface (`/mcp`)
5. Submit a pull request

## License

MIT License - see the LICENSE file for details.