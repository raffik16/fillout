import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions, hasRequiredSystemRole } from '@/lib/auth';

// GET /api/bars - Get all bars (filtered by ownership for non-superadmins)
export async function GET() {
  try {
    console.log('Fetching bars...');
    const session = await getServerSession(authOptions);
    
    let whereClause: any = { active: true };
    
    // If user is not a superadmin, filter to only bars they own/manage
    if (session?.user && session.user.role !== 'superadmin') {
      whereClause = {
        ...whereClause,
        users: {
          some: {
            userId: session.user.id,
            role: {
              in: ['owner', 'manager'] // Only show bars where user is owner or manager
            }
          }
        }
      };
    }
    
    const bars = await prisma.bar.findMany({
      where: whereClause,
      select: {
        id: true,
        slug: true,
        name: true,
        description: true,
        location: true,
        logo: true,
        users: {
          where: { role: 'owner' },
          select: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              }
            }
          }
        },
        _count: {
          select: {
            drinks: true,
            users: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    });

    console.log('Found bars:', bars.length);
    return NextResponse.json(bars);
  } catch (error) {
    console.error('Error fetching bars:', error);
    return NextResponse.json(
      { error: 'Failed to fetch bars', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// POST /api/bars - Create a new bar
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    // Check authentication and permissions
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Only superadmins and bar owners/managers can create bars
    if (!hasRequiredSystemRole(session.user.role, 'superadmin')) {
      // For non-superadmins, check if they have manager/owner role in any bar
      const hasManagerAccess = await prisma.userBar.findFirst({
        where: {
          userId: session.user.id,
          role: { in: ['manager', 'owner'] }
        }
      });
      
      if (!hasManagerAccess) {
        return NextResponse.json(
          { error: 'Insufficient permissions' },
          { status: 403 }
        );
      }
    }

    const body = await request.json();
    const { slug, name, description, location, email, phone, website, logo } = body;

    // Validate required fields
    if (!slug || !name) {
      return NextResponse.json(
        { error: 'Slug and name are required' },
        { status: 400 }
      );
    }

    // Check if slug already exists
    const existing = await prisma.bar.findUnique({
      where: { slug },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'Bar with this slug already exists' },
        { status: 409 }
      );
    }

    // Create bar and assign current user as owner
    const result = await prisma.$transaction(async (tx) => {
      const bar = await tx.bar.create({
        data: {
          slug,
          name,
          description,
          location,
          email,
          phone,
          website,
          logo,
        },
      });

      // Create owner relationship with current user
      await tx.userBar.create({
        data: {
          userId: session.user.id,
          barId: bar.id,
          role: 'owner',
        },
      });

      return bar;
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error('Error creating bar:', error);
    return NextResponse.json(
      { error: 'Failed to create bar' },
      { status: 500 }
    );
  }
}