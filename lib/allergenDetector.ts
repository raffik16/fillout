export type AllergyType = 'gluten' | 'dairy' | 'nuts' | 'eggs' | 'soy' | 'none';

/**
 * Comprehensive allergen detection patterns
 * These patterns are designed to catch both obvious and subtle allergen sources
 */
const ALLERGEN_PATTERNS = {
  gluten: [
    // Primary gluten sources
    'wheat', 'barley', 'rye', 'malt', 'spelt', 'kamut',
    // Malt variants
    'malted barley', 'barley malt', 'pilsner malt', 'roasted barley',
    // Beer and grain spirits
    'beer', 'grain', 'grain neutral spirits', 'wheat neutral spirits',
    // Flour and grain products
    'flour', 'bran', 'semolina', 'bulgur',
    // Malt extracts and flavorings
    'malt extract', 'malt base', 'malt syrup'
  ],
  
  dairy: [
    // Primary dairy sources
    'milk', 'cream', 'butter', 'cheese', 'yogurt', 'dairy',
    // Cream variants
    'heavy cream', 'half-and-half', 'whipping cream', 'sour cream',
    // Specialty dairy
    'crème de cacao', 'cream liqueur', 'bailey', 'kahlua cream',
    // Dairy components
    'lactose', 'casein', 'whey', 'buttermilk',
    // Ice cream and frozen dairy
    'ice cream', 'gelato', 'frozen yogurt'
  ],
  
  nuts: [
    // Tree nuts
    'almond', 'walnut', 'pecan', 'hazelnut', 'cashew', 'pistachio',
    'brazil nut', 'macadamia', 'pine nut',
    // Coconut (technically a fruit but often grouped with nuts for allergies)
    'coconut', 'coconut cream', 'coconut milk', 'coconut water',
    // Nut-based ingredients
    'orgeat', 'orgeat syrup', 'almond syrup', 'almond extract',
    'amaretto', 'frangelico', 'nocello',
    // Peanuts (technically legumes but grouped with nuts)
    'peanut', 'peanut butter', 'peanut oil',
    // Nut oils and butters
    'almond butter', 'almond oil', 'walnut oil', 'hazelnut oil',
    // General nut terms
    'nut', 'tree nut', 'mixed nuts'
  ],
  
  eggs: [
    // Whole eggs and parts
    'egg', 'egg white', 'egg yolk', 'whole egg',
    // Egg products
    'albumin', 'meringue', 'egg wash',
    // Egg-based preparations
    'mayonnaise', 'hollandaise', 'custard',
    // Lecithin (when egg-derived)
    'egg lecithin'
  ],
  
  soy: [
    // Primary soy sources
    'soy', 'soya', 'soybean', 'edamame',
    // Soy products
    'soy sauce', 'tamari', 'miso', 'tofu', 'tempeh',
    // Soy derivatives
    'soy lecithin', 'soy protein', 'soy flour',
    'soy oil', 'soybean oil',
    // Soy-based spirits (some vodkas)
    'soy-based alcohol'
  ]
};

/**
 * Detects if a drink contains specific allergens based on its ingredients
 * @param ingredients - Array of ingredient strings from the drink
 * @param allergyType - The type of allergy to check for
 * @returns boolean indicating whether the allergen is present
 */
export function hasAllergen(ingredients: string[], allergyType: AllergyType): boolean {
  if (allergyType === 'none') {
    return false;
  }
  
  const patterns = ALLERGEN_PATTERNS[allergyType];
  if (!patterns) {
    return false;
  }
  
  return ingredients.some(ingredient => 
    patterns.some(pattern => 
      ingredient.toLowerCase().includes(pattern.toLowerCase())
    )
  );
}

/**
 * Detects all allergens present in a drink
 * @param ingredients - Array of ingredient strings from the drink
 * @returns Array of allergy types found in the drink
 */
export function detectAllAllergens(ingredients: string[]): AllergyType[] {
  const allergens: AllergyType[] = [];
  
  const allergyTypes: AllergyType[] = ['gluten', 'dairy', 'nuts', 'eggs', 'soy'];
  
  for (const allergyType of allergyTypes) {
    if (hasAllergen(ingredients, allergyType)) {
      allergens.push(allergyType);
    }
  }
  
  return allergens;
}

/**
 * Checks if a drink is safe for someone with specific allergies
 * @param ingredients - Array of ingredient strings from the drink
 * @param userAllergies - Array of user's allergies
 * @returns boolean indicating whether the drink is safe
 */
export function isSafeForAllergies(ingredients: string[], userAllergies: AllergyType[]): boolean {
  // If user has no allergies or only 'none', all drinks are safe
  if (!userAllergies || userAllergies.length === 0 || 
      (userAllergies.length === 1 && userAllergies[0] === 'none')) {
    return true;
  }
  
  // Check if drink contains any of the user's allergens
  return !userAllergies.some(allergy => 
    allergy !== 'none' && hasAllergen(ingredients, allergy)
  );
}

/**
 * Gets a user-friendly description of why a drink is unsafe
 * @param ingredients - Array of ingredient strings from the drink
 * @param userAllergies - Array of user's allergies
 * @returns Array of allergen warnings
 */
export function getAllergenWarnings(ingredients: string[], userAllergies: AllergyType[]): string[] {
  const warnings: string[] = [];
  
  if (!userAllergies || userAllergies.length === 0) {
    return warnings;
  }
  
  const allergenLabels = {
    gluten: 'Contains gluten',
    dairy: 'Contains dairy',
    nuts: 'Contains nuts',
    eggs: 'Contains eggs',
    soy: 'Contains soy'
  };
  
  for (const allergy of userAllergies) {
    if (allergy !== 'none' && hasAllergen(ingredients, allergy)) {
      warnings.push(allergenLabels[allergy]);
    }
  }
  
  return warnings;
}