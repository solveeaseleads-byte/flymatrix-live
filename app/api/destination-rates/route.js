import { NextResponse } from 'next/server';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const city = searchParams.get('city') || 'Paris';
  const iataCode = searchParams.get('iata') || 'PAR'; // Destination IATA code

  const API_KEY = process.env.TRAVELPAYOUTS_API_KEY;
  const MARKER = process.env.TRAVELPAYOUTS_MARKER_ID || '123456';

  try {
    // Example call to a travel affiliate pricing endpoint (e.g., Travelpayouts flight/hotel data)
    // const externalRes = await fetch(`https://api.travelpayouts.com/v1/prices/cheap?origin=LOS&destination=${iataCode}&token=${API_KEY}`);
    // const externalData = await externalRes.json();

    // For demonstration, processing live-mapped data structure based on the query:
    const liveData = {
      destination: city,
      // You can parse external API prices here dynamically:
      budgetDaily: '€45 - €75 / day', 
      midRangeDaily: '€90 - €160 / day',
      luxuryDaily: '€220+ / day',
      peakSeason: 'June to September',
      // Generate your official affiliate tracking link dynamically with your marker
      affiliateBookingUrl: `https://www.travelpayouts.com/flights?marker=${MARKER}&destination=${iataCode}`
    };

    return NextResponse.json({ success: true, data: liveData });
  } catch (error) {
    console.error('Affiliate API Error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch live partner rates' }, { status: 500 });
  }
}
