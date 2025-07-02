import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

interface RouteParams {
  params: Promise<{
    slug: string;
  }>;
}

// GET /api/bars/by-slug/[slug] - Get a bar by its slug
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { slug } = await params;

    const bar = await prisma.bar.findUnique({
      where: { slug },
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

    // Add cache control headers to prevent stale data
    const response = NextResponse.json(bar);
    response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    
    return response;
  } catch (error) {
    console.error('Error fetching bar by slug:', error);
    return NextResponse.json(
      { error: 'Failed to fetch bar' },
      { status: 500 }
    );
  }
}