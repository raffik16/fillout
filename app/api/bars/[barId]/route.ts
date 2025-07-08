import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

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
    const body = await request.json();

    const bar = await prisma.bar.update({
      where: { id: barId },
      data: body,
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