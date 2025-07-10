import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions, canAccessBar } from '@/lib/auth';
import { createDrinkSchema, formatValidationErrors } from '@/lib/validation';

interface RouteParams {
  params: Promise<{
    barId: string;
  }>;
}

// GET /api/bars/[barId]/drinks - Get all drinks for a specific bar
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { barId } = await params;
    const { searchParams } = new URL(request.url);
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
    
    const category = searchParams.get('category');
    const active = searchParams.get('active') !== 'false';

    const drinks = await prisma.drink.findMany({
      where: {
        barId,
        active,
        ...(category && { category }),
      },
      include: {
        inventory: {
          where: { barId },
          select: { inStock: true, quantity: true },
        },
      },
      orderBy: [
        { featured: 'desc' },
        { name: 'asc' },
      ],
    });

    // Transform the data to include inventory status directly and map field names
    const drinksWithInventory = drinks.map(drink => {
      const inventory = drink.inventory[0];
      return {
        ...drink,
        // Map database fields to expected frontend fields
        flavor_profile: drink.flavorProfile,
        weather_match: drink.weatherMatch,
        serving_suggestions: drink.servingSuggestions,
        glass_type: drink.glassType,
        image_url: drink.imageUrl,
        // Inventory
        inStock: inventory?.inStock ?? true,
        quantity: inventory?.quantity ?? null,
        inventory: undefined, // Remove the nested inventory array
      };
    });

    // Add cache control headers to prevent stale data
    const response = NextResponse.json(drinksWithInventory);
    response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    
    return response;
  } catch (error) {
    console.error('Error fetching bar drinks:', error);
    return NextResponse.json(
      { error: 'Failed to fetch drinks' },
      { status: 500 }
    );
  }
}

// POST /api/bars/[barId]/drinks - Create a new drink for a bar
export async function POST(request: NextRequest, { params }: RouteParams) {
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

    // Check if user has permission to manage drinks for this bar
    const canManage = await canAccessBar(session.user.id, barId, 'staff');
    if (!canManage) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const body = await request.json();
    
    // Validate input
    const validationResult = createDrinkSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: formatValidationErrors(validationResult.error) },
        { status: 400 }
      );
    }
    
    const validatedData = validationResult.data;

    // Ensure bar exists
    const bar = await prisma.bar.findUnique({
      where: { id: barId },
    });

    if (!bar) {
      return NextResponse.json(
        { error: 'Bar not found' },
        { status: 404 }
      );
    }

    // Create the drink
    const drink = await prisma.drink.create({
      data: {
        barId,
        ...validatedData,
      },
    });

    // Create initial inventory record
    await prisma.inventory.create({
      data: {
        barId,
        drinkId: drink.id,
        inStock: true,
      },
    });

    return NextResponse.json(drink, { status: 201 });
  } catch (error) {
    console.error('Error creating drink:', error);
    return NextResponse.json(
      { error: 'Failed to create drink' },
      { status: 500 }
    );
  }
}