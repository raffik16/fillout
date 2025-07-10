import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    // Check if user is trying to access admin routes
    if (req.nextUrl.pathname.startsWith('/admin')) {
      // Get user role from token
      const userRole = req.nextauth.token?.role as string;
      
      // Allow access for superadmins and regular users (users get access based on bar assignments)
      // The specific bar-level permissions are handled by the API routes
      if (userRole === 'superadmin' || userRole === 'user') {
        return NextResponse.next();
      }
      
      // Deny access for any other role or missing role
      return NextResponse.redirect(new URL('/auth/access-denied', req.url));
    }
    
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Require authentication for admin routes
        if (req.nextUrl.pathname.startsWith('/admin')) {
          return !!token;
        }
        
        // All other routes are accessible without authentication
        return true;
      },
    },
  }
);

export const config = {
  matcher: [
    // Only protect admin routes
    '/admin/:path*',
  ]
};