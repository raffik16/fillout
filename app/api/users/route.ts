import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions, hasRequiredSystemRole } from '@/lib/auth';
import { hashPassword } from '@/lib/password';
import { createUserSchema, formatValidationErrors } from '@/lib/validation';
import { handleApiError, ApiError } from '@/lib/error-handler';
import { apiRateLimit } from '@/lib/rate-limit';

// GET /api/users - List all users (requires superadmin)
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || !hasRequiredSystemRole(session.user.role, 'superadmin')) {
      throw new ApiError('Unauthorized', 401);
    }

    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        bars: {
          include: {
            bar: {
              select: {
                id: true,
                name: true,
                slug: true,
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(users);
  } catch (error) {
    return handleApiError(error);
  }
}

// POST /api/users - Create a new user (requires superadmin)
export async function POST(request: NextRequest) {
  try {
    // Apply rate limiting
    const rateLimitResult = apiRateLimit(request);
    if (!rateLimitResult.isAllowed) {
      return NextResponse.json(
        { error: rateLimitResult.error },
        { 
          status: 429,
          headers: rateLimitResult.headers
        }
      );
    }

    const session = await getServerSession(authOptions);
    
    if (!session?.user || !hasRequiredSystemRole(session.user.role, 'superadmin')) {
      throw new ApiError('Unauthorized', 401);
    }

    const body = await request.json();
    
    // Validate input
    const validationResult = createUserSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: formatValidationErrors(validationResult.error) },
        { status: 400 }
      );
    }
    
    const { email, name, role, password, barAssignments } = validationResult.data;

    // Validate that regular users have at least one bar assignment
    if (role !== 'superadmin' && (!barAssignments || barAssignments.length === 0)) {
      return NextResponse.json(
        { error: 'At least one bar assignment is required for regular users' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        name,
        role,
        password: hashedPassword,
        bars: {
          create: barAssignments.map((assignment: any) => ({
            barId: assignment.barId,
            role: assignment.role || 'staff',
          })),
        },
      },
      include: {
        bars: {
          include: {
            bar: true,
          },
        },
      },
    });

    return NextResponse.json(user, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}