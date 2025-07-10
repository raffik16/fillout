import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const drinkId = searchParams.get('id');

    // Get user's accessible bars
    const userBars = await prisma.userBar.findMany({
      where: { userId: session.user.id },
      select: { barId: true }
    });

    // Superadmins can access all bars
    let accessibleBarIds: string[] = [];
    if (session.user.role === 'superadmin') {
      const allBars = await prisma.bar.findMany({
        where: { active: true },
        select: { id: true }
      });
      accessibleBarIds = allBars.map(bar => bar.id);
    } else {
      accessibleBarIds = userBars.map(ub => ub.barId);
    }

    // If user has no accessible bars, return empty result
    if (accessibleBarIds.length === 0) {
      return NextResponse.json({
        drinks: [],
        total: 0,
      });
    }

    // If ID is provided, return single drink (if user has access)
    if (drinkId) {
      const drink = await prisma.drink.findUnique({
        where: { 
          id: drinkId,
          barId: { in: accessibleBarIds }, // Ensure user has access to this bar
        },
        include: {
          inventory: {
            select: { inStock: true, quantity: true },
          },
        },
      });
      
      if (!drink) {
        return NextResponse.json(
          { error: 'Drink not found or access denied' },
          { status: 404 }
        );
      }

      // Transform the data to match expected format
      const transformedDrink = {
        ...drink,
        flavor_profile: drink.flavorProfile,
        weather_match: drink.weatherMatch,
        serving_suggestions: drink.servingSuggestions,
        glass_type: drink.glassType,
        image_url: drink.imageUrl,
        inStock: drink.inventory[0]?.inStock ?? true,
        quantity: drink.inventory[0]?.quantity ?? null,
        inventory: undefined,
      };

      return NextResponse.json(transformedDrink);
    }

    // Build where clause based on filters
    const whereClause: Record<string, unknown> = {
      active: true,
      barId: { in: accessibleBarIds }, // Filter by accessible bars
    };

    // Parse categories
    const categories = searchParams.get('categories');
    if (categories) {
      whereClause.category = {
        in: categories.split(','),
      };
    }

    // Parse strength
    const strength = searchParams.get('strength');
    if (strength) {
      whereClause.strength = {
        in: strength.split(','),
      };
    }

    // Parse search query
    const search = searchParams.get('search');
    if (search) {
      whereClause.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Parse flavors - this is more complex as it's an array field
    const flavors = searchParams.get('flavors');
    let flavorFilter: Record<string, unknown> = {};
    if (flavors) {
      const flavorList = flavors.split(',');
      flavorFilter = {
        flavorProfile: {
          hasSome: flavorList,
        },
      };
    }

    // Parse occasions - similar to flavors
    const occasions = searchParams.get('occasions');
    let occasionFilter: Record<string, unknown> = {};
    if (occasions) {
      const occasionList = occasions.split(',');
      occasionFilter = {
        occasions: {
          hasSome: occasionList,
        },
      };
    }

    // Combine filters
    const finalWhere = {
      ...whereClause,
      ...flavorFilter,
      ...occasionFilter,
    };

    const drinks = await prisma.drink.findMany({
      where: finalWhere,
      include: {
        inventory: {
          select: { inStock: true, quantity: true },
        },
      },
      orderBy: [
        { featured: 'desc' },
        { name: 'asc' },
      ],
    });

    // Transform the data to include inventory status directly and map field names
    const transformedDrinks = drinks.map(drink => {
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
    const response = NextResponse.json({
      drinks: transformedDrinks,
      total: transformedDrinks.length,
    });
    response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    
    return response;
  } catch (error) {
    console.error('Drinks API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch drinks' },
      { status: 500 }
    );
  }
}