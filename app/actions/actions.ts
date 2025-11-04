//app/actions/actions.ts

'use server'

import { revalidatePath } from 'next/cache'
import { User, userSchema } from './schemas'
import { cache } from 'react'
import { prisma } from '@/lib/prisma'

export async function searchUsers(query: string): Promise<User[]> {
    console.log('Searching users with query:', query)
    
    if (!query.trim()) {
        // Return all users if query is empty
        const results = await prisma.user.findMany({
            orderBy: { name: 'asc' }
        })
        console.log('Search results (all users):', results)
        // Validate each result with Zod schema
        return results.map(user => userSchema.parse(user))
    }
    
    const results = await prisma.user.findMany({
        where: {
            name: {
                startsWith: query,
                mode: 'insensitive'
            }
        },
        orderBy: { name: 'asc' }
    })
    
    console.log('Search results:', results)
    // Validate each result with Zod schema
    return results.map(user => userSchema.parse(user))
}

export async function addUser(data: Omit<User, 'id'>): Promise<User> {
    // Validate the data before creating
    const validatedData = userSchema.omit({ id: true }).parse(data)
    
    const newUser = await prisma.user.create({
        data: validatedData
    })
    
    revalidatePath('/') // Revalidate the page
    // Validate the result with Zod schema
    return userSchema.parse(newUser)
}

export async function deleteUser(id: string): Promise<void> {
    try {
        await prisma.user.delete({
            where: { id }
        })
        console.log(`User with id ${id} has been deleted.`)
        revalidatePath('/') // Revalidate the page
    } catch {
        throw new Error(`User with id ${id} not found`)
    }
}

export async function updateUser(id: string, data: Partial<Omit<User, 'id'>>): Promise<User> {
    try {
        // First get the existing user to merge with partial data
        const existingUser = await prisma.user.findUnique({
            where: { id }
        })
        
        if (!existingUser) {
            throw new Error(`User with id ${id} not found`)
        }
        
        const updatedData = { ...existingUser, ...data }
        const validatedUser = userSchema.parse(updatedData) // Ensure the updated data adheres to schema
        
        const updatedUser = await prisma.user.update({
            where: { id },
            data: {
                name: validatedUser.name,
                email: validatedUser.email,
                phoneNumber: validatedUser.phoneNumber
            }
        })
        
        console.log(`User with id ${id} has been updated.`)
        revalidatePath('/') // Revalidate the page
        
        // Validate the result with Zod schema
        return userSchema.parse(updatedUser)
    } catch (error) {
        if (error instanceof Error && error.message.includes('not found')) {
            throw error
        }
        throw new Error(`Failed to update user with id ${id}`)
    }
}

export const getUserById = cache(async (id: string) => {
    const user = await prisma.user.findUnique({
        where: { id }
    })
    // Validate the result with Zod schema if user exists
    return user ? userSchema.parse(user) : null
})
