import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  // Return empty metadata since authentication is removed
  return NextResponse.json({ metadata: null });
}

export async function POST(request: NextRequest) {
  // Return success since authentication is removed
  return NextResponse.json({ success: true });
}