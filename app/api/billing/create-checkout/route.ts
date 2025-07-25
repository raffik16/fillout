import { NextRequest, NextResponse } from 'next/server';

export async function POST(_request: NextRequest) {
  // Billing disabled since authentication is removed
  return NextResponse.json(
    { error: 'Billing not available' },
    { status: 400 }
  );
}