import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    // Get total orders and unique users who have ordered
    const { data: ordersData, error: ordersError } = await supabase
      .from('drink_orders')
      .select('session_id, drink_id');

    if (ordersError) {
      console.error('Error fetching orders analytics:', ordersError);
      return NextResponse.json({ 
        error: 'Failed to fetch orders analytics',
        data: { totalOrders: 0, totalOrderUsers: 0 }
      }, { status: 500 });
    }

    const totalOrders = ordersData?.length || 0;
    const uniqueUsers = new Set(ordersData?.map(order => order.session_id) || []).size;

    return NextResponse.json({
      data: {
        totalOrders,
        totalOrderUsers: uniqueUsers
      }
    });
  } catch (error) {
    console.error('Error in orders analytics endpoint:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      data: { totalOrders: 0, totalOrderUsers: 0 }
    }, { status: 500 });
  }
}