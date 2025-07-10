import { NextAuthOptions } from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import CredentialsProvider from "next-auth/providers/credentials";
import { verifyPassword } from "@/lib/password";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as NextAuthOptions['adapter'],
  providers: [
    // Credentials provider for email/password login
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        // Find user in database
        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
          select: {
            id: true,
            email: true,
            name: true,
            password: true,
            role: true
          }
        });

        if (!user || !user.password) {
          return null;
        }

        // Verify password
        const isValidPassword = await verifyPassword(credentials.password, user.password);
        if (!isValidPassword) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role
        };
      }
    }),
  ],
  
  callbacks: {
    async jwt({ token, user }) {
      // Persist the role in the token right after signin
      if (user) {
        token.role = user.role;
        token.userId = user.id;
      }
      return token;
    },
    
    async session({ session, token }) {
      // Send properties to the client
      if (token && session.user) {
        session.user.id = (token.userId as string) || token.sub || '';
        session.user.role = (token.role as string) || 'viewer';
      }
      return session;
    },
  },
  
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  
  session: {
    strategy: "jwt",
  },
  
  secret: process.env.NEXTAUTH_SECRET,
};

// Helper function to check if user has required role (for bar-specific roles)
export function hasRequiredRole(userRole: string, requiredRole: string): boolean {
  const roleHierarchy = {
    viewer: 0,
    staff: 1,
    manager: 2,
    owner: 3,
    superadmin: 4
  };
  
  const userLevel = roleHierarchy[userRole as keyof typeof roleHierarchy] || 0;
  const requiredLevel = roleHierarchy[requiredRole as keyof typeof roleHierarchy] || 0;
  
  return userLevel >= requiredLevel;
}

// Helper function to check if user has required system role (for system-wide permissions)
export function hasRequiredSystemRole(userRole: string, requiredRole: string): boolean {
  const systemRoleHierarchy = {
    user: 0,
    superadmin: 1
  };
  
  const userLevel = systemRoleHierarchy[userRole as keyof typeof systemRoleHierarchy] || 0;
  const requiredLevel = systemRoleHierarchy[requiredRole as keyof typeof systemRoleHierarchy] || 0;
  
  return userLevel >= requiredLevel;
}

// Helper function to check if user can access a specific bar
export async function canAccessBar(userId: string, barId: string, requiredRole: string = "staff"): Promise<boolean> {
  // Superadmins can access all bars
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true }
  });
  
  if (user?.role === "superadmin") {
    return true;
  }
  
  // Check specific bar access
  const userBar = await prisma.userBar.findUnique({
    where: {
      userId_barId: {
        userId,
        barId
      }
    }
  });
  
  if (!userBar) {
    return false;
  }
  
  return hasRequiredRole(userBar.role, requiredRole);
}

// Helper function to check if user owns a specific bar
export async function isBarOwner(userId: string, barId: string): Promise<boolean> {
  // Superadmins are considered owners of all bars
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true }
  });
  
  if (user?.role === "superadmin") {
    return true;
  }
  
  // Check if user is the owner of this bar
  const userBar = await prisma.userBar.findUnique({
    where: {
      userId_barId: {
        userId,
        barId
      }
    }
  });
  
  return userBar?.role === "owner";
}