import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { hasAccess, getUserUsage, getCurrentPlan } from '@/lib/billing/subscription';
import { SubscriptionPlan } from '@/app/types/billing';
import { PRICING_PLANS } from '@/lib/billing/plans';

interface AccessCheckRequest {
  requiredPlan?: SubscriptionPlan;
  requiredUsage?: {
    feature: string;
    limit: number;
  };
  feature: string;
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = auth();
    
    const body: AccessCheckRequest = await request.json();
    const { requiredPlan, requiredUsage, feature } = body;

    // For anonymous users
    if (!userId) {
      if (requiredPlan && requiredPlan !== 'free') {
        return NextResponse.json({
          hasAccess: false,
          currentPlan: 'free',
          reason: 'authentication_required'
        });
      }
      
      // Anonymous users get minimal access
      return NextResponse.json({
        hasAccess: true,
        currentPlan: 'free'
      });
    }

    // Get user's current plan
    const currentPlan = await getCurrentPlan(userId);
    const planFeatures = PRICING_PLANS.find(p => p.id === currentPlan)?.features;

    // Check plan-based access
    if (requiredPlan) {
      const planAccess = await hasAccess(requiredPlan);
      if (!planAccess) {
        return NextResponse.json({
          hasAccess: false,
          currentPlan,
          reason: 'insufficient_plan'
        });
      }
    }

    // Check usage-based access
    if (requiredUsage) {
      const { feature: usageFeature, limit } = requiredUsage;
      
      // Get current usage for the feature
      const usage = await getUserUsage(userId, usageFeature);
      const currentUsage = usage[usageFeature as keyof typeof usage] || 0;
      
      // Calculate reset date (start of next month)
      const now = new Date();
      const resetDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);
      
      // Check if user has exceeded limit
      if (currentUsage >= limit) {
        return NextResponse.json({
          hasAccess: false,
          currentPlan,
          usage: {
            current: currentUsage,
            limit,
            resetDate: resetDate.toISOString()
          },
          reason: 'usage_limit_exceeded'
        });
      }
      
      // Return usage info even when access is granted
      return NextResponse.json({
        hasAccess: true,
        currentPlan,
        usage: {
          current: currentUsage,
          limit,
          resetDate: resetDate.toISOString()
        }
      });
    }

    // Feature-specific usage checks
    if (feature && planFeatures) {
      const featureLimit = planFeatures[feature as keyof typeof planFeatures];
      
      if (typeof featureLimit === 'number') {
        const usage = await getUserUsage(userId, feature);
        const currentUsage = usage[feature as keyof typeof usage] || 0;
        
        const resetDate = new Date();
        resetDate.setMonth(resetDate.getMonth() + 1, 1);
        resetDate.setHours(0, 0, 0, 0);
        
        if (currentUsage >= featureLimit) {
          return NextResponse.json({
            hasAccess: false,
            currentPlan,
            usage: {
              current: currentUsage,
              limit: featureLimit,
              resetDate: resetDate.toISOString()
            },
            reason: 'usage_limit_exceeded'
          });
        }
        
        return NextResponse.json({
          hasAccess: true,
          currentPlan,
          usage: {
            current: currentUsage,
            limit: featureLimit,
            resetDate: resetDate.toISOString()
          }
        });
      }
    }

    // Default access granted
    return NextResponse.json({
      hasAccess: true,
      currentPlan
    });

  } catch (error) {
    console.error('Error checking access:', error);
    return NextResponse.json(
      { 
        hasAccess: false,
        currentPlan: 'free',
        reason: 'error',
        error: 'Internal server error' 
      },
      { status: 500 }
    );
  }
}