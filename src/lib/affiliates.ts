// src/lib/affiliates.ts

type TravelVertical = 'flights' | 'trains' | 'transfers';

interface AffiliateLinkOptions {
  origin?: string;         // Required IATA code for flights (e.g., 'LIS')
  destination: string;     // Required destination city or IATA code
  vertical: TravelVertical;
  date?: string;           // Optional travel date string (YYYY-MM-DD)
  subId?: string;          // Optional granular tracking identifier (e.g., 'portugal-edu')
}

export function generateTravelpayoutsDeepLink({
  origin,
  destination,
  vertical,
  date,
  subId,
}: AffiliateLinkOptions): string {
  // Retrieve the master affiliate marker from production environment variables
  const marker = process.env.NEXT_PUBLIC_TRAVELPAYOUTS_MARKER;

  if (!marker) {
    throw new Error('❌ [FlyMatrix Fatal]: NEXT_PUBLIC_TRAVELPAYOUTS_MARKER environment variable is missing in production.');
  }

  // Handle optional SubID appending format for granular analytics tracking
  const trackingMarker = subId ? `${marker}.${subId}` : marker;
  const params = new URLSearchParams();
  params.append('marker', trackingMarker);

  let targetUrl = '';

  switch (vertical) {
    case 'flights': {
      if (!origin) {
        throw new Error('❌ [FlyMatrix Error]: Flight vertical requires an explicit origin IATA code.');
      }
      const cleanOrigin = origin.toUpperCase();
      const cleanDest = destination.toUpperCase();
      
      targetUrl = `https://www.aviasales.com/search/${cleanOrigin}${cleanDest}`;
      if (date) {
        params.append('depart_date', date);
      }
      break;
    }

    case 'trains': {
      targetUrl = 'https://www.omio.com/';
      params.append('search_destination', destination);
      if (date) {
        params.append('date', date);
      }
      break;
    }

    case 'transfers': {
      targetUrl = 'https://kiwitaxi.com/search';
      params.append('to', destination);
      if (date) {
        params.append('date', date);
      }
      break;
    }

    default:
      throw new Error(`❌ [FlyMatrix Fatal]: Unsupported travel vertical specified: ${vertical}`);
  }

  return `${targetUrl}?${params.toString()}`;
}
