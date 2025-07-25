import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { WebhookEvent } from '@/app/types/billing';

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const headersList = await headers();
    const signature = headersList.get('clerk-webhook-signature');
    
    if (!signature) {
      console.error('Missing webhook signature');
      return NextResponse.json(
        { error: 'Missing webhook signature' },
        { status: 400 }
      );
    }

    // Verify webhook signature
    const webhookSecret = process.env.CLERK_BILLING_WEBHOOK_SECRET;
    if (!webhookSecret) {
      console.error('Missing webhook secret');
      return NextResponse.json(
        { error: 'Webhook secret not configured' },
        { status: 500 }
      );
    }

    // In a real implementation, you would verify the webhook signature here
    // using Clerk's webhook verification utilities
    
    const event: WebhookEvent = JSON.parse(body);
    
    switch (event.type) {
      case 'billing.subscription.created':
        await handleSubscriptionCreated(event);
        break;
      
      case 'billing.subscription.updated':
        await handleSubscriptionUpdated(event);
        break;
      
      case 'billing.subscription.deleted':
        await handleSubscriptionDeleted(event);
        break;
      
      case 'billing.payment.succeeded':
        await handlePaymentSucceeded(event);
        break;
      
      case 'billing.payment.failed':
        await handlePaymentFailed(event);
        break;
      
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }
    
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}

async function handleSubscriptionCreated(event: WebhookEvent) {
  console.log('Subscription created:', event.data);
  
  // Update user subscription status in your database
  // Send welcome email
  // Grant access to premium features
  
  try {
    // Example: Update user subscription in database
    // await updateUserSubscription(event.data.object.user_id, {
    //   status: 'active',
    //   plan: event.data.object.plan,
    //   priceId: event.data.object.price_id,
    // });
    
    console.log('Successfully handled subscription created');
  } catch (error) {
    console.error('Error handling subscription created:', error);
  }
}

async function handleSubscriptionUpdated(event: WebhookEvent) {
  console.log('Subscription updated:', event.data);
  
  // Update subscription status
  // Handle plan changes
  // Update feature access
  
  try {
    // Example: Update user subscription in database
    // await updateUserSubscription(event.data.object.user_id, {
    //   status: event.data.object.status,
    //   plan: event.data.object.plan,
    //   cancelAtPeriodEnd: event.data.object.cancel_at_period_end,
    // });
    
    console.log('Successfully handled subscription updated');
  } catch (error) {
    console.error('Error handling subscription updated:', error);
  }
}

async function handleSubscriptionDeleted(event: WebhookEvent) {
  console.log('Subscription deleted:', event.data);
  
  // Revoke premium access
  // Send cancellation email
  // Clean up user data if needed
  
  try {
    // Example: Update user subscription in database
    // await updateUserSubscription(event.data.object.user_id, {
    //   status: 'canceled',
    //   canceledAt: new Date(),
    // });
    
    console.log('Successfully handled subscription deleted');
  } catch (error) {
    console.error('Error handling subscription deleted:', error);
  }
}

async function handlePaymentSucceeded(event: WebhookEvent) {
  console.log('Payment succeeded:', event.data);
  
  // Record successful payment
  // Send payment confirmation
  // Ensure access is granted
  
  try {
    // Example: Record payment in database
    // await recordPayment(event.data.object);
    
    console.log('Successfully handled payment succeeded');
  } catch (error) {
    console.error('Error handling payment succeeded:', error);
  }
}

async function handlePaymentFailed(event: WebhookEvent) {
  console.log('Payment failed:', event.data);
  
  // Send payment failure notification
  // Update subscription status if needed
  // Implement retry logic
  
  try {
    // Example: Handle payment failure
    // await handlePaymentFailure(event.data.object);
    
    console.log('Successfully handled payment failed');
  } catch (error) {
    console.error('Error handling payment failed:', error);
  }
}