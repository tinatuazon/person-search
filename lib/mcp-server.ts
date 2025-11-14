// lib/mcp-server.ts

import { z } from 'zod'

// MCP Tool Schemas
export const searchUsersSchema = z.object({
  query: z.string().describe("Search query for user names. Use empty string to get all users.")
})

export const addUserSchema = z.object({
  name: z.string().min(2).describe("User's full name (minimum 2 characters)"),
  email: z.string().email().describe("Valid email address"),
  phoneNumber: z.string().regex(/^04\d{8}$/).describe("Australian mobile number format (e.g., 0422018632)")
})

export const updateUserSchema = z.object({
  id: z.string().describe("User ID to update"),
  name: z.string().min(2).optional().describe("New name (minimum 2 characters)"),
  email: z.string().email().optional().describe("New email address"),
  phoneNumber: z.string().regex(/^04\d{8}$/).optional().describe("New Australian mobile number")
})

export const deleteUserSchema = z.object({
  id: z.string().describe("User ID to delete")
})

export const getUserByIdSchema = z.object({
  id: z.string().describe("User ID to retrieve")
})

// MCP Tool Definitions
export const MCP_TOOLS = [
  {
    name: "search_users",
    description: "Search for users by name or get all users if no query provided",
    inputSchema: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description: "Search query for user names. Use empty string to get all users."
        }
      },
      required: ["query"]
    }
  },
  {
    name: "add_user",
    description: "Create a new user with name, email, and phone number",
    inputSchema: {
      type: "object",
      properties: {
        name: {
          type: "string",
          description: "User's full name (minimum 2 characters)"
        },
        email: {
          type: "string",
          description: "Valid email address"
        },
        phoneNumber: {
          type: "string",
          description: "Australian mobile number format (e.g., 0422018632)",
          pattern: "^04\\d{8}$"
        }
      },
      required: ["name", "email", "phoneNumber"]
    }
  },
  {
    name: "update_user", 
    description: "Update an existing user's information",
    inputSchema: {
      type: "object",
      properties: {
        id: {
          type: "string",
          description: "User ID to update"
        },
        name: {
          type: "string",
          description: "New name (minimum 2 characters)"
        },
        email: {
          type: "string",
          description: "New email address"
        },
        phoneNumber: {
          type: "string",
          description: "New Australian mobile number",
          pattern: "^04\\d{8}$"
        }
      },
      required: ["id"]
    }
  },
  {
    name: "delete_user",
    description: "Delete a user by their ID",
    inputSchema: {
      type: "object",
      properties: {
        id: {
          type: "string",
          description: "User ID to delete"
        }
      },
      required: ["id"]
    }
  },
  {
    name: "get_user_by_id",
    description: "Retrieve a specific user by their ID",
    inputSchema: {
      type: "object",
      properties: {
        id: {
          type: "string",
          description: "User ID to retrieve"
        }
      },
      required: ["id"]
    }
  }
]

export type MCPToolName = "search_users" | "add_user" | "update_user" | "delete_user" | "get_user_by_id"