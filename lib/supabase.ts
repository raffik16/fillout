import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
})

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
      .eq('drink_id', drinkId)
      .eq('session_id', sessionId)
    
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

export async function toggleLike(drinkId: string, sessionId: string) {
  try {
    // Check if user has already liked this drink
    const userLikes = await getUserLikes(sessionId)
    const isCurrentlyLiked = userLikes.includes(drinkId)
    
    if (isCurrentlyLiked) {
      // Unlike: remove the like
      const success = await unlikeDrink(drinkId, sessionId)
      if (!success) {
        return { success: false, liked: isCurrentlyLiked }
      }
      return { success: true, liked: false }
    } else {
      // Like: add the like
      const success = await likeDrink(drinkId, sessionId)
      if (!success) {
        return { success: false, liked: isCurrentlyLiked }
      }
      return { success: true, liked: true }
    }
  } catch (error) {
    console.error('Error toggling like:', error)
    return { success: false, liked: false }
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

// Order operations
export async function orderDrink(drinkId: string, sessionId: string) {
  try {
    const { error } = await supabase
      .from('drink_orders')
      .insert({ 
        drink_id: drinkId, 
        session_id: sessionId 
      })
    
    if (error) {
      console.error('Error ordering drink:', error)
      return false
    }
    
    return true
  } catch (error) {
    console.error('Error ordering drink:', error)
    return false
  }
}

export async function getDrinkOrders(drinkId: string) {
  try {
    const { data, error } = await supabase
      .from('drink_orders')
      .select('*')
      .eq('drink_id', drinkId)
    
    if (error) {
      console.error('Error getting drink orders:', error)
      return { count: 0, ordered: false }
    }
    
    return { count: data?.length || 0, ordered: false }
  } catch (error) {
    console.error('Error getting drink orders:', error)
    return { count: 0, ordered: false }
  }
}

export async function getUserOrders(sessionId: string) {
  try {
    const { data, error } = await supabase
      .from('drink_orders')
      .select('drink_id')
      .eq('session_id', sessionId)
    
    if (error) {
      console.error('Error getting user orders:', error)
      return []
    }
    
    return data?.map(order => order.drink_id) || []
  } catch (error) {
    console.error('Error getting user orders:', error)
    return []
  }
}

// Real-time subscription helpers
export function subscribeToLikes(drinkId: string, callback: (payload: any) => void) {
  return supabase
    .channel(`likes:${drinkId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'drink_likes',
        filter: `drink_id=eq.${drinkId}`
      },
      callback
    )
    .subscribe()
}

export function subscribeToOrders(drinkId: string, callback: (payload: any) => void) {
  return supabase
    .channel(`orders:${drinkId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'drink_orders',
        filter: `drink_id=eq.${drinkId}`
      },
      callback
    )
    .subscribe()
}