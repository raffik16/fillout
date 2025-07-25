import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'

/**
 * Server-side utility to require authentication
 * Use this in server components or API routes
 */
export async function requireAuth() {
  const { userId } = await auth()
  
  if (!userId) {
    redirect('/sign-in')
  }
  
  return { userId }
}

/**
 * Server-side utility to get current user info
 * Returns null if not authenticated
 */
export async function getCurrentUser() {
  const { userId, sessionClaims } = await auth()
  
  if (!userId) {
    return null
  }
  
  return {
    userId,
    sessionClaims
  }
}

/**
 * Server-side utility to check if user has admin role
 * You'll need to set up roles in Clerk dashboard
 */
export async function requireAdminAuth() {
  const { userId, sessionClaims } = await auth()
  
  if (!userId) {
    redirect('/sign-in')
  }
  
  // Check for admin role in session claims
  // You'll need to configure this in your Clerk dashboard
  const userRole = sessionClaims?.metadata?.role as string
  
  if (userRole !== 'admin') {
    // You could redirect to an unauthorized page or return a 403
    throw new Error('Unauthorized: Admin access required')
  }
  
  return { userId, sessionClaims }
}