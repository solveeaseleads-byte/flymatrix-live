'use client';

import React, { useState } from 'react';

export default function SearchWidget() {
  const [activeTab, setActiveTab] = useState('flights');
  const [tripType, setTripType] = useState('round-trip');

  return (
    <div className="bg-white rounded-2xl shadow-xl p-6 border border-slate-100">
      
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div className="border border-slate-200 rounded-xl p-3 bg-slate-50/50">
          <label className="text-[10px] text-slate-400 block font-medium uppercase">From</label>
          <input type="text" className="w-full bg-transparent font-medium text-slate-900 focus:outline-none mt-1 text-sm" defaultValue="Lagos (LOS)" />
        </div>
        <div className="border border-slate-200 rounded-xl p-3 bg-slate-50/50">
          <label className="text-[10px] text-slate-400 block font-medium uppercase">To</label>
          <input type="text" placeholder="City or airport" className="w-full bg-transparent font-medium text-slate-900 focus:outline-none mt-1 text-sm" />
        </div>
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
