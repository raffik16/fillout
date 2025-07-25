/**
 * Protected Routes Configuration
 * 
 * This file defines which routes require authentication and what level of access.
 * Update the middleware.ts file to use these configurations as needed.
 */

export const publicRoutes = [
  // Core public pages
  '/',
  '/about',
  '/contact',
  '/privacy',
  '/terms',
  '/form-builder-demo',
  
  // Authentication pages
  '/sign-in',
  '/sign-up',
  
  // Bar and drink discovery (public for SEO and sharing)
  '/[barSlug]', // Dynamic bar pages
] as const

export const publicApiRoutes = [
  // Drink discovery APIs (public for sharing and SEO)
  '/api/drinks',
  '/api/beers',
  '/api/wines',
  '/api/weather',
  
  // Social features (public for engagement)
  '/api/likes',
  '/api/orders',
  '/api/email/save-matches',
] as const

export const protectedRoutes = [
  // User profile and settings
  '/profile',
  '/settings',
  '/favorites',
  
  // User-specific features
  '/my-drinks',
  '/recommendations',
] as const

export const adminRoutes = [
  // Analytics and admin features
  '/analytics',
  '/admin',
] as const

export const adminApiRoutes = [
  '/api/analytics',
  '/api/admin',
] as const

/**
 * Helper function to check if a route is public
 */
export function isPublicRoute(pathname: string): boolean {
  return publicRoutes.some(route => {
    if (route.includes('[')) {
      // Handle dynamic routes
      const routePattern = route.replace(/\[[\w]+\]/g, '[^/]+')
      const regex = new RegExp(`^${routePattern}$`)
      return regex.test(pathname)
    }
    return pathname === route || pathname.startsWith(route + '/')
  })
}

/**
 * Helper function to check if an API route is public
 */
export function isPublicApiRoute(pathname: string): boolean {
  return publicApiRoutes.some(route => 
    pathname === route || pathname.startsWith(route + '/')
  )
}

/**
 * Helper function to check if a route requires admin access
 */
export function isAdminRoute(pathname: string): boolean {
  return adminRoutes.some(route => 
    pathname === route || pathname.startsWith(route + '/')
  )
}

/**
 * Helper function to check if an API route requires admin access
 */
export function isAdminApiRoute(pathname: string): boolean {
  return adminApiRoutes.some(route => 
    pathname === route || pathname.startsWith(route + '/')
  )
}