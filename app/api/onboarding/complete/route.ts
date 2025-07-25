import { NextRequest, NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { OnboardingData } from '@/app/types/onboarding';

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
    const { onboardingData, redirectTo } = body as {
      onboardingData: OnboardingData;
      redirectTo?: string;
    };

    // Validate required data
    if (!onboardingData) {
      return NextResponse.json(
        { error: 'Onboarding data is required' },
        { status: 400 }
      );
    }

    // Update user metadata with completed onboarding
    await user.update({
      publicMetadata: {
        ...user.publicMetadata,
        onboardingData: {
          ...onboardingData,
          finalStepCompleted: true
        },
        onboardingProgress: {
          currentStep: 'completion',
          completedSteps: ['welcome', 'preferences', 'subscription', 'completion'],
          skippedSteps: onboardingData.skipSubscription ? ['subscription'] : [],
          isComplete: true,
          startedAt: user.publicMetadata?.onboardingProgress?.startedAt || new Date().toISOString(),
          completedAt: new Date().toISOString()
        },
        onboardingCompletedAt: new Date().toISOString(),
        // Set initial analytics tracking
        totalDrinksLiked: user.publicMetadata?.totalDrinksLiked || 0,
        totalOrdersPlaced: user.publicMetadata?.totalOrdersPlaced || 0,
        // Store selected subscription plan
        subscriptionPlan: onboardingData.selectedPlan || 'free',
      }
    });

    return NextResponse.json({
      success: true,
      redirectTo: redirectTo || '/dashboard',
      message: 'Onboarding completed successfully'
    });

  } catch (error) {
    console.error('Error completing onboarding:', error);
    return NextResponse.json(
      { error: 'Failed to complete onboarding' },
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
      },
      isComplete: onboardingProgress?.isComplete || onboardingData?.finalStepCompleted || false
    });

  } catch (error) {
    console.error('Error fetching onboarding status:', error);
    return NextResponse.json(
      { error: 'Failed to fetch onboarding status' },
      { status: 500 }
    );
  }
}