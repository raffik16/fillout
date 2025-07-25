import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getPersonalizedWizardSuggestions } from '../../../../lib/clerk/wizard-integration';

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get personalized suggestions based on user's history
    const suggestions = await getPersonalizedWizardSuggestions(userId);

    return NextResponse.json({
      success: true,
      suggestions
    });

  } catch (error) {
    console.error('Error getting wizard suggestions:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}