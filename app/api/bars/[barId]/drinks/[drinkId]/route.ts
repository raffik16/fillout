import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

interface RouteParams {
  params: Promise<{
    barId: string;
    drinkId: string;
  }>;
}

// GET /api/bars/[barId]/drinks/[drinkId] - Get a specific drink
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { barId, drinkId } = await params;

    const drink = await prisma.drink.findFirst({
      where: {
        id: drinkId,
        barId,
      },
      include: {
        inventory: {
          where: { barId },
          select: { inStock: true, quantity: true, notes: true },
        },
      },
    });

    if (!drink) {
      return NextResponse.json(
        { error: 'Drink not found' },
        { status: 404 }
      );
    }

    // Transform the data to include inventory status directly
    const inventory = drink.inventory[0];
    const drinkWithInventory = {
      ...drink,
      inStock: inventory?.inStock ?? true,
      quantity: inventory?.quantity ?? null,
      inventoryNotes: inventory?.notes ?? null,
      inventory: undefined,
    };

    return NextResponse.json(drinkWithInventory);
  } catch (error) {
    console.error('Error fetching drink:', error);
    return NextResponse.json(
      { error: 'Failed to fetch drink' },
      { status: 500 }
    );
  }
}

// PUT /api/bars/[barId]/drinks/[drinkId] - Update a drink
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { barId, drinkId } = await params;
    const body = await request.json();

    // Remove inventory fields and other non-updatable fields from the update data
    const { 
      inStock, 
      quantity, 
      inventoryNotes,
      id,
      barId: bodyBarId,
      bar,
      createdAt,
      updatedAt,
      inventory,
      _count,
      ...drinkData 
    } = body;

    // First verify the drink belongs to the bar
    const existingDrink = await prisma.drink.findFirst({
      where: {
        id: drinkId,
        barId,
      },
    });

    if (!existingDrink) {
      return NextResponse.json(
        { error: 'Drink not found' },
        { status: 404 }
      );
    }

    // Update the drink
    const drink = await prisma.drink.update({
      where: {
        id: drinkId,
      },
      data: {
        name: drinkData.name,
        category: drinkData.category,
        description: drinkData.description,
        price: drinkData.price !== undefined ? parseFloat(drinkData.price.toString()) : undefined,
        abv: drinkData.abv !== undefined ? parseFloat(drinkData.abv.toString()) : undefined,
        strength: drinkData.strength,
        glassType: drinkData.glassType,
        preparation: drinkData.preparation,
        imageUrl: drinkData.imageUrl,
        active: drinkData.active,
        featured: drinkData.featured,
        happyHourEligible: drinkData.happyHourEligible,
        ingredients: drinkData.ingredients,
        flavorProfile: drinkData.flavorProfile,
        weatherMatch: drinkData.weatherMatch,
        occasions: drinkData.occasions,
        servingSuggestions: drinkData.servingSuggestions,
      },
    });

    // Update inventory if provided
    if (inStock !== undefined || quantity !== undefined || inventoryNotes !== undefined) {
      await prisma.inventory.upsert({
        where: {
          barId_drinkId: {
            barId,
            drinkId,
          },
        },
        update: {
          inStock: inStock ?? undefined,
          quantity: quantity ?? undefined,
          notes: inventoryNotes ?? undefined,
        },
        create: {
          barId,
          drinkId,
          inStock: inStock ?? true,
          quantity: quantity ?? undefined,
          notes: inventoryNotes ?? undefined,
        },
      });
    }

    return NextResponse.json(drink);
  } catch (error) {
    console.error('Error updating drink:', error);
    return NextResponse.json(
      { error: 'Failed to update drink' },
      { status: 500 }
    );
  }
}

// DELETE /api/bars/[barId]/drinks/[drinkId] - Delete a drink
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { barId, drinkId } = await params;

    // Verify drink belongs to the bar before deleting
    const drink = await prisma.drink.findFirst({
      where: {
        id: drinkId,
        barId,
      },
    });

    if (!drink) {
      return NextResponse.json(
        { error: 'Drink not found' },
        { status: 404 }
      );
    }

    await prisma.drink.delete({
      where: { id: drinkId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting drink:', error);
    return NextResponse.json(
      { error: 'Failed to delete drink' },
      { status: 500 }
    );
  }
}