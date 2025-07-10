import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions, hasRequiredSystemRole, canAccessBar } from '@/lib/auth';
import { updateBarSchema, formatValidationErrors } from '@/lib/validation';

interface RouteParams {
  params: Promise<{
    barId: string;
  }>;
}

// GET /api/bars/[barId] - Get a specific bar
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { barId } = await params;
    const session = await getServerSession(authOptions);
    
    // Check authentication
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Check if user has access to this bar
    const hasAccess = await canAccessBar(session.user.id, barId, 'viewer');
    if (!hasAccess) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const bar = await prisma.bar.findUnique({
      where: { id: barId },
      include: {
        _count: {
          select: {
            drinks: true,
            users: true,
          },
        },
      },
    });

    if (!bar) {
      return NextResponse.json(
        { error: 'Bar not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(bar);
  } catch (error) {
    console.error('Error fetching bar:', error);
    return NextResponse.json(
      { error: 'Failed to fetch bar' },
      { status: 500 }
    );
  }
}

// PUT /api/bars/[barId] - Update a bar
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { barId } = await params;
    const session = await getServerSession(authOptions);
    
    // Check authentication
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check permissions: superadmin or owner/manager of this bar
    if (!hasRequiredSystemRole(session.user.role, 'superadmin')) {
      const hasAccess = await prisma.userBar.findFirst({
        where: {
          userId: session.user.id,
          barId: barId,
          role: { in: ['owner', 'manager'] }
        }
      });
      
      if (!hasAccess) {
        return NextResponse.json(
          { error: 'Insufficient permissions' },
          { status: 403 }
        );
      }
    }

    const body = await request.json();
    
    // Validate input
    const validationResult = updateBarSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: formatValidationErrors(validationResult.error) },
        { status: 400 }
      );
    }
    
    const { slug, name, description, location, email, logo } = validationResult.data;

    // Check if slug already exists for a different bar
    const existing = await prisma.bar.findFirst({
      where: { 
        slug,
        id: { not: barId }
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'Bar with this slug already exists' },
        { status: 409 }
      );
    }

    const bar = await prisma.bar.update({
      where: { id: barId },
      data: {
        slug,
        name,
        description,
        location,
        email,
        logo,
      },
    });

    return NextResponse.json(bar);
  } catch (error) {
    console.error('Error updating bar:', error);
    return NextResponse.json(
      { error: 'Failed to update bar' },
      { status: 500 }
    );
  }
}

// DELETE /api/bars/[barId] - Delete a bar
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { barId } = await params;
    const session = await getServerSession(authOptions);
    
    // Check authentication
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check permissions: only superadmin or bar owner can delete
    if (!hasRequiredSystemRole(session.user.role, 'superadmin')) {
      const hasAccess = await prisma.userBar.findFirst({
        where: {
          userId: session.user.id,
          barId: barId,
          role: 'owner' // Only owners can delete their own bars
        }
      });
      
      if (!hasAccess) {
        return NextResponse.json(
          { error: 'Insufficient permissions' },
          { status: 403 }
        );
      }
    }

    // Check if bar exists
    const bar = await prisma.bar.findUnique({
      where: { id: barId },
    });

    if (!bar) {
      return NextResponse.json(
        { error: 'Bar not found' },
        { status: 404 }
      );
    }

    await prisma.bar.delete({
      where: { id: barId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting bar:', error);
    return NextResponse.json(
      { error: 'Failed to delete bar' },
      { status: 500 }
    );
  }
}