import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions, canAccessBar } from '@/lib/auth';

interface RouteParams {
  params: Promise<{
    slug: string;
  }>;
}

// GET /api/bars/by-slug/[slug] - Get a bar by its slug
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { slug } = await params;
    const session = await getServerSession(authOptions);

    const bar = await prisma.bar.findUnique({
      where: { slug, active: true }, // Only return active bars
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

    // Check if user has access to this bar for detailed information
    let hasAccess = false;
    if (session?.user?.id) {
      hasAccess = await canAccessBar(session.user.id, bar.id, 'viewer');
    }

    // Return different levels of information based on access
    let responseData;
    if (hasAccess) {
      // Authenticated user with access - return full details
      responseData = bar;
    } else {
      // Public access - return limited information
      responseData = {
        id: bar.id,
        slug: bar.slug,
        name: bar.name,
        description: bar.description,
        location: bar.location,
        logo: bar.logo,
        theme: bar.theme,
        // Count information is safe to expose publicly
        _count: {
          drinks: bar._count.drinks,
          users: 0, // Don't expose user count to public
        },
        // Remove sensitive fields for public access
        email: undefined,
        settings: undefined,
        createdAt: undefined,
        updatedAt: undefined,
      };
    }

    // Add cache control headers to prevent stale data
    const response = NextResponse.json(responseData);
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