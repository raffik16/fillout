# Clerk Metadata Configuration for Drinkjoy

This document outlines the complete Clerk user metadata structure implementation for the Drinkjoy application.

## Overview

The implementation provides a comprehensive user metadata system that stores:
- **unsafeMetadata**: User-controlled preferences (drink preferences, favorite categories, AI chat settings)
- **publicMetadata**: Subscription and account information visible to the user
- **privateMetadata**: Sensitive billing and administrative data (server-only)

## File Structure

```
/app/types/clerk-metadata.ts                    # TypeScript type definitions
/lib/clerk/
├── index.ts                                    # Main exports
├── metadata.ts                                 # Server-side metadata utilities
├── client-metadata.ts                          # Client-side metadata hooks
└── wizard-integration.ts                       # Wizard system integration

/app/components/user-profile/
├── index.ts                                    # Component exports
├── UserProfileCustomPages.tsx                  # Main profile component
├── DrinkPreferencesPage.tsx                    # Drink preferences management
├── AIChatPreferencesPage.tsx                   # AI chat configuration
└── SubscriptionPage.tsx                        # Subscription management

/app/api/
├── user/metadata/route.ts                      # Metadata CRUD API
├── wizard/
│   ├── save-preferences/route.ts               # Save wizard results
│   ├── load-preferences/route.ts               # Load previous results
│   └── suggestions/route.ts                    # Personalized suggestions
└── webhooks/clerk/route.ts                     # User creation webhook

/app/components/wizard/WizardWithMetadata.tsx   # Enhanced wizard component
```

## Metadata Structure

### Unsafe Metadata (User-Editable)
```typescript
interface ClerkUnsafeMetadata {
  drinkPreferences?: DrinkPreferences;        // Wizard results
  favoriteCategories?: FavoriteCategories;   // Usage tracking
  allergies?: AllergyType[];                  // Dietary restrictions
  aiChatPreferences?: AIChatPreferences;      // AI assistant settings
}
```

### Public Metadata (Read-Only for Users)
```typescript
interface ClerkPublicMetadata {
  subscriptionPlan?: SubscriptionPlan;       // Current subscription
  planFeatures?: PlanFeatures;               // Available features
  accountType?: AccountType;                 // Account classification
}
```

### Private Metadata (Server-Only)
```typescript
interface ClerkPrivateMetadata {
  stripeCustomerId?: string;                 // Stripe customer ID
  billingHistory?: BillingHistoryEntry[];    # Payment history
  internalNotes?: string;                    # Admin notes
  riskScore?: number;                        # Fraud detection
  lastPaymentMethod?: PaymentMethod;         # Payment info
}
```

## Key Features

### 1. Drink Preferences Management
- Complete wizard result storage in user metadata
- Automatic favorite category tracking based on selections
- Integration with existing wizard system
- Pre-population of wizard with previous results

### 2. AI Chat Customization
- Feature toggle system (recommendations, explanations, recipes, pairings)
- Conversation tone preferences (casual, professional, friendly, expert)
- Privacy controls (chat history, personalized responses)
- Real-time preview of AI response style

### 3. Subscription Management
- Plan feature enforcement based on metadata
- Usage tracking and limit visualization
- Plan comparison and upgrade flows
- Billing history and payment method management

### 4. Wizard System Integration
- Automatic saving of wizard results to metadata
- Loading previous preferences for returning users
- Personalized suggestions based on user history
- Favorite category tracking and analysis

## API Endpoints

### Metadata Management
- `PUT /api/user/metadata` - Update user metadata
- `GET /api/user/metadata` - Retrieve user metadata profile

### Wizard Integration
- `POST /api/wizard/save-preferences` - Save wizard results
- `GET /api/wizard/load-preferences` - Load previous preferences
- `GET /api/wizard/suggestions` - Get personalized suggestions

### Webhooks
- `POST /api/webhooks/clerk` - Handle user lifecycle events

## Usage Examples

### Server-Side Metadata Operations
```typescript
import { updateDrinkPreferences, getUserSubscriptionPlan } from '@/lib/clerk';

// Update user's drink preferences
const preferences = await updateDrinkPreferences(userId, {
  category: 'cocktail',
  flavor: 'crisp',
  strength: 'medium'
});

// Check subscription status
const plan = await getUserSubscriptionPlan(userId);
```

### Client-Side Hooks
```typescript
import { useDrinkPreferences, usePlanFeatures, useCanPerformAction } from '@/lib/clerk';

function MyComponent() {
  const preferences = useDrinkPreferences();
  const features = usePlanFeatures();
  const canSaveDrinks = useCanPerformAction('maxSavedDrinks', currentSavedCount);
  
  return (
    <div>
      <p>Preferred category: {preferences.category}</p>
      <p>Can save more drinks: {canSaveDrinks ? 'Yes' : 'No'}</p>
    </div>
  );
}
```

### Wizard Integration
```typescript
import { clientWizardIntegration } from '@/lib/clerk';

// Save wizard results
await clientWizardIntegration.saveWizardResults(wizardPreferences);

// Load previous results
const previous = await clientWizardIntegration.loadPreviousResults();

// Get personalized suggestions
const suggestions = await clientWizardIntegration.getPersonalizedSuggestions();
```

## Custom User Profile Pages

The implementation includes three custom pages integrated with Clerk's UserProfile component:

1. **Drink Preferences** (`/user-profile/drink-preferences`)
   - Category, flavor, strength, and occasion preferences
   - Allergy and dietary restriction management
   - Weather integration settings

2. **AI Assistant** (`/user-profile/ai-preferences`)
   - Feature toggles for AI capabilities
   - Conversation tone selection
   - Privacy and personalization controls

3. **Subscription** (`/user-profile/subscription`)
   - Current plan and usage statistics
   - Feature comparison and upgrade options
   - Billing history and payment management

## Environment Variables Required

```env
# Clerk Configuration
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
CLERK_WEBHOOK_SECRET=whsec_...

# For production, also set:
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/app
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/app
```

## Webhook Configuration

In your Clerk Dashboard:
1. Go to Webhooks section
2. Add endpoint: `https://yourdomain.com/api/webhooks/clerk`
3. Select events: `user.created`, `user.updated`, `user.deleted`
4. Copy the webhook secret to `CLERK_WEBHOOK_SECRET`

## Migration and Initialization

New users are automatically initialized with default metadata via the webhook handler. For existing users, you can run a migration script:

```typescript
import { initializeNewUserMetadata } from '@/lib/clerk/metadata';

// For each existing user
await initializeNewUserMetadata(userId);
```

## Security Considerations

1. **Metadata Access Levels**:
   - unsafeMetadata: Visible to client, user-editable
   - publicMetadata: Visible to client, read-only for users
   - privateMetadata: Server-only, never sent to client

2. **API Protection**: All metadata endpoints require authentication
3. **Webhook Security**: Signature verification using Svix
4. **Type Safety**: Comprehensive TypeScript types for all metadata

## Testing

Test the implementation by:
1. Creating a new user and verifying metadata initialization
2. Completing the wizard and checking metadata updates
3. Modifying preferences in the profile pages
4. Testing subscription plan feature enforcement
5. Verifying webhook payload handling

## Next Steps

Consider implementing:
- Real-time subscription status updates via webhooks
- Advanced analytics on user preferences
- A/B testing framework using metadata flags
- Integration with recommendation algorithms
- Email notifications for subscription changes