import { NextRequest, NextResponse } from 'next/server';
import { fetchWeatherData } from '@/lib/weather';
import { LocationQuery } from '@/app/types/weather';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const city = searchParams.get('city');
    const lat = searchParams.get('lat');
    const lon = searchParams.get('lon');

    const query: LocationQuery = {};

    if (city) {
      query.city = city;
    } else if (lat && lon) {
      query.lat = parseFloat(lat);
      query.lon = parseFloat(lon);
    } else {
      return NextResponse.json(
        { error: 'Either city or coordinates (lat, lon) must be provided' },
        { status: 400 }
      );
    }

    const weatherData = await fetchWeatherData(query);
    return NextResponse.json(weatherData);
  } catch (error) {
    console.error('Weather API error:', error);
    
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: error.message === 'Location not found' ? 404 : 500 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to fetch weather data' },
      { status: 500 }
    );
  }
}