import { NextRequest, NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { OnboardingData, OnboardingStep } from '@/app/types/onboarding';

export async function POST(request: NextRequest) {
  try {
    const { userId } = auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const user = await currentUser();
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { 
      currentStep, 
      stepData, 
      completedStep 
    } = body as {
      currentStep: OnboardingStep;
      stepData?: Partial<OnboardingData>;
      completedStep?: OnboardingStep;
    };

    // Get existing data
    const existingOnboardingData = (user.publicMetadata?.onboardingData as OnboardingData) || {
      welcomeCompleted: false,
      hasSeenIntro: false,
      preferencesCompleted: false,
      subscriptionCompleted: false,
      finalStepCompleted: false,
    };

    const existingProgress = user.publicMetadata?.onboardingProgress || {
      currentStep: 'welcome',
      completedSteps: [],
      skippedSteps: [],
      isComplete: false,
      startedAt: new Date().toISOString(),
    };

    // Update completed steps
    const completedSteps = [...existingProgress.completedSteps];
    if (completedStep && !completedSteps.includes(completedStep)) {
      completedSteps.push(completedStep);
    }

    // Merge step data
    const updatedOnboardingData = {
      ...existingOnboardingData,
      ...stepData
    };

    // Update progress
    const updatedProgress = {
      ...existingProgress,
      currentStep,
      completedSteps,
      isComplete: currentStep === 'completion' && updatedOnboardingData.finalStepCompleted
    };

    // Update user metadata
    await user.update({
      publicMetadata: {
        ...user.publicMetadata,
        onboardingData: updatedOnboardingData,
        onboardingProgress: updatedProgress
      }
    });

    return NextResponse.json({
      success: true,
      onboardingData: updatedOnboardingData,
      onboardingProgress: updatedProgress
    });

  } catch (error) {
    console.error('Error updating onboarding progress:', error);
    return NextResponse.json(
      { error: 'Failed to update onboarding progress' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { userId } = auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const user = await currentUser();
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const onboardingData = user.publicMetadata?.onboardingData as OnboardingData;
    const onboardingProgress = user.publicMetadata?.onboardingProgress;
    
    return NextResponse.json({
      onboardingData: onboardingData || {
        welcomeCompleted: false,
        hasSeenIntro: false,
        preferencesCompleted: false,
        subscriptionCompleted: false,
        finalStepCompleted: false,
      },
      onboardingProgress: onboardingProgress || {
        currentStep: 'welcome',
        completedSteps: [],
        skippedSteps: [],
        isComplete: false,
        startedAt: new Date().toISOString(),
      }
    });

  } catch (error) {
    console.error('Error fetching onboarding progress:', error);
    return NextResponse.json(
      { error: 'Failed to fetch onboarding progress' },
      { status: 500 }
    );
  }
}