import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/bars - Get all bars
export async function GET() {
  try {
    console.log('Fetching bars...');
    const bars = await prisma.bar.findMany({
      where: { active: true },
      select: {
        id: true,
        slug: true,
        name: true,
        description: true,
        location: true,
        logo: true,
        _count: {
          select: {
            drinks: true,
            users: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    });

    console.log('Found bars:', bars.length);
    return NextResponse.json(bars);
  } catch (error) {
    console.error('Error fetching bars:', error);
    return NextResponse.json(
      { error: 'Failed to fetch bars', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// POST /api/bars - Create a new bar
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { slug, name, description, location, email, phone, website, logo } = body;

    // Validate required fields
    if (!slug || !name) {
      return NextResponse.json(
        { error: 'Slug and name are required' },
        { status: 400 }
      );
    }

    // Check if slug already exists
    const existing = await prisma.bar.findUnique({
      where: { slug },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'Bar with this slug already exists' },
        { status: 409 }
      );
    }

    const bar = await prisma.bar.create({
      data: {
        slug,
        name,
        description,
        location,
        email,
        phone,
        website,
        logo,
      },
    });

    return NextResponse.json(bar, { status: 201 });
  } catch (error) {
    console.error('Error creating bar:', error);
    return NextResponse.json(
      { error: 'Failed to create bar' },
      { status: 500 }
    );
  }
}