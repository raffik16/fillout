import { WeatherData, LocationQuery } from '@/app/types/weather';
import { fetchWeatherData, getUserLocation } from '@/lib/weather';

interface CachedWeatherData {
  data: WeatherData;
  timestamp: number;
  location: {
    name: string;
    lat: number;
    lon: number;
  };
}

interface LocationPermissionState {
  granted: boolean;
  timestamp: number;
}

class WeatherService {
  private weatherCache: CachedWeatherData | null = null;
  private readonly CACHE_EXPIRY_MS = 30 * 60 * 1000; // 30 minutes
  private readonly PERMISSION_CACHE_KEY = 'locationPermissionState';
  private readonly WEATHER_CACHE_KEY = 'lastWeatherData';
  private readonly LOCATION_CACHE_KEY = 'lastLocation';

  constructor() {
    // Only load cache on client side
    if (typeof window !== 'undefined') {
      this.loadCacheFromStorage();
    }
  }

  /**
   * Get weather data with cache-first approach
   * Order: If query provided → API call, else Memory cache → localStorage → API call
   */
  async getWeatherData(query?: LocationQuery): Promise<WeatherData> {
    console.log('WeatherService: Getting weather data', { query, hasCache: !!this.weatherCache });

    // 1. If we have a specific query, use it directly (override cache)
    if (query) {
      console.log('🌍 LOCATION FRESH: Fetching weather with provided query (overriding cache)', { query });
      return this.fetchAndCacheWeather(query);
    }

    // 2. Check memory cache 
    if (this.weatherCache && this.isCacheValid(this.weatherCache.timestamp)) {
      console.log('🔄 LOCATION SHARED: Using cached weather data from memory', {
        location: this.weatherCache.location.name,
        cachedAt: new Date(this.weatherCache.timestamp).toLocaleTimeString(),
        source: 'memory_cache'
      });
      return this.weatherCache.data;
    }

    // 3. Try to load from localStorage
    if (this.loadCacheFromStorage()) {
      console.log('🔄 LOCATION SHARED: Using cached weather data from localStorage', {
        location: this.weatherCache!.location.name,
        cachedAt: new Date(this.weatherCache!.timestamp).toLocaleTimeString(),
        source: 'localStorage_cache'
      });
      return this.weatherCache!.data;
    }

    // 4. Try to use cached location for fresh weather data
    const cachedLocation = this.getCachedLocation();
    if (cachedLocation) {
      console.log('🔄 LOCATION SHARED: Using cached coordinates for fresh weather', {
        location: cachedLocation.name,
        coordinates: `${cachedLocation.lat}, ${cachedLocation.lon}`,
        source: 'cached_coordinates'
      });
      return this.fetchAndCacheWeather({ 
        lat: cachedLocation.lat, 
        lon: cachedLocation.lon 
      });
    }

    // 5. Last resort: try geolocation
    console.log('📍 LOCATION REQUEST: Attempting fresh geolocation');
    return this.fetchWithGeolocation();
  }

  /**
   * Get cached weather data without making API calls
   */
  getCachedWeatherData(): WeatherData | null {
    if (this.weatherCache && this.isCacheValid(this.weatherCache.timestamp)) {
      return this.weatherCache.data;
    }

    if (this.loadCacheFromStorage()) {
      return this.weatherCache!.data;
    }

    return null;
  }

  /**
   * Check if we have a cached location (regardless of weather data age)
   */
  hasCachedLocation(): boolean {
    return !!this.getCachedLocation();
  }

  /**
   * Get cached location information
   */
  getCachedLocation(): { name: string; lat: number; lon: number } | null {
    // First check memory cache
    if (this.weatherCache) {
      return this.weatherCache.location;
    }

    // Then check localStorage (only on client side)
    if (typeof window === 'undefined') return null;
    
    try {
      const savedLocation = localStorage.getItem(this.LOCATION_CACHE_KEY);
      const savedWeatherData = localStorage.getItem(this.WEATHER_CACHE_KEY);
      
      if (savedWeatherData) {
        const parsedWeatherData = JSON.parse(savedWeatherData);
        if (parsedWeatherData.location) {
          return {
            name: parsedWeatherData.location.name,
            lat: parsedWeatherData.location.lat,
            lon: parsedWeatherData.location.lon
          };
        }
      }

      if (savedLocation) {
        // We have a location name but no coordinates - less useful but something
        return null; // Return null since we need coordinates for weather API
      }
    } catch (error) {
      console.error('Error reading cached location:', error);
    }

    return null;
  }

  /**
   * Check if location permission has been granted before
   */
  hasLocationPermission(): boolean {
    if (typeof window === 'undefined') return false;
    
    try {
      const permissionState = localStorage.getItem(this.PERMISSION_CACHE_KEY);
      if (permissionState) {
        const parsed: LocationPermissionState = JSON.parse(permissionState);
        // Permission cache valid for 24 hours
        const permissionCacheExpiry = 24 * 60 * 60 * 1000;
        return parsed.granted && (Date.now() - parsed.timestamp) < permissionCacheExpiry;
      }
    } catch (error) {
      console.error('Error reading location permission state:', error);
    }
    return false;
  }

  /**
   * Force refresh weather data
   */
  async refreshWeatherData(query?: LocationQuery): Promise<WeatherData> {
    console.log('🔄 LOCATION REFRESH: Force refreshing weather data');
    
    if (query) {
      console.log('🌍 LOCATION FRESH: Using provided query for refresh', { query });
      return this.fetchAndCacheWeather(query);
    }

    const cachedLocation = this.getCachedLocation();
    if (cachedLocation) {
      console.log('🔄 LOCATION SHARED: Using cached coordinates for refresh', {
        location: cachedLocation.name,
        coordinates: `${cachedLocation.lat}, ${cachedLocation.lon}`
      });
      return this.fetchAndCacheWeather({ 
        lat: cachedLocation.lat, 
        lon: cachedLocation.lon 
      });
    }

    console.log('📍 LOCATION REQUEST: No cached location, requesting fresh geolocation for refresh');
    return this.fetchWithGeolocation();
  }

  /**
   * Clear all cached data
   */
  clearCache(): void {
    console.log('WeatherService: Clearing cache');
    this.weatherCache = null;
    
    if (typeof window !== 'undefined') {
      localStorage.removeItem(this.WEATHER_CACHE_KEY);
      localStorage.removeItem(this.LOCATION_CACHE_KEY);
      localStorage.removeItem(this.PERMISSION_CACHE_KEY);
    }
  }

  /**
   * Private method to fetch weather and cache it
   */
  private async fetchAndCacheWeather(query: LocationQuery): Promise<WeatherData> {
    try {
      console.log('🌐 API CALL: Fetching weather data from API', { query });
      const weatherData = await fetchWeatherData(query);
      
      // Create cache entry
      this.weatherCache = {
        data: weatherData,
        timestamp: Date.now(),
        location: {
          name: weatherData.location.name,
          lat: weatherData.location.lat,
          lon: weatherData.location.lon
        }
      };

      // Save to localStorage
      this.saveCacheToStorage();

      console.log('💾 LOCATION CACHED: Weather data fetched and cached successfully', {
        location: weatherData.location.name,
        coordinates: `${weatherData.location.lat}, ${weatherData.location.lon}`,
        temperature: `${weatherData.current.temp}°C`,
        cachedAt: new Date().toLocaleTimeString()
      });
      
      return weatherData;
    } catch (error) {
      console.error('❌ API ERROR: Failed to fetch weather data:', error);
      throw error;
    }
  }

  /**
   * Private method to fetch using geolocation
   */
  private async fetchWithGeolocation(): Promise<WeatherData> {
    try {
      console.log('📍 LOCATION REQUEST: Requesting device location permission...');
      const coords = await getUserLocation();
      
      console.log('✅ LOCATION GRANTED: Permission granted, coordinates received', {
        lat: coords.lat,
        lon: coords.lon,
        source: 'geolocation_api'
      });
      
      // Cache permission success
      this.cacheLocationPermission(true);
      
      return this.fetchAndCacheWeather({ lat: coords.lat, lon: coords.lon });
    } catch (error) {
      console.log('❌ LOCATION DENIED: Permission denied or failed', { error: error instanceof Error ? error.message : 'Unknown error' });
      
      // Cache permission failure
      this.cacheLocationPermission(false);
      throw error;
    }
  }

  /**
   * Private method to check if cache is valid
   */
  private isCacheValid(timestamp: number): boolean {
    return (Date.now() - timestamp) < this.CACHE_EXPIRY_MS;
  }

  /**
   * Private method to load cache from localStorage
   */
  private loadCacheFromStorage(): boolean {
    if (typeof window === 'undefined') return false;
    
    try {
      const savedWeatherData = localStorage.getItem(this.WEATHER_CACHE_KEY);
      if (savedWeatherData) {
        const parsedData = JSON.parse(savedWeatherData);
        
        // Check if it's in the new format with timestamp
        if (parsedData.timestamp && parsedData.data) {
          this.weatherCache = parsedData;
          return this.isCacheValid(parsedData.timestamp);
        } else {
          // Handle old format - treat as expired
          console.log('WeatherService: Old cache format detected, clearing');
          localStorage.removeItem(this.WEATHER_CACHE_KEY);
        }
      }
    } catch (error) {
      console.error('WeatherService: Error loading cache from storage:', error);
      localStorage.removeItem(this.WEATHER_CACHE_KEY);
    }

    return false;
  }

  /**
   * Private method to save cache to localStorage
   */
  private saveCacheToStorage(): void {
    if (typeof window === 'undefined' || !this.weatherCache) return;
    
    try {
      localStorage.setItem(this.WEATHER_CACHE_KEY, JSON.stringify(this.weatherCache));
      localStorage.setItem(this.LOCATION_CACHE_KEY, this.weatherCache.location.name);
    } catch (error) {
      console.error('WeatherService: Error saving cache to storage:', error);
    }
  }

  /**
   * Private method to cache location permission state
   */
  private cacheLocationPermission(granted: boolean): void {
    if (typeof window === 'undefined') return;
    
    try {
      const permissionState: LocationPermissionState = {
        granted,
        timestamp: Date.now()
      };
      localStorage.setItem(this.PERMISSION_CACHE_KEY, JSON.stringify(permissionState));
    } catch (error) {
      console.error('WeatherService: Error caching permission state:', error);
    }
  }
}

// Export singleton instance
export const weatherService = new WeatherService();
export default weatherService;