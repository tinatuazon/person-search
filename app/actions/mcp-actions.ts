// app/actions/mcp-actions.ts

'use server'

import { z } from 'zod'
import { 
  searchUsersSchema, 
  addUserSchema, 
  updateUserSchema, 
  deleteUserSchema, 
  getUserByIdSchema
} from '@/lib/mcp-server'
import { 
  searchUsers, 
  addUser, 
  updateUser, 
  deleteUser, 
  getUserById 
} from './actions'
import { User } from './schemas'

// MCP Tool Handler with OAuth user context
export async function handleMCPTool(toolName: string, args: Record<string, unknown>, user?: { clientId: string; extra?: { email?: string; name?: string } }): Promise<string> {
  try {
    console.log('🔧 MCP Tool Execution:', {
      tool: toolName,
      user: user ? `${user.extra?.name} (${user.extra?.email})` : 'anonymous',
      hasArgs: !!args
    });

    switch (toolName) {
      case "search_users": {
        const { query } = searchUsersSchema.parse(args)
        const users = await searchUsers(query)
        
        console.log('🔍 Search executed:', {
          query,
          resultCount: users.length,
          user: user?.extra?.email
        });
        
        return JSON.stringify({
          success: true,
          data: users,
          message: `Found ${users.length} user(s)`,
          requestedBy: user?.extra ? {
            name: user.extra.name,
            email: user.extra.email
          } : null
        }, null, 2)
      }

      case "add_user": {
        const userData = addUserSchema.parse(args)
        const newUser = await addUser(userData)
        
        console.log('➕ User created:', {
          newUserId: newUser.id,
          newUserName: newUser.name,
          createdBy: user?.extra?.email
        });
        
        return JSON.stringify({
          success: true,
          data: newUser,
          message: `Successfully created user: ${newUser.name}`,
          createdBy: user?.extra ? {
            name: user.extra.name,
            email: user.extra.email
          } : null
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
        
        console.log('✏️ User updated:', {
          userId: id,
          updatedFields: Object.keys(filteredUpdateData),
          updatedBy: user?.extra?.email
        });
        
        return JSON.stringify({
          success: true,
          data: updatedUser,
          message: `Successfully updated user: ${updatedUser.name}`,
          updatedBy: user?.extra ? {
            name: user.extra.name,
            email: user.extra.email
          } : null
        }, null, 2)
      }

      case "delete_user": {
        const { id } = deleteUserSchema.parse(args)
        await deleteUser(id)
        
        console.log('🗑️ User deleted:', {
          userId: id,
          deletedBy: user?.extra?.email
        });
        
        return JSON.stringify({
          success: true,
          message: `Successfully deleted user with ID: ${id}`,
          deletedBy: user?.extra ? {
            name: user.extra.name,
            email: user.extra.email
          } : null
        }, null, 2)
      }

      case "get_user_by_id": {
        const { id } = getUserByIdSchema.parse(args)
        const foundUser = await getUserById(id)
        
        if (!foundUser) {
          console.log('❌ User not found:', {
            userId: id,
            requestedBy: user?.extra?.email
          });
          
          return JSON.stringify({
            success: false,
            message: `User with ID ${id} not found`
          }, null, 2)
        }
        
        console.log('👤 User retrieved:', {
          userId: id,
          userName: foundUser.name,
          requestedBy: user?.extra?.email
        });
        
        return JSON.stringify({
          success: true,
          data: foundUser,
          message: `Retrieved user: ${foundUser.name}`,
          requestedBy: user?.extra ? {
            name: user.extra.name,
            email: user.extra.email
          } : null
        }, null, 2)
      }

      default:
        console.error('❌ Unknown MCP tool:', toolName);
        return JSON.stringify({
          success: false,
          message: `Unknown tool: ${toolName}`
        }, null, 2)
    }
  } catch (error) {
    console.error(`❌ MCP Tool Error [${toolName}]:`, error)
    
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