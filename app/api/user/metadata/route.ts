import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { 
  updateDrinkPreferences,
  updateFavoriteCategories,
  updateAIChatPreferences
} from '../../../../lib/clerk/metadata';

export async function PUT(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { type, data } = body;

    if (!type || !data) {
      return NextResponse.json(
        { error: 'Missing type or data in request body' },
        { status: 400 }
      );
    }

    let result;

    switch (type) {
      case 'drinkPreferences':
        result = await updateDrinkPreferences(userId, data);
        break;
      
      case 'favoriteCategories':
        result = await updateFavoriteCategories(userId, data);
        break;
      
      case 'aiChatPreferences':
        result = await updateAIChatPreferences(userId, data);
        break;
      
      default:
        return NextResponse.json(
          { error: `Unknown metadata type: ${type}` },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      data: result,
      type
    });

  } catch (error) {
    console.error('Error updating user metadata:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Import getUserMetadataProfile here to avoid server/client boundary issues
    const { getUserMetadataProfile } = await import('../../../../lib/clerk/metadata');
    const profile = await getUserMetadataProfile(userId);

    return NextResponse.json({
      success: true,
      data: profile
    });

  } catch (error) {
    console.error('Error fetching user metadata:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}