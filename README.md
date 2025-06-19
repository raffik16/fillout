# ThePerfectDrink 🍻⛅

A modern, intuitive web application that recommends beers, wines, cocktails, hard liquors, and other bar drinks based on real-time weather data and user preferences.

## Features

- **drinks made easy everytime**: Uses real-time weather data to suggest the perfect drink
- **Smart Filtering**: Filter drinks by category, flavor profile, strength, and occasion
- **Location Search**: Enter any city or use geolocation for weather data
- **Comprehensive Database**: 15+ carefully curated drinks with detailed information
- **Fashion-Forward Design**: Modern UI with glassmorphism effects and smooth animations
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile devices
- **Dark Mode Support**: Automatic dark mode based on system preferences

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **Frontend**: React 19, TypeScript
- **Styling**: Tailwind CSS 4
- **Animations**: Framer Motion
- **API**: OpenWeatherMap for weather data
- **Icons**: React Icons
- **HTTP Client**: Axios

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- OpenWeatherMap API key (free tier available)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd theperfectdrink
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

4. Add your OpenWeatherMap API key to `.env.local`:
```env
NEXT_PUBLIC_WEATHER_API_KEY=your_api_key_here
```

5. Run the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## API Setup

### OpenWeatherMap API

1. Sign up at [OpenWeatherMap](https://openweathermap.org/api)
2. Get your free API key
3. Add it to your `.env.local` file
4. Free tier includes 1,000 calls/day

## Project Structure

```
app/
├── api/                     # API routes
│   ├── weather/            # Weather data endpoints
│   └── drinks/             # Drinks data endpoints
├── components/             # React components
│   ├── ui/                 # Reusable UI components
│   ├── weather/            # Weather-related components
│   ├── drinks/             # Drink-related components
│   └── layout/             # Layout components
├── types/                  # TypeScript type definitions
│   ├── weather.ts          # Weather data types
│   └── drinks.ts           # Drink data types
└── lib/                    # Utility functions
    ├── weather.ts          # Weather API integration
    ├── drinks.ts           # Drink recommendation logic
    └── utils.ts            # Helper functions
data/
└── drinks.json             # Drink database
```

## Recommendation Algorithm

The app uses a sophisticated scoring system to recommend drinks based on:

1. **Temperature Matching** (40 points max)
   - Perfect temperature range match
   - Ideal temperature proximity

2. **Weather Condition Matching** (30 points max)
   - Direct condition matches (rain, snow, clear, etc.)
   - Similar condition patterns

3. **Time of Day Bonus** (15 points max)
   - Morning: Light drinks, coffee-based
   - Afternoon: Refreshing, light to medium
   - Evening: Medium to strong, wine, cocktails
   - Night: Strong spirits, cocktails

4. **Temperature Category Bonus** (15 points max)
   - Hot: Refreshing, light drinks
   - Warm: Medium strength, refreshing
   - Cool: Medium strength, wine
   - Cold: Strong spirits, warming drinks

## Customization

### Adding New Drinks

Edit `data/drinks.json` to add new drinks. Each drink should include:

```json
{
  "id": "unique-id",
  "name": "Drink Name",
  "category": "beer|wine|cocktail|spirit|non-alcoholic",
  "description": "Brief description",
  "ingredients": ["ingredient1", "ingredient2"],
  "abv": 12,
  "flavor_profile": ["sweet", "bitter", "sour"],
  "strength": "light|medium|strong|non-alcoholic",
  "weather_match": {
    "temp_min": 10,
    "temp_max": 25,
    "conditions": ["clear", "clouds"],
    "ideal_temp": 18
  },
  "occasions": ["casual", "party"],
  "serving_suggestions": ["Serve chilled"],
  "image_url": "https://example.com/image.jpg",
  "glass_type": "Wine glass",
  "preparation": "Instructions"
}
```

### Theming

Customize colors and styling in:
- `app/globals.css` - Global styles and CSS variables
- Tailwind classes throughout components
- Color schemes in individual components

## Performance

- **Server-Side Rendering**: Fast initial page loads
- **Code Splitting**: Automatic code splitting with Next.js
- **Image Optimization**: Next.js Image component with lazy loading
- **API Caching**: Efficient caching for weather and drink data
- **Debounced Search**: Optimized search input handling

## Accessibility

- WCAG 2.1 compliant design
- Keyboard navigation support
- Screen reader friendly
- High contrast ratios
- Semantic HTML structure

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit changes: `git commit -am 'Add feature'`
4. Push to branch: `git push origin feature-name`
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Disclaimer

Please drink responsibly. This app is for entertainment purposes. Always follow local laws regarding alcohol consumption and never drink and drive.
