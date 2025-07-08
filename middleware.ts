import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    // Check if user is trying to access admin routes
    if (req.nextUrl.pathname.startsWith('/admin')) {
      // Get user role from token
      const userRole = req.nextauth.token?.role as string;
      
      // Require at least staff role for admin access
      const roleHierarchy = {
        viewer: 0,
        staff: 1,
        manager: 2,
        superadmin: 3
      };
      
      const userLevel = roleHierarchy[userRole as keyof typeof roleHierarchy] || 0;
      const requiredLevel = roleHierarchy.staff;
      
      if (userLevel < requiredLevel) {
        // Redirect to access denied page or main app
        return NextResponse.redirect(new URL('/auth/access-denied', req.url));
      }
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
    // Protect admin routes
    '/admin/:path*',
    // Don't protect API auth routes
    '/((?!api/auth|_next/static|_next/image|favicon.ico).*)',
  ]
};