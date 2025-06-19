import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const type = searchParams.get('type') || 'ale';
  const search = searchParams.get('search');

  try {
    // Validate beer type
    const validTypes = ['ale', 'stouts', 'red-ale'];
    const beerType = validTypes.includes(type) ? type : 'ale';
    
    console.log(`Fetching beers of type: ${beerType}`);
    
    const response = await fetch(`https://api.sampleapis.com/beers/${beerType}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; NextJS-App)',
      },
    });
    
    console.log(`Beer API response status: ${response.status}`);
    
    if (!response.ok) {
      console.error(`Beer API error: ${response.status} ${response.statusText}`);
      // Return empty array instead of throwing error
      return NextResponse.json({ beers: [] });
    }
    
    const data = await response.json();
    console.log(`Beer API returned ${Array.isArray(data) ? data.length : 'non-array'} items`);
    
    // Ensure we have an array
    if (!Array.isArray(data)) {
      console.error('Beer API returned non-array:', typeof data);
      return NextResponse.json({ beers: [] });
    }
    
    // Filter by search term if provided
    let beers = data;
    if (search) {
      beers = data.filter((beer: unknown) => {
        const beerObj = beer as { name?: string };
        return beerObj.name?.toLowerCase().includes(search.toLowerCase());
      });
    }
    
    // Limit results and ensure we have valid data
    beers = beers.slice(0, 20).filter((beer: unknown) => {
      const beerObj = beer as { name?: string; price?: string };
      return beerObj && beerObj.name && beerObj.price;
    });
    
    return NextResponse.json({ beers });
  } catch (error) {
    console.error('Error in beer API route:', error);
    // Always return a successful response with empty data rather than 500
    return NextResponse.json({ 
      beers: [],
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 200 }); // Return 200 instead of 500
  }
}