import { NextResponse } from 'next/server';

export async function GET() {
  // Return free plan since authentication is removed
  return NextResponse.json({
    plan: 'free',
    status: 'active'
  });
}