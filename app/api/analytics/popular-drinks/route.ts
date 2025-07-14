import { NextResponse } from 'next/server'
import { getPopularDrinks } from '@/lib/supabase'

export async function GET() {
  try {
    const popularDrinks = await getPopularDrinks()
    
    return NextResponse.json({
      success: true,
      data: popularDrinks
    })
  } catch (error) {
    console.error('Error fetching popular drinks:', error)
    return NextResponse.json(
      { error: 'Failed to fetch popular drinks' },
      { status: 500 }
    )
  }
}