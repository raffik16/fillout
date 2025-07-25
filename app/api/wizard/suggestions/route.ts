import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  // Return empty suggestions since authentication is removed
  return NextResponse.json({ suggestions: null });
}