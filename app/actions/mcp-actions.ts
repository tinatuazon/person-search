// app/actions/mcp-actions.ts

'use server'

import { z } from 'zod'
import { 
  searchUsersSchema, 
  addUserSchema, 
  updateUserSchema, 
  deleteUserSchema, 
  getUserByIdSchema,
  type MCPToolName 
} from '@/lib/mcp-server'
import { 
  searchUsers, 
  addUser, 
  updateUser, 
  deleteUser, 
  getUserById 
} from './actions'
import { User } from './schemas'

// MCP Tool Handler
export async function handleMCPTool(toolName: MCPToolName, args: unknown): Promise<string> {
  try {
    switch (toolName) {
      case "search_users": {
        const { query } = searchUsersSchema.parse(args)
        const users = await searchUsers(query)
        return JSON.stringify({
          success: true,
          data: users,
          message: `Found ${users.length} user(s)`
        }, null, 2)
      }

      case "add_user": {
        const userData = addUserSchema.parse(args)
        const newUser = await addUser(userData)
        return JSON.stringify({
          success: true,
          data: newUser,
          message: `Successfully created user: ${newUser.name}`
        }, null, 2)
      }

      case "update_user": {
        const { id, ...updateData } = updateUserSchema.parse(args)
        
        // Filter out undefined values
        const filteredUpdateData = Object.fromEntries(
          Object.entries(updateData).filter(([, value]) => value !== undefined)
        )
        
        if (Object.keys(filteredUpdateData).length === 0) {
          return JSON.stringify({
            success: false,
            message: "No valid fields provided for update"
          }, null, 2)
        }
        
        const updatedUser = await updateUser(id, filteredUpdateData)
        return JSON.stringify({
          success: true,
          data: updatedUser,
          message: `Successfully updated user: ${updatedUser.name}`
        }, null, 2)
      }

      case "delete_user": {
        const { id } = deleteUserSchema.parse(args)
        await deleteUser(id)
        return JSON.stringify({
          success: true,
          message: `Successfully deleted user with ID: ${id}`
        }, null, 2)
      }

      case "get_user_by_id": {
        const { id } = getUserByIdSchema.parse(args)
        const user = await getUserById(id)
        
        if (!user) {
          return JSON.stringify({
            success: false,
            message: `User with ID ${id} not found`
          }, null, 2)
        }
        
        return JSON.stringify({
          success: true,
          data: user,
          message: `Retrieved user: ${user.name}`
        }, null, 2)
      }

      default:
        return JSON.stringify({
          success: false,
          message: `Unknown tool: ${toolName}`
        }, null, 2)
    }
  } catch (error) {
    console.error(`MCP Tool Error [${toolName}]:`, error)
    
    if (error instanceof z.ZodError) {
      return JSON.stringify({
        success: false,
        message: "Invalid input parameters",
        errors: error.errors
      }, null, 2)
    }
    
    return JSON.stringify({
      success: false,
      message: error instanceof Error ? error.message : "Unknown error occurred"
    }, null, 2)
  }
}

// Utility function to format user data for display
export async function formatUserForDisplay(user: User): Promise<string> {
  return `👤 ${user.name}
📧 ${user.email}
📱 ${user.phoneNumber}
🆔 ${user.id}`
}

// Utility function to format multiple users for display
export async function formatUsersForDisplay(users: User[]): Promise<string> {
  if (users.length === 0) {
    return "No users found."
  }
  
  const formattedUsers = await Promise.all(
    users.map(async (user, index) => {
      const formatted = await formatUserForDisplay(user)
      return `${index + 1}. ${formatted}`
    })
  )
  
  return formattedUsers.join('\n\n')
}