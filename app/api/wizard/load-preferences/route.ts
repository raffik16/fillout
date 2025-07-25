import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { loadWizardPreferencesFromMetadata } from '../../../../lib/clerk/wizard-integration';

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Load wizard preferences from user metadata
    const preferences = await loadWizardPreferencesFromMetadata(userId);

    // Check if user has any saved preferences
    const hasPreferences = !!(preferences.category || preferences.flavor);
    
    if (!hasPreferences) {
      return NextResponse.json(
        { error: 'No saved preferences found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      preferences,
      hasPreferences
    });

  } catch (error) {
    console.error('Error loading wizard preferences:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}