import { NextRequest, NextResponse } from 'next/server';

export async function POST(_request: NextRequest) {
  // Return success since authentication is removed
  return NextResponse.json({ success: true });
}