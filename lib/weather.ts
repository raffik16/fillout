import axios from 'axios';
import { WeatherData, WeatherAPIResponse, LocationQuery } from '@/app/types/weather';

const API_KEY = process.env.NEXT_PUBLIC_WEATHER_API_KEY;
const BASE_URL = 'https://api.openweathermap.org/data/2.5/weather';

export async function fetchWeatherData(query: LocationQuery): Promise<WeatherData> {
  if (!API_KEY) {
    throw new Error('Weather API key is not configured');
  }

  const params: Record<string, string> = {
    appid: API_KEY,
    units: 'metric',
  };

  if (query.city) {
    params.q = query.city;
  } else if (query.lat && query.lon) {
    params.lat = query.lat.toString();
    params.lon = query.lon.toString();
  } else {
    throw new Error('Either city or coordinates must be provided');
  }

  try {
    const response = await axios.get<WeatherAPIResponse>(BASE_URL, { params });
    return transformWeatherData(response.data);
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 404) {
        throw new Error('Location not found');
      }
      throw new Error('Failed to fetch weather data');
    }
    throw error;
  }
}

function transformWeatherData(data: WeatherAPIResponse): WeatherData {
  return {
    location: {
      name: data.name,
      country: data.sys.country,
      lat: data.coord.lat,
      lon: data.coord.lon,
    },
    current: {
      temp: Math.round(data.main.temp),
      feels_like: Math.round(data.main.feels_like),
      temp_min: Math.round(data.main.temp_min),
      temp_max: Math.round(data.main.temp_max),
      humidity: data.main.humidity,
      description: data.weather[0].description,
      icon: data.weather[0].icon,
      main: data.weather[0].main.toLowerCase(),
    },
    timestamp: data.dt * 1000,
  };
}

export async function getUserLocation(): Promise<{ lat: number; lon: number }> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by your browser'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lon: position.coords.longitude,
        });
      },
      () => {
        reject(new Error('Unable to retrieve your location'));
      }
    );
  });
}