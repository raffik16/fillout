import { NextRequest, NextResponse } from 'next/server';

export async function GET(_request: NextRequest) {
  // Return unlimited usage since authentication is removed
  return NextResponse.json({
    current: 0,
    limit: 999999,
    resetDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
  });
}

export async function POST(_request: NextRequest) {
  // Return success for usage tracking since authentication is removed
  return NextResponse.json({
    success: true,
    usage: { current: 0, limit: 999999 }
  });
}