'use client';

import React, { useState, useRef, useEffect } from 'react';

export default function SearchWidget() {
  const [activeTab, setActiveTab] = useState('flights');
  const [tripType, setTripType] = useState('round-trip');

  const [legs, setLegs] = useState([
    { from: 'Lagos (LOS)', to: 'London (LHR)', date: '' },
    { from: '', to: '', date: '' }
  ]);

  const [airportsDatabase, setAirportsDatabase] = useState([]);
  const [loadingAirports, setLoadingAirports] = useState(false);
  const [activeField, setActiveField] = useState(null); 
  const wrapperRef = useRef(null);

  // Lazy-load the complete global airport database on mount
  useEffect(() => {
    async function loadAirports() {
      setLoadingAirports(true);
      try {
        const response = await fetch('https://cdn.jsdelivr.net/npm/airports-json@1.0.0/index.json');
        const data = await response.json();
        // Normalize dataset fields to match component needs
        const formatted = data.map(item => ({
          code: item.iata || item.icao,
          name: item.name,
          city: item.city || item.name,
          country: item.country
        })).filter(item => item.code); // Keep only items with valid codes
        setAirportsDatabase(formatted);
      } catch (error) {
        console.error("Failed to load global airport directory", error);
      } finally {
        setLoadingAirports(false);
      }
    }
    loadAirports();
  }, []);

  // Global search filtering across all 28k+ airports
  const getFilteredAirports = (query) => {
    if (!query || query.length < 2 || airportsDatabase.length === 0) return [];
    const cleanQuery = query.toLowerCase();
    
    return airportsDatabase.filter(
      (item) =>
        (item.city && item.city.toLowerCase().includes(cleanQuery)) ||
        (item.code && item.code.toLowerCase().includes(cleanQuery)) ||
        (item.name && item.name.toLowerCase().includes(cleanQuery)) ||
        (item.country && item.country.toLowerCase().includes(cleanQuery))
    ).slice(0, 15); // Limit to top 15 results for instant rendering performance
  };

  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setActiveField(null);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const updateLegField = (index, field, value) => {
    const updated = [...legs];
    updated[index][field] = value;
    setLegs(updated);
  };

  const addMultiCityLeg = () => {
    setLegs([...legs, { from: '', to: '', date: '' }]);
  };

  const removeMultiCityLeg = (index) => {
    const updated = legs.filter((_, i) => i !== index);
    setLegs(updated);
  };

  return (
    <div ref={wrapperRef} className="bg-white rounded-2xl shadow-xl p-6 border border-slate-100 relative">
      
      {/* Top Tabs */}
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

      {/* Trip Type Switcher */}
      <div className="flex items-center gap-3 mb-6 bg-slate-100 p-1 rounded-xl w-fit text-xs font-medium">
        <button onClick={() => setTripType('round-trip')} className={`px-4 py-2 rounded-lg transition-all ${tripType === 'round-trip' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'}`}>Round trip</button>
        <button onClick={() => setTripType('one-way')} className={`px-4 py-2 rounded-lg transition-all ${tripType === 'one-way' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'}`}>One way</button>
        <button onClick={() => setTripType('multi-city')} className={`px-4 py-2 rounded-lg transition-all ${tripType === 'multi-city' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'}`}>Multi-city</button>
      </div>

      {/* Travellers Field */}
      <div className="mb-4">
        <div className="border border-slate-200 rounded-xl p-3 bg-slate-50/50 max-w-xs">
          <label className="text-[10px] text-slate-400 block font-medium uppercase">Travellers & Cabin</label>
          <input type="text" className="w-full bg-transparent font-medium text-slate-900 focus:outline-none mt-1 text-sm" defaultValue="1 Adult, Economy" />
        </div>
      </div>

      {/* Dynamic Legs */}
      {legs.map((leg, index) => {
        const fromResults = activeField?.index === index && activeField?.field === 'from' ? getFilteredAirports(leg.from) : [];
        const toResults = activeField?.index === index && activeField?.field === 'to' ? getFilteredAirports(leg.to) : [];

        return (
          <div key={index} className="p-4 mb-4 rounded-2xl border border-slate-200 bg-slate-50/30 relative">
            <div className="flex justify-between items-center mb-3">
              <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">Leg {index + 1}</span>
              {tripType === 'multi-city' && legs.length > 1 && (
                <button 
                  onClick={() => removeMultiCityLeg(index)} 
                  className="text-red-500 hover:text-red-700 text-xs font-semibold"
                >
                  Remove Leg ✕
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 relative">
              
              {/* From Input */}
              <div className="border border-slate-200 rounded-xl p-3 bg-white relative">
                <label className="text-[10px] text-slate-400 block font-medium uppercase">
                  {loadingAirports ? 'Loading global airports...' : `Leg ${index + 1} From`}
                </label>
                <input 
                  type="text" 
                  value={leg.from}
                  onChange={(e) => updateLegField(index, 'from', e.target.value)}
                  onFocus={() => setActiveField({ index, field: 'from' })}
                  className="w-full bg-transparent font-medium text-slate-900 focus:outline-none mt-1 text-sm" 
                  placeholder="Type city or airport (e.g. Jos, Lagos, LHR)"
                />

                {activeField?.index === index && activeField?.field === 'from' && fromResults.length > 0 && (
                  <ul className="absolute left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-xl shadow-xl max-h-60 overflow-y-auto z-50">
                    {fromResults.map((airport, idx) => (
                      <li
                        key={`from-${airport.code}-${idx}`}
                        onClick={() => {
                          updateLegField(index, 'from', `${airport.city} (${airport.code})`);
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

              {/* To Input */}
              <div className="border border-slate-200 rounded-xl p-3 bg-white relative">
                <label className="text-[10px] text-slate-400 block font-medium uppercase">Leg {index + 1} To</label>
                <input 
                  type="text" 
                  value={leg.to}
                  onChange={(e) => updateLegField(index, 'to', e.target.value)}
                  onFocus={() => setActiveField({ index, field: 'to' })}
                  placeholder="Type city or airport" 
                  className="w-full bg-transparent font-medium text-slate-900 focus:outline-none mt-1 text-sm" 
                />

                {activeField?.index === index && activeField?.field === 'to' && toResults.length > 0 && (
                  <ul className="absolute left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-xl shadow-xl max-h-60 overflow-y-auto z-50">
                    {toResults.map((airport, idx) => (
                      <li
                        key={`to-${airport.code}-${idx}`}
                        onClick={() => {
                          updateLegField(index, 'to', `${airport.city} (${airport.code})`);
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

              {/* Date Input */}
              <div className="border border-slate-200 rounded-xl p-3 bg-white">
                <label className="text-[10px] text-slate-400 block font-medium uppercase">Date</label>
                <input 
                  type="date" 
                  value={leg.date}
                  onChange={(e) => updateLegField(index, 'date', e.target.value)}
                  className="w-full bg-transparent font-medium text-slate-900 focus:outline-none mt-1 text-sm" 
                />
              </div>

            </div>
          </div>
        );
      })}

      {tripType === 'multi-city' && (
        <button 
          onClick={addMultiCityLeg} 
          className="mb-6 text-xs font-bold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-4 py-2.5 rounded-xl transition-all block"
        >
          + Add another flight leg
        </button>
      )}

      {/* Search Button */}
      <div>
        <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 px-6 rounded-xl transition-all shadow-md text-sm">
          Search flights
        </button>
      </div>

    </div>
  );
}
