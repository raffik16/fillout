import { CocktailApiResponse, CocktailRecipe, ProcessedRecipe, RecipeIngredient, IngredientApiResponse } from '@/app/types/recipe';

const BASE_URL = 'https://www.thecocktaildb.com/api/json/v1/1';

export class CocktailDBService {
  // Search cocktails by name
  static async searchByName(name: string): Promise<ProcessedRecipe[]> {
    try {
      const response = await fetch(`${BASE_URL}/search.php?s=${encodeURIComponent(name)}`);
      const data: CocktailApiResponse = await response.json();
      
      if (!data.drinks) {
        return [];
      }
      
      return data.drinks.map(this.processRecipe);
    } catch (error) {
      console.error('Error searching cocktails by name:', error);
      return [];
    }
  }

  // Search cocktails by first letter
  static async searchByLetter(letter: string): Promise<ProcessedRecipe[]> {
    try {
      const response = await fetch(`${BASE_URL}/search.php?f=${letter}`);
      const data: CocktailApiResponse = await response.json();
      
      if (!data.drinks) {
        return [];
      }
      
      return data.drinks.map(this.processRecipe);
    } catch (error) {
      console.error('Error searching cocktails by letter:', error);
      return [];
    }
  }

  // Get cocktail details by ID
  static async getById(id: string): Promise<ProcessedRecipe | null> {
    try {
      const response = await fetch(`${BASE_URL}/lookup.php?i=${id}`);
      const data: CocktailApiResponse = await response.json();
      
      if (!data.drinks || data.drinks.length === 0) {
        return null;
      }
      
      return this.processRecipe(data.drinks[0]);
    } catch (error) {
      console.error('Error getting cocktail by ID:', error);
      return null;
    }
  }

  // Search ingredients
  static async searchIngredient(name: string): Promise<any[]> {
    try {
      const response = await fetch(`${BASE_URL}/search.php?i=${encodeURIComponent(name)}`);
      const data: IngredientApiResponse = await response.json();
      
      return data.ingredients || [];
    } catch (error) {
      console.error('Error searching ingredients:', error);
      return [];
    }
  }

  // Get random cocktail
  static async getRandomCocktail(): Promise<ProcessedRecipe | null> {
    try {
      const response = await fetch(`${BASE_URL}/random.php`);
      const data: CocktailApiResponse = await response.json();
      
      if (!data.drinks || data.drinks.length === 0) {
        return null;
      }
      
      return this.processRecipe(data.drinks[0]);
    } catch (error) {
      console.error('Error getting random cocktail:', error);
      return null;
    }
  }

  // Smart search - try to find cocktails that match our drink names
  static async findSimilarCocktails(drinkName: string, category?: string): Promise<ProcessedRecipe[]> {
    // Extract key words from drink name for better matching
    const searchTerms = this.extractSearchTerms(drinkName);
    const results: ProcessedRecipe[] = [];
    
    // Try direct name search first
    const directResults = await this.searchByName(drinkName);
    results.push(...directResults);
    
    // If no direct results, try searching by extracted terms
    if (results.length === 0) {
      for (const term of searchTerms) {
        if (term.length > 3) { // Only search terms longer than 3 characters
          const termResults = await this.searchByName(term);
          results.push(...termResults);
          if (results.length >= 5) break; // Limit results
        }
      }
    }
    
    // Remove duplicates and limit results
    const uniqueResults = results.filter((recipe, index, self) => 
      index === self.findIndex(r => r.id === recipe.id)
    );
    
    return uniqueResults.slice(0, 5);
  }

  // Helper method to extract search terms from drink names
  private static extractSearchTerms(drinkName: string): string[] {
    // Common drink-related words to remove
    const stopWords = ['drink', 'cocktail', 'beer', 'wine', 'spirit', 'liquor', 'bottle', 'glass'];
    
    return drinkName
      .toLowerCase()
      .split(/[\s\-_,]+/)
      .filter(term => term.length > 2 && !stopWords.includes(term))
      .slice(0, 3); // Limit to first 3 terms
  }

  // Process raw API recipe into our format
  private static processRecipe(recipe: CocktailRecipe): ProcessedRecipe {
    const ingredients: RecipeIngredient[] = [];
    
    // Extract ingredients and measurements
    for (let i = 1; i <= 15; i++) {
      const ingredient = recipe[`strIngredient${i}` as keyof CocktailRecipe] as string;
      const measure = recipe[`strMeasure${i}` as keyof CocktailRecipe] as string;
      
      if (ingredient && ingredient.trim()) {
        ingredients.push({
          name: ingredient.trim(),
          measure: measure?.trim() || undefined,
        });
      }
    }
    
    return {
      id: recipe.idDrink,
      name: recipe.strDrink,
      category: recipe.strCategory,
      alcoholic: recipe.strAlcoholic,
      glass: recipe.strGlass,
      instructions: recipe.strInstructions,
      image: recipe.strDrinkThumb,
      video: recipe.strVideo || undefined,
      tags: recipe.strTags ? recipe.strTags.split(',').map(tag => tag.trim()) : undefined,
      ingredients,
    };
  }
}