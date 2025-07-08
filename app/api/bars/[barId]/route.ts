import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions, hasRequiredSystemRole } from '@/lib/auth';

interface RouteParams {
  params: Promise<{
    barId: string;
  }>;
}

// GET /api/bars/[barId] - Get a specific bar
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { barId } = await params;

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
    const { slug, name, description, location, email, phone, website, logo } = body;

    // Validate required fields
    if (!slug || !name) {
      return NextResponse.json(
        { error: 'Slug and name are required' },
        { status: 400 }
      );
    }

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
        phone,
        website,
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