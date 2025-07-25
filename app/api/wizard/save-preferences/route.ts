import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { saveWizardResultsToMetadata } from '../../../../lib/clerk/wizard-integration';
import { WizardPreferences } from '../../../types/wizard';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const wizardPreferences: WizardPreferences = await request.json();

    // Validate required fields
    if (!wizardPreferences || typeof wizardPreferences !== 'object') {
      return NextResponse.json(
        { error: 'Invalid wizard preferences data' },
        { status: 400 }
      );
    }

    // Save wizard results to user metadata
    const updatedPreferences = await saveWizardResultsToMetadata(userId, wizardPreferences);

    return NextResponse.json({
      success: true,
      message: 'Wizard preferences saved successfully',
      data: updatedPreferences
    });

  } catch (error) {
    console.error('Error saving wizard preferences:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}