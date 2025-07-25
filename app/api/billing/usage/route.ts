import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getUserUsage, getCurrentPlan, trackUsage } from '@/lib/billing/subscription';
import { PRICING_PLANS } from '@/lib/billing/plans';

export async function GET(request: NextRequest) {
  try {
    const { userId } = auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const feature = searchParams.get('feature');

    if (!feature) {
      return NextResponse.json(
        { error: 'Feature parameter is required' },
        { status: 400 }
      );
    }

    // Get user's current plan and usage
    const currentPlan = await getCurrentPlan(userId);
    const planFeatures = PRICING_PLANS.find(p => p.id === currentPlan)?.features;
    
    if (!planFeatures) {
      return NextResponse.json(
        { error: 'Invalid plan' },
        { status: 400 }
      );
    }

    const featureLimit = planFeatures[feature as keyof typeof planFeatures];
    const usage = await getUserUsage(userId, feature);
    const currentUsage = usage[feature as keyof typeof usage] || 0;

    // Calculate reset date (start of next month)
    const resetDate = new Date();
    resetDate.setMonth(resetDate.getMonth() + 1, 1);
    resetDate.setHours(0, 0, 0, 0);

    return NextResponse.json({
      current: currentUsage,
      limit: featureLimit === 'unlimited' ? 'unlimited' : featureLimit,
      resetDate: resetDate.toISOString(),
      plan: currentPlan
    });

  } catch (error) {
    console.error('Error fetching usage:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { feature, increment = 1 } = await request.json();

    if (!feature) {
      return NextResponse.json(
        { error: 'Feature parameter is required' },
        { status: 400 }
      );
    }

    // Track the usage
    const newUsage = await trackUsage(userId, feature, increment);

    return NextResponse.json({
      success: true,
      usage: newUsage
    });

  } catch (error) {
    console.error('Error tracking usage:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}