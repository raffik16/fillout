import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database operations
export async function likeDrink(drinkId: string, sessionId: string) {
  try {
    const { error } = await supabase
      .from('drink_likes')
      .insert({ 
        drink_id: drinkId, 
        session_id: sessionId 
      })
    
    if (error) {
      console.error('Error liking drink:', error)
      return false
    }
    
    return true
  } catch (error) {
    console.error('Error liking drink:', error)
    return false
  }
}

export async function unlikeDrink(drinkId: string, sessionId: string) {
  try {
    const { error } = await supabase
      .from('drink_likes')
      .delete()
      .match({ 
        drink_id: drinkId, 
        session_id: sessionId 
      })
    
    if (error) {
      console.error('Error unliking drink:', error)
      return false
    }
    
    return true
  } catch (error) {
    console.error('Error unliking drink:', error)
    return false
  }
}

export async function getDrinkLikes(drinkId: string) {
  try {
    const { data, error } = await supabase
      .from('drink_likes')
      .select('*')
      .eq('drink_id', drinkId)
    
    if (error) {
      console.error('Error getting drink likes:', error)
      return { count: 0, liked: false }
    }
    
    return { count: data?.length || 0, liked: false }
  } catch (error) {
    console.error('Error getting drink likes:', error)
    return { count: 0, liked: false }
  }
}

export async function getUserLikes(sessionId: string) {
  try {
    const { data, error } = await supabase
      .from('drink_likes')
      .select('drink_id')
      .eq('session_id', sessionId)
    
    if (error) {
      console.error('Error getting user likes:', error)
      return []
    }
    
    return data?.map(like => like.drink_id) || []
  } catch (error) {
    console.error('Error getting user likes:', error)
    return []
  }
}

export async function saveEmailSignup(
  email: string,
  matchedDrinks: unknown[],
  preferences: unknown
) {
  try {
    const { error } = await supabase
      .from('email_signups')
      .insert({
        email,
        matched_drinks: matchedDrinks,
        preferences
      })
    
    if (error) {
      console.error('Error saving email signup:', error)
      return false
    }
    
    return true
  } catch (error) {
    console.error('Error saving email signup:', error)
    return false
  }
}

export async function getPopularDrinks() {
  try {
    const { data, error } = await supabase
      .from('popular_drinks')
      .select('*')
      .limit(10)
    
    if (error) {
      console.error('Error getting popular drinks:', error)
      return []
    }
    
    return data || []
  } catch (error) {
    console.error('Error getting popular drinks:', error)
    return []
  }
}