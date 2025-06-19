export interface CocktailRecipe {
  idDrink: string;
  strDrink: string;
  strDrinkAlternate?: string;
  strTags?: string;
  strVideo?: string;
  strCategory: string;
  strIBA?: string;
  strAlcoholic: string;
  strGlass: string;
  strInstructions: string;
  strInstructionsES?: string;
  strInstructionsDE?: string;
  strInstructionsFR?: string;
  strInstructionsIT?: string;
  strDrinkThumb: string;
  strIngredient1?: string;
  strIngredient2?: string;
  strIngredient3?: string;
  strIngredient4?: string;
  strIngredient5?: string;
  strIngredient6?: string;
  strIngredient7?: string;
  strIngredient8?: string;
  strIngredient9?: string;
  strIngredient10?: string;
  strIngredient11?: string;
  strIngredient12?: string;
  strIngredient13?: string;
  strIngredient14?: string;
  strIngredient15?: string;
  strMeasure1?: string;
  strMeasure2?: string;
  strMeasure3?: string;
  strMeasure4?: string;
  strMeasure5?: string;
  strMeasure6?: string;
  strMeasure7?: string;
  strMeasure8?: string;
  strMeasure9?: string;
  strMeasure10?: string;
  strMeasure11?: string;
  strMeasure12?: string;
  strMeasure13?: string;
  strMeasure14?: string;
  strMeasure15?: string;
  strImageSource?: string;
  strImageAttribution?: string;
  strCreativeCommonsConfirmed?: string;
  dateModified?: string;
}

export interface CocktailApiResponse {
  drinks: CocktailRecipe[] | null;
}

export interface ProcessedRecipe {
  id: string;
  name: string;
  category: string;
  alcoholic: string;
  glass: string;
  instructions: string;
  image: string;
  video?: string;
  tags?: string[];
  ingredients: RecipeIngredient[];
}

export interface RecipeIngredient {
  name: string;
  measure?: string;
  isOptional?: boolean;
}

export interface IngredientDetails {
  idIngredient: string;
  strIngredient: string;
  strDescription?: string;
  strType?: string;
  strABV?: string;
}

export interface IngredientApiResponse {
  ingredients: IngredientDetails[] | null;
}

// Beer API Types
export interface BeerData {
  id: number;
  name: string;
  price: string;
  image: string;
  rating?: {
    average: number;
    reviews: number;
  };
}

export interface ProcessedBeer {
  id: string;
  name: string;
  price: string;
  image: string;
  rating?: number;
  reviews?: number;
  type: 'ale' | 'stout' | 'red-ale';
  description?: string;
}

// Wine API Types
export interface WineData {
  id: number;
  wine: string;
  winery: string;
  image: string;
  location?: string;
  rating?: {
    average: string;
    reviews: string;
  };
}

export interface ProcessedWine {
  id: string;
  name: string;
  winery: string;
  image: string;
  location?: string;
  rating?: number;
  reviews?: number;
  type: 'reds' | 'whites' | 'sparkling' | 'rose' | 'dessert' | 'port';
  description?: string;
}

// Unified drink info type for modal
export interface UnifiedDrinkInfo {
  type: 'cocktail' | 'beer' | 'wine';
  data: ProcessedRecipe | ProcessedBeer | ProcessedWine;
}