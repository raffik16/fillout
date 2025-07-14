# Popularity-Based Drink Recommendations

## Overview
The drink wizard now includes a sophisticated popularity system that tracks user preferences and boosts popular drinks in recommendations.

## How It Works

### 1. Like Tracking
- Users can like/unlike drinks in the wizard results
- Each like is stored with:
  - Anonymous session ID
  - Drink ID
  - Timestamp
  - Unique constraint prevents duplicate likes

### 2. Popularity Scoring
The matching algorithm includes a popularity bonus:
- **Max Points**: 10 points
- **Calculation**: `Math.min(10, Math.floor(likeCount / 2))`
- **Thresholds**:
  - 5+ likes: "👍 Well-liked"
  - 10+ likes: "⭐ Popular choice"
  - 20+ likes: "🔥 Crowd favorite!"

### 3. Integration with Matching Algorithm
Popular drinks get boosted in the wizard results based on:
- User preferences (flavor, strength, occasion, etc.)
- Weather conditions
- Happy hour specials
- **Popularity bonus** (new!)

### 4. Real-time Updates
- Like counts update optimistically in the UI
- Popular drinks database is queried on each recommendation
- Analytics dashboard shows real-time popularity trends

## Database Schema

```sql
-- Likes table
CREATE TABLE drink_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT NOT NULL,
  drink_id TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(session_id, drink_id)
);

-- Analytics view
CREATE VIEW popular_drinks AS
SELECT 
  drink_id,
  COUNT(*) as like_count,
  COUNT(DISTINCT session_id) as unique_users
FROM drink_likes
GROUP BY drink_id
ORDER BY like_count DESC;
```

## API Endpoints

### POST `/api/likes`
Like or unlike a drink
```json
{
  "drinkId": "moscow-mule",
  "sessionId": "user-session-id",
  "action": "like" | "unlike"
}
```

### GET `/api/likes`
Get like status for a drink
```
GET /api/likes?drinkId=moscow-mule&sessionId=user-session-id
```

### GET `/api/analytics/popular-drinks`
Get popular drinks analytics
```json
{
  "success": true,
  "data": [
    {
      "drink_id": "moscow-mule",
      "like_count": 25,
      "unique_users": 20
    }
  ]
}
```

## Components

### LikeButton
Interactive heart button with:
- Optimistic updates
- Like count display
- Session-based tracking
- Error handling

### DrinkLikeCount
Read-only like count display:
- Shows total likes
- Used in wizard results
- Lightweight component

### PopularDrinksWidget
Analytics dashboard widget:
- Top 10 popular drinks
- Like counts and user counts
- Real-time data

## Analytics Dashboard

Visit `/analytics` to view:
- Total likes across all drinks
- Active users count
- Popular drinks ranking
- System explanation

## Benefits

1. **Improved Recommendations**: Popular drinks get natural boost
2. **User Engagement**: Like feature encourages interaction
3. **Data-Driven Insights**: Analytics help understand preferences
4. **Social Proof**: Users see what others like
5. **Continuous Improvement**: System learns from user behavior

## Technical Details

- **Session Management**: Anonymous UUID-based sessions
- **Optimistic Updates**: UI updates immediately for better UX
- **Caching**: Popular drinks data cached for performance
- **Error Handling**: Graceful fallbacks for API failures
- **TypeScript**: Fully typed implementation