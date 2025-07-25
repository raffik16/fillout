// Specialized Carla Joy AI Agent
// Provides expert drink recommendations with deep knowledge of the drinks database

interface DrinkPreferences {
  category?: string;
  flavor?: string;
  strength?: string;
  occasion?: string;
  allergies?: string[];
}

interface ConversationState {
  preferences: Partial<DrinkPreferences>;
  missingInfo: string[];
  conversationContext: string[];
  hasShownInitialGreeting: boolean;
}

interface CarlaJoyResponse {
  message: string;
  quickButtons?: string[];
  preferences?: DrinkPreferences;
  confidence?: number;
  ready: boolean;
  expertAdvice?: string;
}

interface DrinkItem {
  id: string;
  name: string;
  category: string;
  description: string;
  ingredients: string[];
  abv?: number;
  flavor_profile?: string[];
  strength?: string;
  occasions?: string[];
  allergens?: string[];
}

export class CarlaJoyAgent {
  private drinks: DrinkItem[];
  private conversationState: ConversationState;

  constructor(drinks: DrinkItem[]) {
    this.drinks = drinks;
    this.conversationState = {
      preferences: {},
      missingInfo: ['category', 'flavor', 'strength', 'occasion', 'allergies'],
      conversationContext: [],
      hasShownInitialGreeting: false
    };
  }

  // Deep understanding of drink categories and their characteristics
  private getDrinkCategoryKnowledge() {
    return {
      beer: {
        description: "Fermented grain beverages with hops",
        commonFlavors: ["bitter", "crisp", "smooth"],
        allergens: ["gluten"],
        alternatives: {
          "gluten-free": ["wine", "cocktail", "non-alcoholic"],
          "light": ["wine", "cocktail"]
        },
        limitations: {
          glutenFree: "Most beers contain gluten from barley or wheat. We don't have gluten-free beer options, but I can suggest wine, cocktails, or non-alcoholic alternatives."
        }
      },
      cocktail: {
        description: "Mixed drinks combining spirits with mixers",
        commonFlavors: ["sweet", "sour", "bitter", "crisp"],
        flexibility: "highly customizable",
        allergens: ["dairy", "eggs"],
        alternatives: {
          "dairy-free": "Most cocktails can be made dairy-free",
          "low-alcohol": "Can be made with less spirit or wine-based"
        }
      },
      wine: {
        description: "Fermented grape beverages",
        commonFlavors: ["sweet", "sour", "crisp", "smooth"],
        allergens: ["sulfites"],
        naturallyGlutenFree: true,
        varieties: ["red", "white", "sparkling", "rosé"]
      },
      spirit: {
        description: "Distilled alcoholic beverages",
        commonFlavors: ["smooth", "smoky", "crisp"],
        highAlcohol: true,
        categories: ["whiskey", "vodka", "gin", "rum", "tequila"]
      },
      "non-alcoholic": {
        description: "Alcohol-free beverages",
        commonFlavors: ["sweet", "sour", "crisp"],
        allergens: [],
        benefits: "Great for designated drivers and those avoiding alcohol"
      }
    };
  }

  // Intelligent conversation flow management
  public processMessage(message: string, conversationHistory: Array<{role: string; content: string}>): CarlaJoyResponse {
    this.conversationState.conversationContext.push(message.toLowerCase());
    
    // Parse user intent and extract preferences
    const extractedInfo = this.extractPreferencesFromMessage(message);
    this.updatePreferences(extractedInfo);

    // Check if this is an initial greeting or if we need to start over
    if (this.isGreeting(message) || !this.conversationState.hasShownInitialGreeting) {
      return this.handleInitialGreeting();
    }

    // Handle adding restrictions after initial recommendations
    if (this.isAddingRestriction(message)) {
      return this.handleAdditionalRestrictions(message);
    }

    // Check what information we still need
    const missingInfo = this.getMissingInformation();
    
    if (missingInfo.length === 0) {
      // We have all the info needed for recommendations
      return this.generateRecommendations();
    } else {
      // Continue gathering information
      return this.askForNextInformation(missingInfo[0]);
    }
  }

  private isGreeting(message: string): boolean {
    const greetings = ['hello', 'hi', 'hey', 'start', 'help', 'recommend'];
    return greetings.some(greeting => message.toLowerCase().includes(greeting));
  }

  private isAddingRestriction(message: string): boolean {
    const restrictionPhrases = [
      'i can\'t do', 'i don\'t like', 'no ', 'not ', 'can\'t have',
      'allergic to', 'avoid', 'without', 'except', 'but not'
    ];
    return restrictionPhrases.some(phrase => message.toLowerCase().includes(phrase));
  }

  private handleInitialGreeting(): CarlaJoyResponse {
    this.conversationState.hasShownInitialGreeting = true;
    
    return {
      message: "Hey there! I'm Carla Joy, and I'm here to help you find the perfect drink. What type of beverage are you in the mood for tonight?",
      quickButtons: ["Cocktail", "Beer", "Wine", "Spirit", "Non-alcoholic"],
      ready: false
    };
  }

  private handleAdditionalRestrictions(message: string): CarlaJoyResponse {
    // Extract new allergies/restrictions from the message
    const newAllergies = this.extractAllergiesFromMessage(message);
    
    if (newAllergies.length > 0) {
      const existingAllergies = this.conversationState.preferences.allergies || [];
      this.conversationState.preferences.allergies = [...existingAllergies, ...newAllergies];
      
      return {
        message: `Got it! I've updated your preferences to avoid ${newAllergies.join(' and ')}. Here are your updated recommendations:`,
        preferences: this.conversationState.preferences as DrinkPreferences,
        confidence: 95,
        ready: true,
        quickButtons: []
      };
    }
    
    return this.askForNextInformation(this.getMissingInformation()[0]);
  }

  private extractPreferencesFromMessage(message: string): Partial<DrinkPreferences> {
    const extracted: Partial<DrinkPreferences> = {};
    const lowerMessage = message.toLowerCase();

    // Extract category
    if (lowerMessage.includes('cocktail') || lowerMessage.includes('mixed drink')) {
      extracted.category = 'cocktail';
    } else if (lowerMessage.includes('beer') || lowerMessage.includes('lager') || lowerMessage.includes('ale')) {
      extracted.category = 'beer';
    } else if (lowerMessage.includes('wine') || lowerMessage.includes('chardonnay') || lowerMessage.includes('cabernet')) {
      extracted.category = 'wine';
    } else if (lowerMessage.includes('spirit') || lowerMessage.includes('whiskey') || lowerMessage.includes('vodka') || lowerMessage.includes('gin')) {
      extracted.category = 'spirit';
    } else if (lowerMessage.includes('non-alcoholic') || lowerMessage.includes('mocktail') || lowerMessage.includes('virgin')) {
      extracted.category = 'non-alcoholic';
    }

    // Extract flavor preferences
    if (lowerMessage.includes('sweet') || lowerMessage.includes('fruity')) {
      extracted.flavor = 'sweet';
    } else if (lowerMessage.includes('sour') || lowerMessage.includes('tart') || lowerMessage.includes('citrus')) {
      extracted.flavor = 'sour';
    } else if (lowerMessage.includes('bitter')) {
      extracted.flavor = 'bitter';
    } else if (lowerMessage.includes('smoky')) {
      extracted.flavor = 'smoky';
    } else if (lowerMessage.includes('crisp') || lowerMessage.includes('refreshing') || lowerMessage.includes('clean')) {
      extracted.flavor = 'crisp';
    } else if (lowerMessage.includes('smooth') || lowerMessage.includes('mellow')) {
      extracted.flavor = 'smooth';
    }

    // Extract strength preferences
    if (lowerMessage.includes('strong') || lowerMessage.includes('powerful') || lowerMessage.includes('high alcohol')) {
      extracted.strength = 'strong';
    } else if (lowerMessage.includes('light') || lowerMessage.includes('easy') || lowerMessage.includes('low alcohol')) {
      extracted.strength = 'light';
    } else if (lowerMessage.includes('medium') || lowerMessage.includes('balanced') || lowerMessage.includes('moderate')) {
      extracted.strength = 'medium';
    }

    // Extract occasion
    if (lowerMessage.includes('celebration') || lowerMessage.includes('party') || lowerMessage.includes('birthday')) {
      extracted.occasion = 'celebration';
    } else if (lowerMessage.includes('business') || lowerMessage.includes('work') || lowerMessage.includes('professional')) {
      extracted.occasion = 'business';
    } else if (lowerMessage.includes('romantic') || lowerMessage.includes('date') || lowerMessage.includes('dinner')) {
      extracted.occasion = 'romantic';
    } else if (lowerMessage.includes('casual') || lowerMessage.includes('relaxing') || lowerMessage.includes('happy hour')) {
      extracted.occasion = 'casual';
    }

    // Extract allergies
    extracted.allergies = this.extractAllergiesFromMessage(message);

    return extracted;
  }

  private extractAllergiesFromMessage(message: string): string[] {
    const allergies: string[] = [];
    const lowerMessage = message.toLowerCase();

    if (lowerMessage.includes('gluten-free') || lowerMessage.includes('no gluten') || lowerMessage.includes('celiac')) {
      allergies.push('gluten');
    }
    if (lowerMessage.includes('dairy-free') || lowerMessage.includes('no dairy') || lowerMessage.includes('lactose')) {
      allergies.push('dairy');
    }
    if (lowerMessage.includes('no whiskey') || lowerMessage.includes('can\'t do whiskey') || lowerMessage.includes('not whiskey')) {
      allergies.push('whiskey');
    }
    if (lowerMessage.includes('no gin') || lowerMessage.includes('can\'t do gin') || lowerMessage.includes('not gin')) {
      allergies.push('gin');
    }
    if (lowerMessage.includes('no vodka') || lowerMessage.includes('can\'t do vodka') || lowerMessage.includes('not vodka')) {
      allergies.push('vodka');
    }

    return allergies;
  }

  private updatePreferences(extractedInfo: Partial<DrinkPreferences>): void {
    Object.keys(extractedInfo).forEach(key => {
      const typedKey = key as keyof DrinkPreferences;
      if (extractedInfo[typedKey] !== undefined) {
        if (typedKey === 'allergies') {
          const existingAllergies = this.conversationState.preferences.allergies || [];
          const newAllergies = extractedInfo.allergies || [];
          this.conversationState.preferences.allergies = [...new Set([...existingAllergies, ...newAllergies])];
        } else {
          (this.conversationState.preferences as any)[typedKey] = extractedInfo[typedKey];
        }
      }
    });
  }

  private getMissingInformation(): string[] {
    const missing: string[] = [];
    const prefs = this.conversationState.preferences;

    if (!prefs.category) missing.push('category');
    if (!prefs.flavor) missing.push('flavor');
    if (!prefs.strength) missing.push('strength');
    if (!prefs.occasion) missing.push('occasion');
    if (!prefs.allergies || prefs.allergies.length === 0) missing.push('allergies');

    return missing;
  }

  private askForNextInformation(missingInfo: string): CarlaJoyResponse {
    const knowledge = this.getDrinkCategoryKnowledge();
    
    switch (missingInfo) {
      case 'category':
        return {
          message: "What type of beverage are you in the mood for tonight?",
          quickButtons: ["Cocktail", "Beer", "Wine", "Spirit", "Non-alcoholic"],
          ready: false
        };
        
      case 'flavor':
        const category = this.conversationState.preferences.category;
        if (category && knowledge[category as keyof typeof knowledge]) {
          const categoryInfo = knowledge[category as keyof typeof knowledge];
          return {
            message: `Great choice on ${category}! What kind of flavors are you craving?`,
            quickButtons: ["Sweet", "Sour", "Bitter", "Crisp", "Smoky", "Smooth"],
            ready: false
          };
        }
        return {
          message: "What kind of flavors are you in the mood for?",
          quickButtons: ["Sweet", "Sour", "Bitter", "Crisp", "Smoky", "Smooth"],
          ready: false
        };
        
      case 'strength':
        return {
          message: "How strong would you like your drink to be?",
          quickButtons: ["Light", "Medium", "Strong"],
          ready: false
        };
        
      case 'occasion':
        return {
          message: "What's the occasion? This helps me pick the perfect vibe.",
          quickButtons: ["Casual", "Celebration", "Business", "Romantic"],
          ready: false
        };
        
      case 'allergies':
        return {
          message: "Last question - any allergies or ingredients you'd like me to avoid?",
          quickButtons: ["None", "Gluten-free", "Dairy-free", "Other restrictions"],
          ready: false
        };
        
      default:
        return {
          message: "Tell me a bit more about what you're looking for!",
          quickButtons: [],
          ready: false
        };
    }
  }

  private generateRecommendations(): CarlaJoyResponse {
    const prefs = this.conversationState.preferences as DrinkPreferences;
    const knowledge = this.getDrinkCategoryKnowledge();
    
    // Check for limitations and provide expert advice
    let expertAdvice = "";
    let recommendationMessage = "Perfect! Here are your recommendations:";

    // Handle specific limitation cases with bartender expertise
    if (prefs.category === 'beer' && prefs.allergies?.includes('gluten')) {
      const beerKnowledge = knowledge.beer;
      expertAdvice = beerKnowledge.limitations?.glutenFree || "";
      recommendationMessage = "I understand you'd like gluten-free beer options. Unfortunately, most beers contain gluten from barley or wheat, and we don't have gluten-free beers in our current selection. But don't worry - I've got some fantastic alternatives that I think you'll love even more!";
      
      // Modify preferences to suggest alternatives
      if (prefs.flavor === 'bitter' || prefs.flavor === 'crisp') {
        // Suggest wine or cocktails with similar profiles
        return {
          message: recommendationMessage,
          preferences: { 
            ...prefs, 
            category: 'wine' // Suggest wine as the closest gluten-free alternative
          },
          confidence: 85,
          ready: true,
          expertAdvice: "Since you like beer flavors, I'm recommending crisp wines and cocktails that have similar refreshing qualities. Wine is naturally gluten-free and can give you that clean, crisp taste you're looking for!"
        };
      }
    }

    // Handle dairy restrictions in cocktails
    if (prefs.category === 'cocktail' && prefs.allergies?.includes('dairy')) {
      expertAdvice = "Great news! Most cocktails are naturally dairy-free. I'll make sure to avoid creamy cocktails like White Russians or Brandy Alexanders.";
    }

    // Handle spirit restrictions
    if (prefs.allergies?.includes('whiskey') || prefs.allergies?.includes('gin') || prefs.allergies?.includes('vodka')) {
      const restrictedSpirits = prefs.allergies.filter(a => ['whiskey', 'gin', 'vodka'].includes(a));
      expertAdvice = `No problem! I'll avoid ${restrictedSpirits.join(' and ')} and focus on other spirits or wine-based options that match your taste.`;
    }

    // Generate confidence based on how well we can match preferences
    let confidence = 95;
    if (prefs.category === 'beer' && prefs.allergies?.includes('gluten')) {
      confidence = 80; // Lower confidence when suggesting alternatives
    }

    return {
      message: recommendationMessage,
      preferences: prefs,
      confidence,
      ready: true,
      expertAdvice,
      quickButtons: []
    };
  }

  // Reset conversation state for new session
  public resetConversation(): void {
    this.conversationState = {
      preferences: {},
      missingInfo: ['category', 'flavor', 'strength', 'occasion', 'allergies'],
      conversationContext: [],
      hasShownInitialGreeting: false
    };
  }
}

// Factory function to create bartender agent
export function createBartenderAgent(drinks: DrinkItem[]): CarlaJoyAgent {
  return new CarlaJoyAgent(drinks);
}