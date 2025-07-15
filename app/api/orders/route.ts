import { NextRequest, NextResponse } from 'next/server'
import { orderDrink, getDrinkOrders, getUserOrders } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const { drinkId, sessionId, action } = await request.json()
    
    if (!drinkId || !sessionId) {
      return NextResponse.json(
        { error: 'Missing drinkId or sessionId' },
        { status: 400 }
      )
    }
    
    if (action !== 'order') {
      return NextResponse.json(
        { error: 'Invalid action. Use "order"' },
        { status: 400 }
      )
    }
    
    const success = await orderDrink(drinkId, sessionId)
    
    if (!success) {
      return NextResponse.json(
        { error: 'Failed to record order. May already exist.' },
        { status: 500 }
      )
    }
    
    // Get updated order count
    const { count } = await getDrinkOrders(drinkId)
    
    return NextResponse.json({
      success: true,
      orderCount: count,
      action
    })
  } catch (error) {
    console.error('Error in orders API:', error)
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
      // Get specific drink order status
      const { count } = await getDrinkOrders(drinkId)
      const userOrders = await getUserOrders(sessionId)
      const ordered = userOrders.includes(drinkId)
      
      return NextResponse.json({
        drinkId,
        orderCount: count,
        ordered
      })
    } else if (sessionId) {
      // Get all user orders
      const orderedDrinks = await getUserOrders(sessionId)
      
      return NextResponse.json({
        orderedDrinks
      })
    }
    
    return NextResponse.json(
      { error: 'Missing required parameters' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Error in orders GET API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}