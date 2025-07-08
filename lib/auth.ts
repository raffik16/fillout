import { NextAuthOptions } from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as any,
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

        // For demo purposes, allow hardcoded admin credentials
        // In production, implement proper password hashing
        if (credentials.email === "admin@drinkjoy.app" && credentials.password === "admin123") {
          return {
            id: "admin",
            email: "admin@drinkjoy.app",
            name: "Admin User",
            role: "superadmin"
          };
        }

        return null;
      }
    }),

    // OAuth providers (optional - enable when configured)
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET ? [
      GoogleProvider({
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      })
    ] : []),

    ...(process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET ? [
      GitHubProvider({
        clientId: process.env.GITHUB_CLIENT_ID,
        clientSecret: process.env.GITHUB_CLIENT_SECRET,
      })
    ] : []),
  ],
  
  callbacks: {
    async jwt({ token, user }) {
      // Persist the role in the token right after signin
      if (user) {
        // For demo credentials user
        if (user.id === "admin") {
          token.role = "superadmin";
        } else {
          // For OAuth users, fetch role from database
          const dbUser = await prisma.user.findUnique({
            where: { email: user.email! },
            select: { role: true, id: true }
          });
          
          if (dbUser) {
            token.role = dbUser.role;
            token.userId = dbUser.id;
          } else {
            // Create new user with default role
            const newUser = await prisma.user.create({
              data: {
                email: user.email!,
                name: user.name,
                image: user.image,
                role: "viewer"
              }
            });
            token.role = newUser.role;
            token.userId = newUser.id;
          }
        }
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

// Helper function to check if user has required role
export function hasRequiredRole(userRole: string, requiredRole: string): boolean {
  const roleHierarchy = {
    viewer: 0,
    staff: 1,
    manager: 2,
    superadmin: 3
  };
  
  const userLevel = roleHierarchy[userRole as keyof typeof roleHierarchy] || 0;
  const requiredLevel = roleHierarchy[requiredRole as keyof typeof roleHierarchy] || 0;
  
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