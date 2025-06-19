import { BeerData, ProcessedBeer, WineData, ProcessedWine } from '@/app/types/recipe';

const BEER_BASE_URL = '/api/beers';
const WINE_BASE_URL = '/api/wines';

export class BeerWineService {
  // Beer methods
  static async getBeersByType(type: 'ale' | 'stouts' | 'red-ale' = 'ale'): Promise<ProcessedBeer[]> {
    try {
      const response = await fetch(`${BEER_BASE_URL}?type=${type}`);
      
      if (!response.ok) {
        console.error(`Beer API error: ${response.status} ${response.statusText}`);
        return [];
      }
      
      const result = await response.json();
      const data = result.beers || [];
      
      // Ensure we have valid data
      if (!Array.isArray(data) || data.length === 0) {
        console.log('No beers found');
        return [];
      }
      
      try {
        return data.map((beer: BeerData) => this.processBeer(beer, type));
      } catch (mapError) {
        console.error('Error mapping beer data:', mapError);
        return [];
      }
    } catch (error) {
      console.error('Error fetching beers:', error);
      return [];
    }
  }

  static async searchBeers(name: string): Promise<ProcessedBeer[]> {
    try {
      // Use search parameter if name is provided
      const searchParam = name && name.trim() ? `&search=${encodeURIComponent(name)}` : '';
      const response = await fetch(`${BEER_BASE_URL}?type=ale${searchParam}`);
      
      if (!response.ok) {
        console.error(`Beer search error: ${response.status}`);
        return [];
      }
      
      const result = await response.json();
      const data = result.beers || [];
      
      return data.map((beer: BeerData) => this.processBeer(beer, 'ale'));
    } catch (error) {
      console.error('Error searching beers:', error);
      return [];
    }
  }

  static async getRandomBeer(): Promise<ProcessedBeer | null> {
    const types: Array<'ale' | 'stouts' | 'red-ale'> = ['ale', 'stouts', 'red-ale'];
    const randomType = types[Math.floor(Math.random() * types.length)];
    
    try {
      const beers = await this.getBeersByType(randomType);
      if (beers.length === 0) return null;
      
      return beers[Math.floor(Math.random() * beers.length)];
    } catch (error) {
      console.error('Error getting random beer:', error);
      return null;
    }
  }

  // Wine methods
  static async getWinesByType(type: 'reds' | 'whites' | 'sparkling' | 'rose' | 'dessert' | 'port' = 'reds'): Promise<ProcessedWine[]> {
    try {
      const response = await fetch(`${WINE_BASE_URL}?type=${type}`);
      
      if (!response.ok) {
        console.error(`Wine API error: ${response.status} ${response.statusText}`);
        return [];
      }
      
      const result = await response.json();
      const data = result.wines || [];
      
      // Ensure we have valid data
      if (!Array.isArray(data) || data.length === 0) {
        console.log('No wines found');
        return [];
      }
      
      return data.map((wine: WineData) => this.processWine(wine, type));
    } catch (error) {
      console.error('Error fetching wines:', error);
      return [];
    }
  }

  static async searchWines(name: string): Promise<ProcessedWine[]> {
    try {
      // Use search parameter if name is provided
      const searchParam = name && name.trim() ? `&search=${encodeURIComponent(name)}` : '';
      const response = await fetch(`${WINE_BASE_URL}?type=reds${searchParam}`);
      
      if (!response.ok) {
        console.error(`Wine search error: ${response.status}`);
        return [];
      }
      
      const result = await response.json();
      const data = result.wines || [];
      
      return data.map((wine: WineData) => this.processWine(wine, 'reds'));
    } catch (error) {
      console.error('Error searching wines:', error);
      return [];
    }
  }

  static async getRandomWine(): Promise<ProcessedWine | null> {
    const types: Array<'reds' | 'whites' | 'sparkling' | 'rose' | 'dessert' | 'port'> = 
      ['reds', 'whites', 'sparkling', 'rose', 'dessert', 'port'];
    const randomType = types[Math.floor(Math.random() * types.length)];
    
    try {
      const wines = await this.getWinesByType(randomType);
      if (wines.length === 0) return null;
      
      return wines[Math.floor(Math.random() * wines.length)];
    } catch (error) {
      console.error('Error getting random wine:', error);
      return null;
    }
  }

  // Smart search based on drink category
  static async findSimilarDrinks(drinkName: string, category: string): Promise<ProcessedBeer[] | ProcessedWine[]> {
    try {
      if (category === 'beer') {
        // Try to determine beer type from name
        if (drinkName.toLowerCase().includes('stout')) {
          return await this.getBeersByType('stouts');
        } else if (drinkName.toLowerCase().includes('red')) {
          return await this.getBeersByType('red-ale');
        } else {
          // Search all types or get default
          const results = await this.searchBeers(drinkName);
          if (results.length === 0) {
            // If no results, get some default beers
            return await this.getBeersByType('ale');
          }
          return results;
        }
      } else if (category === 'wine') {
        // Try to determine wine type from name
        if (drinkName.toLowerCase().includes('red') || drinkName.toLowerCase().includes('cabernet') || drinkName.toLowerCase().includes('merlot')) {
          return await this.getWinesByType('reds');
        } else if (drinkName.toLowerCase().includes('white') || drinkName.toLowerCase().includes('chardonnay') || drinkName.toLowerCase().includes('sauvignon')) {
          return await this.getWinesByType('whites');
        } else if (drinkName.toLowerCase().includes('sparkling') || drinkName.toLowerCase().includes('champagne')) {
          return await this.getWinesByType('sparkling');
        } else {
          // Search all types or get default
          const results = await this.searchWines(drinkName);
          if (results.length === 0) {
            // If no results, get some default wines
            return await this.getWinesByType('reds');
          }
          return results;
        }
      }
    } catch (error) {
      console.error('Error in findSimilarDrinks:', error);
    }
    
    return [];
  }

  // Process beer data
  private static processBeer(beer: BeerData, type: 'ale' | 'stouts' | 'red-ale'): ProcessedBeer {
    return {
      id: beer.id.toString(),
      name: beer.name,
      price: beer.price,
      image: beer.image || 'https://images.unsplash.com/photo-1608270586620-248524c67de9?w=400', // Default beer image
      rating: beer.rating?.average,
      reviews: beer.rating?.reviews,
      type: type === 'stouts' ? 'stout' : type,
      description: this.generateBeerDescription(beer.name, type),
    };
  }

  // Process wine data
  private static processWine(wine: WineData, type: string): ProcessedWine {
    return {
      id: wine.id.toString(),
      name: wine.wine,
      winery: wine.winery,
      image: wine.image || 'https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?w=400', // Default wine image
      location: wine.location,
      rating: wine.rating ? parseFloat(wine.rating.average) : undefined,
      reviews: wine.rating ? parseInt(wine.rating.reviews.replace(/[^0-9]/g, '')) : undefined,
      type: type as 'reds' | 'whites' | 'sparkling' | 'rose' | 'dessert' | 'port',
      description: this.generateWineDescription(wine.wine, wine.winery, type),
    };
  }

  // Generate descriptions
  private static generateBeerDescription(name: string, type: string): string {
    const descriptions = {
      ale: 'A classic ale with balanced hop and malt flavors, perfect for any occasion.',
      stout: 'A rich, dark stout with notes of coffee and chocolate, ideal for cold evenings.',
      'red-ale': 'A smooth red ale with caramel undertones and a slightly hoppy finish.',
    };
    
    return descriptions[type as keyof typeof descriptions] || `A quality ${type} beer with distinctive character.`;
  }

  private static generateWineDescription(name: string, winery: string, type: string): string {
    const descriptions = {
      reds: 'A bold red wine with rich tannins and complex fruit flavors.',
      whites: 'A crisp white wine with refreshing acidity and delicate floral notes.',
      sparkling: 'An effervescent sparkling wine perfect for celebrations.',
      rose: 'A delicate rosé with subtle fruit flavors and beautiful color.',
      dessert: 'A sweet dessert wine to complement your favorite treats.',
      port: 'A fortified port wine with intense flavors and smooth finish.',
    };
    
    return descriptions[type as keyof typeof descriptions] || `An excellent ${type} wine from ${winery}.`;
  }
}