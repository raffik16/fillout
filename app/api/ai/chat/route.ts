import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { createClient } from '@supabase/supabase-js';
import drinksData from '@/data/drinks';
const drinks = (drinksData?.drinks || drinksData || []);

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY!);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// Smart drink matching with quality scoring
function getSmartDrinkMatches(preferences: {
  category?: string;
  flavor?: string;
  strength?: string;
  occasion?: string;
  allergies?: string[];
}) {
  if (!Array.isArray(drinks)) return { perfectMatches: [], goodMatches: [], otherMatches: [] };
  
  const scoredDrinks = drinks.map(drink => {
    let score = 0;
    const matchReasons = [];

    // Category match (high priority)
    if (preferences.category && preferences.category !== 'any' && preferences.category !== 'featured') {
      if (drink.category === preferences.category) {
        score += 30;
        matchReasons.push('category');
      } else {
        // Heavy penalty for wrong category (especially non-alcoholic vs alcoholic)
        if (preferences.category === 'non-alcoholic' && drink.category !== 'non-alcoholic') {
          score -= 30; // Major penalty for alcoholic when non-alcoholic requested
        } else if (preferences.category !== 'non-alcoholic' && drink.category === 'non-alcoholic') {
          score -= 20; // Penalty for non-alcoholic when alcoholic requested
        } else {
          score -= 10; // Minor penalty for wrong alcoholic category
        }
      }
    } else {
      score += 10; // Some points for any category when no preference
    }

    // Flavor match (high priority)
    if (preferences.flavor && preferences.flavor !== 'any') {
      const flavorMap = {
        'sweet': ['sweet', 'fruity'],
        'sour': ['sour', 'tart', 'citrus'],
        'bitter': ['bitter'],
        'smoky': ['smoky'],
        'crisp': ['crisp', 'fresh', 'clean', 'refreshing'],
        'smooth': ['smooth', 'mellow']
      };
      const targetFlavors = flavorMap[preferences.flavor as keyof typeof flavorMap] || [preferences.flavor];
      if (drink.flavor_profile?.some(flavor => targetFlavors.includes(flavor))) {
        score += 25;
        matchReasons.push('flavor');
      }
    }

    // Strength match (medium priority)
    if (preferences.strength) {
      if (drink.strength === preferences.strength) {
        score += 20;
        matchReasons.push('strength');
      }
    }

    // Occasion match (medium priority)
    if (preferences.occasion && preferences.occasion !== 'any') {
      const occasionMap = {
        'casual': 'casual',
        'celebration': 'celebration', 
        'business': 'business',
        'romantic': 'romantic',
        'sports': 'sports',
        'exploring': 'casual',
        'newly21': 'casual',
        'birthday': 'celebration'
      };
      const mappedOccasion = occasionMap[preferences.occasion as keyof typeof occasionMap];
      if (mappedOccasion && drink.occasions?.includes(mappedOccasion)) {
        score += 15;
        matchReasons.push('occasion');
      }
    }

    // Allergy compatibility (critical - subtract points if not compatible)
    let allergyCompatible = true;
    if (preferences.allergies && preferences.allergies.length > 0) {
      // Check gluten allergies
      if (preferences.allergies.includes('gluten')) {
        const glutenIngredients = ['beer', 'wheat', 'barley', 'rye', 'malt'];
        const glutenCategories = ['beer'];
        const isGlutenDrink = drink.category === 'beer' || 
                             glutenCategories.includes(drink.category) ||
                             drink.ingredients?.some(ing => 
                               glutenIngredients.some(gluten => ing.toLowerCase().includes(gluten))
                             );
        
        if (isGlutenDrink) {
          score -= 50;
          allergyCompatible = false;
        } else {
          score += 5;
          matchReasons.push('gluten-free');
        }
      }
      
      // Check dairy allergies
      if (preferences.allergies.includes('dairy')) {
        const dairyIngredients = ['milk', 'cream', 'butter', 'cheese', 'yogurt', 'whey', 'casein', 'lactose'];
        const dairyDrinks = ['white russian', 'mudslide', 'brandy alexander', 'grasshopper'];
        if (drink.ingredients?.some(ing => 
          dairyIngredients.some(dairy => ing.toLowerCase().includes(dairy))
        ) || dairyDrinks.some(dairyDrink => drink.name.toLowerCase().includes(dairyDrink))) {
          score -= 50;
          allergyCompatible = false;
        } else {
          score += 5;
          matchReasons.push('dairy-free');
        }
      }
      
      // Check spirit/ingredient restrictions
      if (preferences.allergies.includes('whiskey') || preferences.allergies.includes('bourbon')) {
        const whiskeyIngredients = ['whiskey', 'bourbon', 'rye whiskey', 'scotch'];
        if (drink.ingredients?.some(ing => 
          whiskeyIngredients.some(whiskey => ing.toLowerCase().includes(whiskey))
        ) || whiskeyIngredients.some(whiskey => drink.name.toLowerCase().includes(whiskey))) {
          score -= 50;
          allergyCompatible = false;
        } else {
          score += 5;
          matchReasons.push('whiskey-free');
        }
      }
      
      // Check gin restrictions
      if (preferences.allergies.includes('gin')) {
        if (drink.ingredients?.some(ing => ing.toLowerCase().includes('gin')) || 
            drink.name.toLowerCase().includes('gin')) {
          score -= 50;
          allergyCompatible = false;
        } else {
          score += 5;
          matchReasons.push('gin-free');
        }
      }
      
      // Check vodka restrictions
      if (preferences.allergies.includes('vodka')) {
        if (drink.ingredients?.some(ing => ing.toLowerCase().includes('vodka')) || 
            drink.name.toLowerCase().includes('vodka')) {
          score -= 50;
          allergyCompatible = false;
        } else {
          score += 5;
          matchReasons.push('vodka-free');
        }
      }

      // Add bonus for being allergy-friendly
      if (allergyCompatible && preferences.allergies.length > 0) {
        score += 5;
      }
    }

    return { drink, score, matchReasons, allergyCompatible };
  });

  // Sort by score
  const sortedDrinks = scoredDrinks.sort((a, b) => b.score - a.score);

  // Categorize matches
  const perfectMatches = sortedDrinks.filter(item => item.score >= 60 && item.allergyCompatible);
  const goodMatches = sortedDrinks.filter(item => item.score >= 30 && item.score < 60 && item.allergyCompatible);
  const otherMatches = sortedDrinks.filter(item => item.score >= 10 && item.score < 30 && item.allergyCompatible);

  return {
    perfectMatches: perfectMatches.slice(0, 5),
    goodMatches: goodMatches.slice(0, 5),
    otherMatches: otherMatches.slice(0, 5)
  };
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const { message, sessionId, conversationHistory = [] } = await request.json();
    
    if (!message || !sessionId) {
      return NextResponse.json(
        { error: 'Message and sessionId are required' },
        { status: 400 }
      );
    }

    // Check if API key is configured
    if (!process.env.GOOGLE_AI_API_KEY) {
      console.error('GOOGLE_AI_API_KEY environment variable is not set');
      return NextResponse.json(
        { error: 'AI service is not configured properly' },
        { status: 500 }
      );
    }

    // Temporary: Check if AI service is disabled due to billing issues
    if (process.env.DISABLE_AI_CHAT === 'true') {
      return NextResponse.json(
        { error: 'AI chat is temporarily unavailable. Please try again later.' },
        { status: 503 }
      );
    }


    const sampleDrinks = Array.isArray(drinks) ? drinks.slice(0, 5).map(drink => ({
      name: drink.name,
      category: drink.category,
      description: drink.description,
      flavor_profile: drink.flavor_profile,
      strength: drink.strength,
      occasions: drink.occasions,
      abv: drink.abv,
      glass_type: drink.glass_type
    })) : [];

    // Build conversation context with Carla Tortelli personality
    const systemPrompt = `You are Carla Tortelli, the sharp-tongued waitress from Cheers. You've been slinging drinks at this dump for 20 years and you know every cocktail ever invented, even if most customers don't deserve 'em. You're from Boston, got eight kids, and your patience ran out sometime in the Reagan administration.

    Your job is finding out what these people want to drink through conversation - but you do it YOUR way, with attitude:
    - Category: cocktail, beer, wine, spirit, non-alcoholic, any, featured
    - Flavor: crisp, smoky, sweet, bitter, sour, smooth
    - Strength: light (for lightweights), medium (normal people), strong (hair on your chest)
    - Occasion: casual (just another Tuesday), celebration, business, romantic (good luck with that), sports, exploring, newly21 (oh great, another kid), birthday
    - Allergies: none, gluten, dairy, nuts, eggs, soy

    SAMPLE DRINKS WE GOT:
    ${sampleDrinks.map(drink => 
      `• ${drink.name} (${drink.category}): ${drink.description} - ${drink.flavor_profile?.join(', ')} flavors, ${drink.strength} strength, served in ${drink.glass_type || 'whatever glass I grab first'}`
    ).join('\n')}

    HOW CARLA TALKS:
    1. Sarcastic FIRST, helpful second - but you ALWAYS get the order right eventually
    2. Boston accent - use contractions: "What're ya havin'?" not "What are you having?"
    3. Creative insults: "Listen up, pencil neck" or "Alright, college boy"
    4. Ask questions with attitude: "You want somethin' sweet like a little kid, or can you handle real liquor?"
    5. Keep it SHORT - you got other customers and eight kids at home
    6. If they tell you their name, you'll use it sarcastically
    7. Show off drink knowledge while acting like it's no big deal
    8. REMEMBER their allergies - you may hate 'em but you're not tryin' to kill anybody

    QUICK BUTTONS RULES (you still gotta use these fancy computer things):
    - ALWAYS provide quickButtons that match your sarcastic question
    - Match what you're askin' (if you say "Sweet or strong?", buttons are ["Sweet", "Strong", "Both", "Neither"])
    - For categories: ["Cocktail", "Beer", "Wine", "Spirit", "Non-alcoholic"]  
    - For occasions: ["Just drinking", "Celebration", "Business", "Date night", "Drowning sorrows"]
    - For allergies: ["Nothing", "Gluten-free", "Dairy-free", "I'm complicated"]
    - No generic "yes/no" unless that's really what you're askin'

    ALLERGY & RESTRICTION HANDLING (the fun part):
    - User says "no dairy", "dairy-free", "lactose intolerant" - add "dairy" to allergies with sass: "Lactose intolerant? Join the club, my third kid's the same way."
    - User says "gluten-free", "no gluten", "celiac" - add "gluten" to allergies: "Gluten-free, huh? This keeps gettin' better."
    - User says "no whiskey", "can't do whiskey" - add "whiskey" to allergies: "No whiskey? What are ya, twelve?"
    - User says "no gin", "can't do gin" - add "gin" to allergies: "Gin's too sophisticated for ya anyway."
    - User says "no vodka" - add "vodka" to allergies: "No vodka? There goes half the menu."
    - Always remember ALL their stupid restrictions
    - When they add MORE restrictions after you already started, act annoyed but UPDATE everything

    CONVERSATION FLOW RULES:
    - Track what info you already have - don't ask again!
    - If user says "surprise me" or gives vague answers, pick reasonable defaults and move on
    - If they give you category AND flavor in one message, extract both and jump to strength  
    - Be EFFICIENT - no more than 6 questions total
    - Always make sure to ask for allergies!
    - For "surprise me" requests: default to cocktail, medium strength, casual occasion, no allergies, and pick a random flavor
    
    For ongoing conversation, provide JSON like this (but hide it behind Carla's personality):
    {
      "message": "Alright, what kinda flavors you want? And don't say 'surprise me' or you're gettin' tap water.",
      "quickButtons": ["Sweet", "Sour", "Bitter", "Smoky", "Just strong"],
      "ready": false
    }

    INFORMATION YOU NEED BEFORE RECOMMENDATIONS:
    Ask these IN ORDER, ONE AT A TIME. Don't repeat questions you already asked:
    1. Category - "Beer, wine, or you want me to actually make somethin'?"
    2. Flavor - "Sweet like candy or bitter like my ex-husband?" 
    3. Strength - "You want training wheels or the real deal?"
    4. Occasion - "This for a date or drownin' your sorrows?"
    5. Allergies - "What's gonna kill ya besides my charm?"
    
    IMPORTANT: If user gives you multiple pieces of info at once (like "I want a strong smoky cocktail"), extract ALL the info and skip those questions. Don't ask again what they already told you!

    When you got ALL 6 pieces, provide final JSON with Carla's touch:

    For normal requests:
    {
      "preferences": { "category": "cocktail", "flavor": "sweet", "strength": "medium", "occasion": "casual", "allergies": ["none"] },
      "confidence": 95,
      "ready": true,
      "message": "Alright, sweet cocktails for Captain Boring. Here's what won't rot your teeth immediately:",
      "quickButtons": []
    }

    For challenging requests (like gluten-free beer):
    {
      "preferences": { "category": "beer", "flavor": "crisp", "strength": "medium", "occasion": "celebration", "allergies": ["gluten"] },
      "confidence": 95,
      "ready": true,
      "message": "Gluten-free beer? Why don't you just ask me to turn water into wine while you're at it? Fine, I got some options that won't make you sick:",
      "quickButtons": []
    }

    WHEN THEY CHANGE THEIR MIND (they always do):
    If user adds restrictions AFTER recommendations (like "actually, I can't have whiskey either"):
    1. Act exasperated but professional
    2. Update the allergies array
    3. Provide new recommendations with appropriate sass

    Example follow-up response:
    {
      "preferences": { "category": "cocktail", "flavor": "crisp", "strength": "medium", "occasion": "celebration", "allergies": ["dairy", "whiskey"] },
      "confidence": 95,
      "ready": true,
      "message": "Oh for the love of... NOW you tell me about the whiskey thing? Fine, here's what else we got:",
      "quickButtons": []
    }

    CARLA'S PERSONALITY CHEAT SHEET:
    - Mother of 8 kids (mentions them when relevant)
    - From Boston (die-hard Red Sox fan)
    - Multiple ex-husbands (all losers)
    - Catholic (goes to church but sins plenty)
    - Been at Cheers forever (knows every regular's drama)
    - Secretly cares but hides it under snark
    - NEVER admits when she's impressed
    - Hates pretentious people and overly complicated orders

    IMPORTANT: Stay in character ALWAYS. Even when being helpful, wrap it in sarcasm. You're Carla Tortelli - you'll get them the perfect drink, but they're gonna hear about it.

    Current conversation:`;


    // Build conversation context for Gemini
    let conversationText = systemPrompt + "\n\n";
    conversationHistory.forEach((msg: { role: string; content: string }) => {
      conversationText += `${msg.role}: ${msg.content}\n`;
    });
    conversationText += `user: ${message}\nassistant: `;

    // Call Gemini API
    console.log('Making API call to Gemini with prompt length:', conversationText.length);
    const result = await model.generateContent(conversationText);
    const response = await result.response;
    const responseText = response.text();

    // Try to extract JSON preferences if present
    let preferences = null;
    let confidence = 0;
    let ready = false;
    let extractedMessage = responseText;
    let drinksForMessage = null;

    // Look for JSON with either ready or quickButtons
    const jsonMatch = responseText.match(/\{[\s\S]*("ready"|"quickButtons"|"message")[\s\S]*\}/);
    let quickButtons = null;
    if (jsonMatch) {
      try {
        console.log('Found JSON match:', jsonMatch[0]);
        const parsedJson = JSON.parse(jsonMatch[0]);
        console.log('Parsed JSON:', parsedJson);
        preferences = parsedJson.preferences;
        confidence = parsedJson.confidence || 0;
        ready = parsedJson.ready || false;
        quickButtons = parsedJson.quickButtons;
        console.log('Extracted quickButtons:', quickButtons);
        extractedMessage = parsedJson.message || responseText.replace(jsonMatch[0], '').trim();

        // If preferences are ready, enhance with specific drink recommendations
        if (ready && preferences) {
          console.log('Getting smart drink matches for preferences:', preferences);
          const { perfectMatches, goodMatches, otherMatches } = getSmartDrinkMatches(preferences);
          console.log(`Smart matches - Perfect: ${perfectMatches.length}, Good: ${goodMatches.length}, Other: ${otherMatches.length}`);
          console.log('Perfect matches:', perfectMatches.map(m => `${m.drink.name} (score: ${m.score})`));
          console.log('Good matches:', goodMatches.map(m => `${m.drink.name} (score: ${m.score})`));

          // Smart fallback logic when no good matches exist
          const allMatches = [];
          
          if (perfectMatches.length > 0) {
            allMatches.push(...perfectMatches.map(item => ({ 
              ...item.drink, 
              matchQuality: 'perfect',
              matchReasons: item.matchReasons,
              score: item.score
            })));
          }
          
          if (goodMatches.length > 0 && allMatches.length < 12) {
            const needed = 12 - allMatches.length;
            allMatches.push(...goodMatches.slice(0, needed).map(item => ({ 
              ...item.drink, 
              matchQuality: 'good',
              matchReasons: item.matchReasons,
              score: item.score
            })));
          }
          
          if (otherMatches.length > 0 && allMatches.length < 12) {
            const needed = 12 - allMatches.length;
            allMatches.push(...otherMatches.slice(0, needed).map(item => ({ 
              ...item.drink, 
              matchQuality: 'other',
              matchReasons: item.matchReasons,
              score: item.score
            })));
          }

          // If we have very few matches and the request was problematic (like gluten-free beer), 
          // provide better contextual alternatives
          if (allMatches.length < 3) {
            console.log('Low match count, providing contextual alternatives');
            
            // For gluten-free beer requests, suggest gluten-free alternatives
            if (preferences.category === 'beer' && preferences.allergies?.includes('gluten')) {
              const glutenFreeAlternatives = drinks.filter(drink => 
                (drink.category === 'non-alcoholic' || drink.category === 'cocktail') &&
                !drink.ingredients?.some(ing => 
                  ['beer', 'wheat', 'barley', 'rye', 'malt'].some(gluten => ing.toLowerCase().includes(gluten))
                )
              ).slice(0, 4);
              
              console.log(`Found ${glutenFreeAlternatives.length} gluten-free alternatives for beer request`);
              
              glutenFreeAlternatives.forEach(drink => {
                if (allMatches.length < 12) {
                  allMatches.push({
                    ...drink,
                    matchQuality: 'alternative',
                    matchReasons: ['gluten-free-alternative'],
                    score: 25
                  });
                }
              });
            }
          }

          if (allMatches.length > 0) {
            // Set drinks data for grid display with match quality and images
            drinksForMessage = allMatches.map(drink => ({
              name: drink.name,
              category: drink.category,
              abv: drink.abv,
              flavor_profile: drink.flavor_profile,
              description: drink.description,
              image_url: drink.image_url,
              matchQuality: drink.matchQuality,
              matchReasons: drink.matchReasons,
              score: drink.score
            }));

            // Simplify the message when showing drinks grid
            extractedMessage = extractedMessage.replace(/\n\n🍹[\s\S]*$/, '');
            
            const perfectCount = perfectMatches.length;
            const goodCount = goodMatches.length;
            const alternativeCount = allMatches.filter(m => m.matchQuality === 'alternative').length;
            
            if (perfectCount > 0) {
              extractedMessage += `\n\n🎯 **${perfectCount} Perfect Match${perfectCount > 1 ? 'es' : ''}:**`;
              if (goodCount > 0) {
                // Special case for exactly 3 good matches
                if (goodCount === 3) {
                  extractedMessage += `\n✨ **3 Great Options for You:**`;
                } else {
                  extractedMessage += `\n✨ **Plus ${goodCount} Good Alternative${goodCount > 1 ? 's' : ''}:**`;
                }
              }
            } else if (goodCount > 0) {
              // Special case for exactly 3 good matches when no perfect matches
              if (goodCount === 3) {
                extractedMessage += `\n\n✨ **3 Great Options for You:**`;
              } else {
                extractedMessage += `\n\n✨ **${goodCount} Great Option${goodCount > 1 ? 's' : ''} for You:**`;
              }
            }
            
            // Add alternative options with proper title
            if (alternativeCount > 0) {
              // Special messaging for alternative recommendations
              if (preferences.category === 'beer' && preferences.allergies?.includes('gluten')) {
                extractedMessage += `\n\n💡 **Also worth trying (gluten-free alternatives):**`;
              } else {
                extractedMessage += `\n\n💡 **Also worth trying:**`;
              }
            } else if (perfectCount === 0 && goodCount === 0) {
              extractedMessage += "\n\n🍹 **Here are some recommendations:**";
            }
          }
        }
      } catch (e) {
        console.error('Error parsing JSON from AI response:', e);
      }
    }

    // Auto-detect yes/no questions and add quick buttons (only for genuine yes/no questions)
    if (!quickButtons && !ready) {
      const yesNoIndicators = ['yes or no', 'do you like', 'would you like', 'do you want', 'have you tried'];
      const hasYesNoQuestion = yesNoIndicators.some(indicator => 
        extractedMessage.toLowerCase().includes(indicator)
      );
      
      if (hasYesNoQuestion) {
        quickButtons = ['Yes', 'No'];
      }
    }

    // Save conversation to database
    const conversationData = {
      user_id: null, // No authentication, all users are anonymous
      session_id: sessionId,
      messages: [
        ...conversationHistory,
        { role: 'user', content: message, timestamp: new Date().toISOString() },
        { role: 'assistant', content: extractedMessage, timestamp: new Date().toISOString() }
      ],
      extracted_preferences: preferences,
      confidence_score: confidence,
      is_ready: ready,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // Upsert conversation (update if exists, insert if new)
    await supabase
      .from('ai_conversations')
      .upsert(conversationData, { 
        onConflict: 'session_id',
        ignoreDuplicates: false 
      });


    console.log('Final API response quickButtons:', quickButtons);
    
    return NextResponse.json({
      message: extractedMessage,
      preferences,
      confidence,
      ready,
      sessionId,
      quickButtons,
      drinks: drinksForMessage
    });

  } catch (error: unknown) {
    console.error('Error in AI chat:', error);
    
    // Log the full error object for debugging
    if (error && typeof error === 'object' && 'status' in error) {
      console.error('API Error Status:', (error as { status?: number }).status);
      console.error('API Error Headers:', (error as { headers?: unknown }).headers);
      console.error('API Error Body:', (error as { error?: unknown }).error);
    }
    
    // Provide more specific error messages for debugging
    if (error instanceof Error) {
      if (error.message.includes('API_KEY') || error.message.includes('authentication') || error.message.includes('401')) {
        return NextResponse.json(
          { error: 'API authentication failed. Please check your Google AI API key.' },
          { status: 401 }
        );
      }
      if (error.message.includes('quota') || error.message.includes('rate') || error.message.includes('429')) {
        return NextResponse.json(
          { error: 'Rate limit exceeded. Please try again later.' },
          { status: 429 }
        );
      }
      if (error.message.includes('safety') || error.message.includes('blocked')) {
        return NextResponse.json(
          { error: 'Content was blocked by safety filters. Please rephrase your message.' },
          { status: 400 }
        );
      }
      if (error instanceof Error && (error.message.includes('invalid') || (error as { status?: number }).status === 400)) {
        return NextResponse.json(
          { error: 'Invalid request format. Please try again.' },
          { status: 400 }
        );
      }
      // Log the full error for debugging
      if (error instanceof Error) {
        console.error('Full Google AI API error message:', error.message);
      }
    }
    
    return NextResponse.json(
      { error: 'Failed to process your message. Please try again.' },
      { status: 500 }
    );
  }
}