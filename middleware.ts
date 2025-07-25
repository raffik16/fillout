import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

const isPublicRoute = createRouteMatcher([
  '/',
  '/about',
  '/contact',
  '/privacy',
  '/terms',
  '/analytics',
  '/app',
  '/api/drinks(.*)',
  '/api/beers(.*)',
  '/api/wines(.*)',
  '/api/likes(.*)',
  '/api/orders(.*)',
  '/api/weather(.*)',
  '/api/email(.*)',
  '/api/analytics(.*)',
  '/api/webhooks(.*)',
  '/sign-in(.*)',
  '/sign-up(.*)',
]);

const isProtectedRoute = createRouteMatcher([
  '/profile',
  '/saved-drinks',
  '/preferences',
  '/dashboard',
  '/onboarding',
]);

// Premium routes require active subscription
const isPremiumRoute = createRouteMatcher([
  '/premium-recipes',
  '/advanced-analytics',
  '/custom-filters',
  '/api/ai/chat',
]);

// API routes that require usage limit checks
const isUsageLimitedRoute = createRouteMatcher([
  '/api/ai/chat',
  '/api/drinks/recommendations',
  '/api/wizard/suggestions',
]);

export default clerkMiddleware(async (auth, req) => {
  // Allow public routes
  if (isPublicRoute(req)) {
    return;
  }

  // Protect specific routes
  if (isProtectedRoute(req)) {
    auth().protect();
    
    // Handle onboarding routing logic
    const { userId } = auth();
    if (userId) {
      const user = await auth().sessionClaims;
      const pathname = req.nextUrl.pathname;
      
      // Get onboarding status from user metadata
      const onboardingProgress = user?.metadata?.onboardingProgress;
      const onboardingData = user?.metadata?.onboardingData;
      const isOnboardingComplete = onboardingProgress?.isComplete || onboardingData?.finalStepCompleted;
      
      // Redirect completed users away from onboarding
      if (pathname === '/onboarding' && isOnboardingComplete) {
        return Response.redirect(new URL('/dashboard', req.url));
      }
      
      // Redirect incomplete users to onboarding (except from onboarding page itself)
      if (pathname !== '/onboarding' && !isOnboardingComplete && pathname !== '/sign-out') {
        // Allow access to preferences and settings even without onboarding
        if (pathname !== '/preferences' && pathname !== '/profile') {
          return Response.redirect(new URL('/onboarding', req.url));
        }
      }
    }
  }

  // Check premium routes for web pages - require authentication and subscription
  if (isPremiumRoute(req) && !req.nextUrl.pathname.startsWith('/api/')) {
    auth().protect();
    
    const { userId } = auth();
    if (userId) {
      try {
        // Check if user has premium access
        const response = await fetch(`${req.nextUrl.origin}/api/billing/check-access`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ requiredPlan: 'premium' }),
        });
        
        const { hasAccess } = await response.json();
        
        if (!hasAccess) {
          const url = new URL('/pricing', req.url);
          url.searchParams.set('upgrade', 'premium');
          url.searchParams.set('feature', req.nextUrl.pathname);
          return Response.redirect(url);
        }
      } catch (error) {
        console.error('Error checking subscription access in middleware:', error);
        // Redirect to pricing on error
        const url = new URL('/pricing', req.url);
        return Response.redirect(url);
      }
    }
  }

  // API routes with usage limits are handled within the routes themselves
  // to provide better error responses and usage tracking
  if (isUsageLimitedRoute(req)) {
    // Let the API routes handle their own access control
    return;
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};