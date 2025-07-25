import { NextRequest, NextResponse } from 'next/server';

export async function GET(_request: NextRequest) {
  // Return empty preferences since authentication is removed
  return NextResponse.json({ preferences: null });
}