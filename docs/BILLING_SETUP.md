# Drinkjoy Billing System Setup Guide

This guide covers the implementation of Clerk's native billing system with Stripe integration for Drinkjoy subscriptions.

## Overview

The billing system provides:
- Three subscription tiers: Free, Premium ($9.99/month), Pro ($19.99/month)
- Feature gating and access control
- Usage tracking and limits
- Subscription management
- Webhook handling for billing events

## Architecture

### Components Structure
```
/app/components/billing/
├── PricingTable.tsx          # Main pricing display component
├── SubscriptionGate.tsx      # Feature access control
├── UsageLimitWarning.tsx     # Free tier usage notifications
├── UpgradePrompt.tsx         # Subscription conversion prompts
├── SubscriptionStatus.tsx    # Current subscription display
└── index.ts                  # Component exports
```

### API Routes
```
/app/api/billing/
├── check-access/route.ts     # Verify plan access
├── subscription/route.ts     # Get subscription data
├── usage/route.ts           # Get usage statistics
├── create-checkout/route.ts  # Create payment session
└── webhooks/route.ts        # Handle billing webhooks
```

### Utilities
```
/lib/billing/
├── plans.ts                 # Plan definitions and utilities
├── subscription.ts          # Subscription management
└── index.ts                 # Billing utilities export
```

## Configuration

### 1. Environment Variables

Add these variables to your `.env.local` file:

```bash
# Stripe Configuration
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key_here
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_stripe_webhook_secret_here

# Clerk Billing Configuration
NEXT_PUBLIC_CLERK_BILLING_PORTAL_URL=https://billing.clerk.dev/portal/your_clerk_app_id
CLERK_BILLING_WEBHOOK_SECRET=your_clerk_billing_webhook_secret_here

# Subscription Plans
NEXT_PUBLIC_FREE_TIER_LIMIT=10
NEXT_PUBLIC_PREMIUM_PLAN_ID=price_premium_plan_id_here
NEXT_PUBLIC_PRO_PLAN_ID=price_pro_plan_id_here
```

### 2. Clerk Dashboard Setup

1. **Enable Billing**: Go to your Clerk Dashboard → Billing section
2. **Connect Stripe**: Link your Stripe account to Clerk
3. **Create Products**: Set up your subscription products in Stripe
4. **Configure Webhooks**: Add webhook endpoint: `https://yourdomain.com/api/billing/webhooks`
5. **Set URLs**: Configure billing portal and checkout URLs

### 3. Stripe Dashboard Setup

1. **Create Products**: Set up Free, Premium, and Pro products
2. **Create Prices**: Set recurring prices for each product
3. **Configure Webhooks**: Add webhook endpoints for subscription events
4. **Test Mode**: Use test mode during development

## Usage Examples

### 1. Feature Gating

```tsx
import { SubscriptionGate } from '@/app/components/billing';

function PremiumFeature() {
  return (
    <SubscriptionGate 
      requiredPlan="premium" 
      feature="Weather-based recommendations"
    >
      <WeatherBasedRecommendations />
    </SubscriptionGate>
  );
}
```

### 2. Usage Warnings

```tsx
import { UsageLimitWarning } from '@/app/components/billing';

function DrinkRecommendations() {
  return (
    <div>
      <UsageLimitWarning 
        feature="drinkRecommendations" 
        currentUsage={8} 
      />
      <RecommendationsList />
    </div>
  );
}
```

### 3. Upgrade Prompts

```tsx
import { UpgradePrompt } from '@/app/components/billing';

function LimitReachedMessage() {
  return (
    <div className="text-center p-6">
      <h3>You've reached your monthly limit</h3>
      <UpgradePrompt 
        requiredPlan="premium" 
        feature="unlimited recommendations"
        variant="modal"
      />
    </div>
  );
}
```

### 4. Pricing Display

```tsx
import { PricingTable } from '@/app/components/billing';

function PricingPage() {
  return (
    <div>
      <h1>Choose Your Plan</h1>
      <PricingTable currentPlan="free" />
    </div>
  );
}
```

## Plan Features

### Free Plan
- 10 drink recommendations per month
- Basic allergy filtering
- 5 saved drinks
- Core features access

### Premium Plan ($9.99/month)
- 100 drink recommendations per month
- Weather integration
- Advanced allergy filtering
- 50 saved drinks
- Premium recipes access
- Custom filters

### Pro Plan ($19.99/month)
- Unlimited drink recommendations
- All Premium features
- Analytics dashboard access
- Priority support
- Business features

## Security Considerations

### 1. Webhook Verification
Always verify webhook signatures:
```typescript
const signature = headers().get('clerk-webhook-signature');
// Verify signature against Clerk's webhook secret
```

### 2. Access Control
Server-side verification for sensitive operations:
```typescript
const { userId } = auth();
const hasAccess = await hasAccess('premium');
```

### 3. Environment Variables
Never commit real API keys to version control. Use different keys for development and production.

## Middleware Integration

The middleware automatically protects premium routes:

```typescript
// middleware.ts
const isPremiumRoute = createRouteMatcher([
  '/premium-recipes',
  '/advanced-analytics',
  '/custom-filters',
]);
```

Users without proper subscriptions are redirected to the pricing page.

## Database Integration

For production, integrate with your database to:
- Track usage statistics
- Store subscription metadata
- Handle user preferences
- Log billing events

## Testing

### Test Cards (Stripe)
Use these test card numbers in development:
- `4242424242424242` - Successful payment
- `4000000000000002` - Card declined
- `4000000000009995` - Insufficient funds

### Webhook Testing
Use Stripe CLI to test webhooks locally:
```bash
stripe listen --forward-to localhost:3000/api/billing/webhooks
```

## Monitoring

Monitor these metrics:
- Subscription conversion rates
- Usage patterns
- Payment failures
- Churn rates
- Customer lifetime value

## Troubleshooting

### Common Issues

1. **Webhook Failures**: Check webhook signature verification
2. **Access Denied**: Verify subscription status and plan hierarchy
3. **Payment Failures**: Handle gracefully with retry logic
4. **Usage Tracking**: Ensure proper database updates

### Debug Mode
Enable debug logging in development:
```typescript
console.log('Subscription check:', { userId, requiredPlan, hasAccess });
```

## Deployment

### Production Checklist
- [ ] Update environment variables with production keys
- [ ] Configure production webhook endpoints
- [ ] Set up proper error monitoring
- [ ] Test payment flows end-to-end
- [ ] Verify subscription status checks
- [ ] Configure backup webhook handlers

## Support

For billing-related issues:
1. Check Clerk Dashboard for subscription status
2. Review Stripe Dashboard for payment history
3. Monitor webhook delivery status
4. Check application logs for errors

## Future Enhancements

Consider implementing:
- Annual billing discounts
- Usage-based pricing tiers
- Team/organization billing
- Custom enterprise plans
- Proration handling for plan changes
- Billing analytics dashboard