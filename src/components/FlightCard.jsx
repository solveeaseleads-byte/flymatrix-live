import React from 'react';
import { generateTravelDeepLink } from '@/utils/travelpayouts';

export default function FlightCard({ flight }) {
  // Retrieve the marker from your environment variables
  const travelMarker = process.env.NEXT_PUBLIC_TRAVELPAYOUTS_MARKER || 'YOUR_TRAVELPAYOUTS_MARKER';

  // Build the monetized tracking link
  const bookingUrl = generateTravelDeepLink(flight.rawDeepLink || 'https://www.aviasales.com', travelMarker, {
    subId: 'flymatrix_flight_card',
    params: {
      currency: flight.currency || 'USD',
      adults: flight.passengers || 1
    }
  });

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 transition-all hover:shadow-md">
      {/* Flight Info Details */}
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-slate-50 rounded-lg flex items-center justify-center font-bold text-slate-700">
          {flight.airlineCode}
        </div>
        <div>
          <h4 className="font-semibold text-slate-900">{flight.airlineName}</h4>
          <p className="text-sm text-slate-500">{flight.departureTime} — {flight.arrivalTime} ({flight.duration})</p>
        </div>
      </div>

      {/* Pricing & Outbound Action */}
      <div className="flex items-center justify-between w-full md:w-auto gap-6 border-t md:border-t-0 pt-4 md:pt-0 border-slate-100">
        <div className="text-right">
          <span className="text-xs text-slate-400 block">From</span>
          <span className="text-xl font-bold text-slate-900">{flight.currencySymbol}{flight.price}</span>
        </div>
        
        <a 
          href={bookingUrl} 
          target="_blank" 
          rel="noopener noreferrer"
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-5 py-2.5 rounded-lg text-sm transition-colors shadow-sm"
        >
          Book Flight
        </a>
      </div>
    </div>
  );
}
