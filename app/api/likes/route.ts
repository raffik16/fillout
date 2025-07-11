import { NextRequest, NextResponse } from 'next/server'
import { likeDrink, unlikeDrink, getDrinkLikes, getUserLikes } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const { drinkId, sessionId, action } = await request.json()
    
    if (!drinkId || !sessionId) {
      return NextResponse.json(
        { error: 'Missing drinkId or sessionId' },
        { status: 400 }
      )
    }
    
    let success = false
    
    if (action === 'like') {
      success = await likeDrink(drinkId, sessionId)
    } else if (action === 'unlike') {
      success = await unlikeDrink(drinkId, sessionId)
    } else {
      return NextResponse.json(
        { error: 'Invalid action. Use "like" or "unlike"' },
        { status: 400 }
      )
    }
    
    if (!success) {
      return NextResponse.json(
        { error: 'Failed to update like status' },
        { status: 500 }
      )
    }
    
    // Get updated like count
    const { count } = await getDrinkLikes(drinkId)
    
    return NextResponse.json({
      success: true,
      likeCount: count,
      action
    })
  } catch (error) {
    console.error('Error in likes API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const drinkId = searchParams.get('drinkId')
    const sessionId = searchParams.get('sessionId')
    
    if (drinkId && sessionId) {
      // Get specific drink like status
      const { count } = await getDrinkLikes(drinkId)
      const userLikes = await getUserLikes(sessionId)
      const liked = userLikes.includes(drinkId)
      
      return NextResponse.json({
        drinkId,
        likeCount: count,
        liked
      })
    } else if (sessionId) {
      // Get all user likes
      const likedDrinks = await getUserLikes(sessionId)
      
      return NextResponse.json({
        likedDrinks
      })
    }
    
    return NextResponse.json(
      { error: 'Missing required parameters' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Error in likes GET API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}