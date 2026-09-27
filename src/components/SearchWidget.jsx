'use client';

import React, { useState, useRef, useEffect } from 'react';

// Comprehensive Hybrid Directory: Local Domestic + Global International Airports
const AIRPORTS_DATABASE = [
  // --- Nigerian Domestic & Regional Hubs ---
  { code: 'LOS', name: 'Murtala Muhammed International Airport', city: 'Lagos', country: 'Nigeria' },
  { code: 'ABV', name: 'Nnamdi Azikiwe International Airport', city: 'Abuja', country: 'Nigeria' },
  { code: 'PHC', name: 'Port Harcourt International Airport', city: 'Port Harcourt', country: 'Nigeria' },
  { code: 'KAN', name: 'Mallam Aminu Kano International Airport', city: 'Kano', country: 'Nigeria' },
  { code: 'ENU', name: 'Akanu Ibiam International Airport', city: 'Enugu', country: 'Nigeria' },
  { code: 'QRW', name: 'Warri Airport (Osubi)', city: 'Warri', country: 'Nigeria' },
  { code: 'QUO', name: 'Akwa Ibom Airport (Victor Attah)', city: 'Uyo', country: 'Nigeria' },
  { code: 'CBQ', name: 'Margaret Ekpo International Airport', city: 'Calabar', country: 'Nigeria' },
  { code: 'BNI', name: 'Benin Airport', city: 'Benin City', country: 'Nigeria' },
  { code: 'ILR', name: 'Ilorin International Airport', city: 'Ilorin', country: 'Nigeria' },
  { code: 'KAD', name: 'Kaduna International Airport', city: 'Kaduna', country: 'Nigeria' },
  { code: 'SKO', name: 'Sadiq Abubakar III International Airport', city: 'Sokoto', country: 'Nigeria' },
  { code: 'MIU', name: 'Maiduguri International Airport', city: 'Maiduguri', country: 'Nigeria' },
  { code: 'YOL', name: 'Yola Airport', city: 'Yola', country: 'Nigeria' },
  { code: 'ABB', name: 'Asaba International Airport', city: 'Asaba', country: 'Nigeria' },
  { code: 'MDI', name: 'Makurdi Airport', city: 'Makurdi', country: 'Nigeria' },
  { code: 'MIN', name: 'Minna Airport', city: 'Minna', country: 'Nigeria' },
  { code: 'CCO', name: 'Hadejia Airport', city: 'Gombe', country: 'Nigeria' },
  { code: 'DNS', name: 'Dutse International Airport', city: 'Dutse', country: 'Nigeria' },

  // --- African Regional Hubs ---
  { code: 'ACC', name: 'Kotoka International Airport', city: 'Accra', country: 'Ghana' },
  { code: 'NBO', name: 'Jomo Kenyatta International Airport', city: 'Nairobi', country: 'Kenya' },
  { code: 'JNB', name: 'O. R. Tambo International Airport', city: 'Johannesburg', country: 'South Africa' },
  { code: 'CPT', name: 'Cape Town International Airport', city: 'Cape Town', country: 'South Africa' },
  { code: 'ADD', name: 'Addis Ababa Bole International Airport', city: 'Addis Ababa', country: 'Ethiopia' },
  { code: 'CAI', name: 'Cairo International Airport', city: 'Cairo', country: 'Egypt' },
  { code: 'CMN', name: 'Mohammed V International Airport', city: 'Casablanca', country: 'Morocco' },

  // --- Global International Hubs ---
  { code: 'LHR', name: 'Heathrow Airport', city: 'London', country: 'United Kingdom' },
  { code: 'LGW', name: 'Gatwick Airport', city: 'London', country: 'United Kingdom' },
  { code: 'CDG', name: 'Charles de Gaulle Airport', city: 'Paris', country: 'France' },
  { code: 'FRA', name: 'Frankfurt Airport', city: 'Frankfurt', country: 'Germany' },
  { code: 'AMS', name: 'Amsterdam Airport Schiphol', city: 'Amsterdam', country: 'Netherlands' },
  { code: 'DXB', name: 'Dubai International Airport', city: 'Dubai', country: 'United Arab Emirates' },
  { code: 'DOH', name: 'Hamad International Airport', city: 'Doha', country: 'Qatar' },
  { code: 'JED', name: 'King Abdulaziz International Airport', city: 'Jeddah', country: 'Saudi Arabia' },
  { code: 'IST', name: 'Istanbul Airport', city: 'Istanbul', country: 'Turkey' },
  { code: 'JFK', name: 'John F. Kennedy International Airport', city: 'New York', country: 'United States' },
  { code: 'IAD', name: 'Washington Dulles International Airport', city: 'Washington', country: 'United States' },
  { code: 'LAX', name: 'Los Angeles International Airport', city: 'Los Angeles', country: 'United States' },
  { code: 'YYZ', name: 'Toronto Pearson International Airport', city: 'Toronto', country: 'Canada' },
  { code: 'SIN', name: 'Singapore Changi Airport', city: 'Singapore', country: 'Singapore' },
  { code: 'BKK', name: 'Suvarnabhumi Airport', city: 'Bangkok', country: 'Thailand' }
];

export default function SearchWidget() {
  const [activeTab, setActiveTab] = useState('flights');
  const [tripType, setTripType] = useState('round-trip');

  // Input States
  const [fromQuery, setFromQuery] = useState('Lagos (LOS)');
  const [toQuery, setToQuery] = useState('');

  // Dropdown states
  const [activeField, setActiveField] = useState(null); // 'from' or 'to'
  const wrapperRef = useRef(null);

  // Spools out results instantly when query length >= 2
  const getFilteredAirports = (query) => {
    if (!query || query.length < 2) return [];
    const cleanQuery = query.toLowerCase();
    return AIRPORTS_DATABASE.filter(
      (item) =>
        item.city.toLowerCase().includes(cleanQuery) ||
        item.code.toLowerCase().includes(cleanQuery) ||
        item.name.toLowerCase().includes(cleanQuery) ||
        item.country.toLowerCase().includes(cleanQuery)
    );
  };

  const fromResults = activeField === 'from' ? getFilteredAirports(fromQuery) : [];
  const toResults = activeField === 'to' ? getFilteredAirports(toQuery) : [];

  // Close dropdown on outside clicks
  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setActiveField(null);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={wrapperRef} className="bg-white rounded-2xl shadow-xl p-6 border border-slate-100 relative">
      
      {/* Top Service Tabs */}
      <div className="flex items-center gap-6 border-b border-slate-100 pb-4 mb-6 text-sm font-semibold overflow-x-auto">
        <button 
          onClick={() => setActiveTab('flights')} 
          className={`flex items-center gap-2 pb-1 border-b-2 transition-colors ${activeTab === 'flights' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500'}`}
        >
          ✈️ Flights
        </button>
        <button 
          onClick={() => setActiveTab('hotels')} 
          className={`flex items-center gap-2 pb-1 border-b-2 transition-colors ${activeTab === 'hotels' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500'}`}
        >
          🏨 Hotels
        </button>
      </div>

      {/* Sub Trip Type Switcher */}
      <div className="flex items-center gap-3 mb-6 bg-slate-100 p-1 rounded-xl w-fit text-xs font-medium">
        <button onClick={() => setTripType('round-trip')} className={`px-4 py-2 rounded-lg transition-all ${tripType === 'round-trip' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'}`}>Round trip</button>
        <button onClick={() => setTripType('one-way')} className={`px-4 py-2 rounded-lg transition-all ${tripType === 'one-way' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'}`}>One way</button>
        <button onClick={() => setTripType('multi-city')} className={`px-4 py-2 rounded-lg transition-all ${tripType === 'multi-city' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'}`}>Multi-city</button>
      </div>

      {/* Search Inputs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 relative">
        
        {/* From Field */}
        <div className="border border-slate-200 rounded-xl p-3 bg-slate-50/50 relative">
          <label className="text-[10px] text-slate-400 block font-medium uppercase">From</label>
          <input 
            type="text" 
            value={fromQuery}
            onChange={(e) => {
              setFromQuery(e.target.value);
              setActiveField('from');
            }}
            onFocus={() => setActiveField('from')}
            className="w-full bg-transparent font-medium text-slate-900 focus:outline-none mt-1 text-sm" 
            placeholder="City or airport"
          />

          {/* Autocomplete Spool Dropdown */}
          {activeField === 'from' && fromResults.length > 0 && (
            <ul className="absolute left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-xl shadow-xl max-h-60 overflow-y-auto z-50">
              {fromResults.map((airport, idx) => (
                <li
                  key={`from-${airport.code}-${idx}`}
                  onClick={() => {
                    setFromQuery(`${airport.city} (${airport.code})`);
                    setActiveField(null);
                  }}
                  className="px-4 py-2.5 hover:bg-blue-50 cursor-pointer text-xs border-b border-slate-100 last:border-none flex justify-between items-center"
                >
                  <div>
                    <span className="font-bold text-slate-900 block">{airport.city} ({airport.code})</span>
                    <span className="text-slate-500 text-[10px]">{airport.name} · {airport.country}</span>
                  </div>
                  <span className="text-[10px] font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded-md shrink-0 ml-2">{airport.code}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* To Field */}
        <div className="border border-slate-200 rounded-xl p-3 bg-slate-50/50 relative">
          <label className="text-[10px] text-slate-400 block font-medium uppercase">To</label>
          <input 
            type="text" 
            value={toQuery}
            onChange={(e) => {
              setToQuery(e.target.value);
              setActiveField('to');
            }}
            onFocus={() => setActiveField('to')}
            placeholder="City or airport" 
            className="w-full bg-transparent font-medium text-slate-900 focus:outline-none mt-1 text-sm" 
          />

          {/* Autocomplete Spool Dropdown */}
          {activeField === 'to' && toResults.length > 0 && (
            <ul className="absolute left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-xl shadow-xl max-h-60 overflow-y-auto z-50">
              {toResults.map((airport, idx) => (
                <li
                  key={`to-${airport.code}-${idx}`}
                  onClick={() => {
                    setToQuery(`${airport.city} (${airport.code})`);
                    setActiveField(null);
                  }}
                  className="px-4 py-2.5 hover:bg-blue-50 cursor-pointer text-xs border-b border-slate-100 last:border-none flex justify-between items-center"
                >
                  <div>
                    <span className="font-bold text-slate-900 block">{airport.city} ({airport.code})</span>
                    <span className="text-slate-500 text-[10px]">{airport.name} · {airport.country}</span>
                  </div>
                  <span className="text-[10px] font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded-md shrink-0 ml-2">{airport.code}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Travellers Field */}
        <div className="border border-slate-200 rounded-xl p-3 bg-slate-50/50">
          <label className="text-[10px] text-slate-400 block font-medium uppercase">Travellers</label>
          <input type="text" className="w-full bg-transparent font-medium text-slate-900 focus:outline-none mt-1 text-sm" defaultValue="1 Adult, Economy" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="border border-slate-200 rounded-xl p-3 bg-slate-50/50">
          <label className="text-[10px] text-slate-400 block font-medium uppercase">Departure</label>
          <input type="date" className="w-full bg-transparent font-medium text-slate-900 focus:outline-none mt-1 text-sm" />
        </div>
        <div className="border border-slate-200 rounded-xl p-3 bg-slate-50/50">
          <label className="text-[10px] text-slate-400 block font-medium uppercase">Return</label>
          <input type="date" className="w-full bg-transparent font-medium text-slate-900 focus:outline-none mt-1 text-sm" />
        </div>
        <div className="flex items-end">
          <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 px-6 rounded-xl transition-all shadow-md text-sm">
            Search flights
          </button>
        </div>
      </div>

    </div>
  );
}
