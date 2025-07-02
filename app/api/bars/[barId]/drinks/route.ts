import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

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
    const body = await request.json();

    // Validate required fields
    const { name, category, price, strength } = body;
    if (!name || !category || price === undefined || !strength) {
      return NextResponse.json(
        { error: 'Name, category, price, and strength are required' },
        { status: 400 }
      );
    }

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
        name,
        category,
        description: body.description,
        price: parseFloat(price),
        abv: body.abv || 0,
        strength,
        glassType: body.glassType,
        preparation: body.preparation,
        imageUrl: body.imageUrl,
        featured: body.featured || false,
        happyHourEligible: body.happyHourEligible || false,
        ingredients: body.ingredients || [],
        flavorProfile: body.flavorProfile || [],
        weatherMatch: body.weatherMatch,
        occasions: body.occasions,
        servingSuggestions: body.servingSuggestions,
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