import { NextRequest, NextResponse } from 'next/server';

export async function POST(_request: NextRequest) {
  // Always allow access since authentication is removed
  return NextResponse.json({
    hasAccess: true,
    currentPlan: 'free'
  });
}