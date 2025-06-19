import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const type = searchParams.get('type') || 'reds';
  const search = searchParams.get('search');

  try {
    // Validate wine type
    const validTypes = ['reds', 'whites', 'sparkling', 'rose', 'dessert', 'port'];
    const wineType = validTypes.includes(type) ? type : 'reds';
    
    console.log(`Fetching wines of type: ${wineType}`);
    
    const response = await fetch(`https://api.sampleapis.com/wines/${wineType}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; NextJS-App)',
      },
    });
    
    console.log(`Wine API response status: ${response.status}`);
    
    if (!response.ok) {
      console.error(`Wine API error: ${response.status} ${response.statusText}`);
      // Return empty array instead of throwing error
      return NextResponse.json({ wines: [] });
    }
    
    const data = await response.json();
    console.log(`Wine API returned ${Array.isArray(data) ? data.length : 'non-array'} items`);
    
    // Ensure we have an array
    if (!Array.isArray(data)) {
      console.error('Wine API returned non-array:', typeof data);
      return NextResponse.json({ wines: [] });
    }
    
    // Filter by search term if provided
    let wines = data;
    if (search) {
      wines = data.filter((wine: any) => 
        wine.wine?.toLowerCase().includes(search.toLowerCase()) ||
        wine.winery?.toLowerCase().includes(search.toLowerCase())
      );
    }
    
    // Limit results and ensure we have valid data
    wines = wines.slice(0, 20).filter((wine: any) => wine && wine.wine && wine.winery);
    
    return NextResponse.json({ wines });
  } catch (error) {
    console.error('Error in wine API route:', error);
    // Always return a successful response with empty data rather than 500
    return NextResponse.json({ 
      wines: [],
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 200 }); // Return 200 instead of 500
  }
}