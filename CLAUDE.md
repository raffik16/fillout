# DrinkJoy Project Context

## Project Overview
DrinkJoy is a beverage recommendation application that helps users find drinks based on their preferences and dietary restrictions.

## Complete Feature List

### Core Drink Discovery Features
- **Interactive Drink Wizard**: 5-question personality quiz with animated interface
  - Category selection (Cocktails, Beer/Cider, Wine, Spirits, Non-Alcoholic, Surprise Me, Featured)
  - Flavor preferences (Crisp, Smokey, Sweet Tooth, Bitter is Better, Sour Power, Smooth Operator)
  - Strength preferences (Balanced, Easy Going, Bring the Power)
  - Occasion matching (Happy Hour, Celebrating, Business Meeting, Romantic Dinner, Game Day, Exploring The Bar, Newly 21, Birthday)
  - Allergy filtering (Gluten, Dairy, Nuts, Eggs, Soy)
- **Smart Matching Algorithm**: Sophisticated scoring system (100 points total)
  - Flavor profile matching (25 points)
  - Strength preference (20 points)
  - Adventure level (15 points)
  - Occasion matching (15 points)
  - Temperature preference (10 points)
  - Weather alignment bonus (15 points)
  - Happy Hour boost (10 points bonus during 3-6 PM)
  - Popularity bonus (up to 10 points based on likes)

### User Experience Features
- **Swipe-Based Navigation**: Intuitive gesture controls for browsing drink matches
- **Match Reveal Animation**: Engaging visual reveal of personalized recommendations
- **Loading Animations**: Color splash and "overwhelmed" animations during processing
- **Dark Mode Support**: Automatic and manual dark theme with persistent preferences
- **PWA Support**: Progressive Web App capabilities with install prompt
- **Mobile-First Design**: Optimized for touch interactions and responsive layouts
- **Age Gate**: Responsible drinking verification system

### Personalization Features
- **Weather-Based Recommendations**: Optional location-based drink refinements
  - Temperature-based suggestions
  - Weather condition matching
  - Seasonal drink recommendations
  - 30-minute weather data caching
- **Allergy Detection System**: Comprehensive allergen filtering
  - Smart ingredient scanning for gluten, dairy, nuts, eggs, soy
  - Safety warnings and filtering
- **Session Management**: Anonymous UUID-based tracking for preferences
- **Inactivity Detection**: Smart session management with timeout handling

### Social & Engagement Features
- **Like System**: Heart button for favorite drinks
  - Real-time like counts
  - Optimistic UI updates
  - Popularity tracking
- **Order Tracking**: "Order Now" functionality
  - Order count tracking
  - User order history
- **Email Capture & Sharing**: Save and email drink matches
  - Beautiful HTML email templates
  - Personalized recommendations
- **Social Proof**: Popularity indicators (Well-liked, Popular choice, Crowd favorite)

### Data & Analytics Features
- **Analytics Dashboard** (`/analytics`):
  - Total likes, active users, popular drinks ranking
  - Total orders and order users analytics
  - Real-time statistics via Supabase
- **Popular Drinks Widget**: Top 10 drinks visualization

### Happy Hour Features
- **Time-Based Promotions**: 3-6 PM automatic activation
- **Happy Hour Indicators**: Visual badges and pricing
- **Dynamic Scoring**: 25-point bonus during happy hour
- **Featured Drinks**: Special happy hour drink highlighting

### Drink Information Features
- **Detailed Drink Cards**: ABV, ingredients, serving suggestions, glass types, preparation
- **Recipe Modal**: Detailed cocktail recipes
- **Advanced Filtering**: Category, flavor, strength, occasion, and search

### API & Backend Features
- **RESTful API Endpoints**:
  - `/api/drinks` - Drink data management
  - `/api/beers`, `/api/wines` - Category-specific endpoints
  - `/api/likes`, `/api/orders` - Interaction management
  - `/api/weather` - Weather integration
  - `/api/email/save-matches` - Email capture
  - `/api/analytics/*` - Analytics endpoints

### Database Features (Supabase)
- Like management, order tracking, email signups
- Popular drinks view, real-time subscriptions

### External Integrations
- OpenWeatherMap API for weather-based recommendations
- Resend Email Service for transactional emails
- CocktailDB Integration for extended cocktail data

### Development & Admin Features
- **Form Builder Demo** (`/form-builder-demo`): Interactive form creation tools
- Comprehensive TypeScript type system
- Utility libraries for matching algorithms, weather, sessions, allergen detection

### Performance Features
- Server-Side Rendering, code splitting, image optimization
- API caching, debounced search, weather caching (30-min)

### Accessibility Features
- WCAG 2.1 compliance, keyboard navigation
- Screen reader support, high contrast, semantic HTML

## Project Structure
- `/data/drinks/` - Contains JSON files with drink data for different categories
- `/src/` - Source code for the application
- Components include WizardFullResults, filtering systems, and recommendation logic

## Development Guidelines
- Use TypeScript for type safety
- Follow existing code patterns and conventions
- Test changes thoroughly before committing
- Consider performance when working with large drink datasets

## Testing
Run tests with: `npm test`
Run linting with: `npm run lint`
Run type checking with: `npm run typecheck`

## Recent Focus Areas
- Allergy data integration
- Strong filtering mechanisms
- Pre-fetch and "show more" functionality
- Quote updates in the UI