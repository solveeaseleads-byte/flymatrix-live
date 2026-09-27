
'use client';

import React, { useState } from 'react';
import { generateTravelDeepLink } from '@/utils/travelpayouts';

export default function Home() {
  const [activeTab, setActiveTab] = useState('flights');
  const [tripType, setTripType] = useState('round-trip');
  const travelMarker = 'YOUR_TRAVELPAYOUTS_MARKER';

  // Sample offers matching your requested layout
  const offers = [
    { id: 1, route: 'Abuja → Doha', airline: 'Egyptair', duration: '12d', price: '₦2,541,012', img: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=500&auto=format&fit=crop&q=60' },
    { id: 2, route: 'Abuja → Lagos', airline: 'Aero', duration: '1d', price: '₦54,143', img: 'https://images.unsplash.com/photo-1578895101408-1a364fc4d187?w=500&auto=format&fit=crop&q=60' },
    { id: 3, route: 'Lagos → Washington', airline: 'Qatar Airways', duration: '20d', price: '₦2,312,446', img: 'https://images.unsplash.com/photo-1617581629397-a72507c3de9e?w=500&auto=format&fit=crop&q=60' },
    { id: 4, route: 'Lagos → Abuja', airline: 'Aero', duration: '1d', price: '₦44,681', img: 'https://images.unsplash.com/photo-1508873696983-2df5c920ac1c?w=500&auto=format&fit=crop&q=60' }
  ];

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 pb-16">
      
      {/* 1. Deep Blue Hero Header */}
      <section className="bg-gradient-to-b from-blue-900 to-blue-700 text-white pt-8 pb-32 px-4 relative">
        <div className="max-w-5xl mx-auto">
          <div className="mb-6">
            <span className="text-xs uppercase tracking-wider text-blue-200 font-semibold">YOUR TRAVEL SHOP FOR THE WORLD</span>
            <h1 className="text-3xl md:text-5xl font-extrabold mt-1">One shop, Multiple deals</h1>
            <p className="text-blue-100 text-sm mt-2">Trusted by 2M+ travelers · Flexible ways to pay on every booking.</p>
          </div>
        </div>
      </section>

      {/* 2. Floating Search Widget */}
      <section className="max-w-5xl mx-auto px-4 -mt-24 relative z-10">
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="border border-slate-200 rounded-xl p-3 bg-slate-50/50">
              <label className="text-xs text-slate-400 block font-medium uppercase">From</label>
              <input type="text" placeholder="City or airport" className="w-full bg-transparent font-medium text-slate-900 focus:outline-none mt-1" defaultValue="Lagos (LOS)" />
            </div>
            <div className="border border-slate-200 rounded-xl p-3 bg-slate-50/50">
              <label className="text-xs text-slate-400 block font-medium uppercase">To</label>
              <input type="text" placeholder="City or airport" className="w-full bg-transparent font-medium text-slate-900 focus:outline-none mt-1" placeholder="City or airport" />
            </div>
            <div className="border border-slate-200 rounded-xl p-3 bg-slate-50/50">
              <label className="text-xs text-slate-400 block font-medium uppercase">Travellers</label>
              <input type="text" className="w-full bg-transparent font-medium text-slate-900 focus:outline-none mt-1" defaultValue="1 Adult, Economy" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="border border-slate-200 rounded-xl p-3 bg-slate-50/50">
              <label className="text-xs text-slate-400 block font-medium uppercase">Departure</label>
              <input type="date" className="w-full bg-transparent font-medium text-slate-900 focus:outline-none mt-1" />
            </div>
            <div className="border border-slate-200 rounded-xl p-3 bg-slate-50/50">
              <label className="text-xs text-slate-400 block font-medium uppercase">Return</label>
              <input type="date" className="w-full bg-transparent font-medium text-slate-900 focus:outline-none mt-1" />
            </div>
            <div className="flex items-end">
              <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 px-6 rounded-xl transition-all shadow-md">
                Search flights
              </button>
            </div>
          </div>

        </div>
      </section>

      {/* 3. Top Destinations / Hotels Section */}
      <section className="max-w-5xl mx-auto px-4 mt-10">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-slate-900">Top Hotel Destinations</h3>
          <span className="text-sm font-semibold text-blue-600 cursor-pointer">See all →</span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { city: 'Dubai', hotels: '440+ HOTELS', country: 'United Arab Emirates', img: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=500&auto=format&fit=crop&q=60' },
            { city: 'London', hotels: '418+ HOTELS', country: 'United Kingdom', img: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=500&auto=format&fit=crop&q=60' },
            { city: 'Nairobi', hotels: '208+ HOTELS', country: 'Kenya', img: 'https://images.unsplash.com/photo-1618245318768-ab47c276a755?w=500&auto=format&fit=crop&q=60' },
            { city: 'Accra', hotels: '148+ HOTELS', country: 'Ghana', img: 'https://images.unsplash.com/photo-1583088514729-1662d5f8bc27?w=500&auto=format&fit=crop&q=60' }
          ].map((dest, idx) => (
            <div key={idx} className="bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-md transition-all">
              <img src={dest.img} alt={dest.city} className="w-full h-32 object-cover" />
              <div className="p-3">
                <span className="text-[10px] font-bold text-blue-600 tracking-wider block">{dest.hotels}</span>
                <h4 className="font-bold text-slate-900 text-base">{dest.city}</h4>
                <p className="text-xs text-slate-400 truncate">{dest.country}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. Offers Grid with BOOK NOW Buttons */}
      <section className="max-w-5xl mx-auto px-4 mt-10">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-slate-900">Offers</h3>
          <span className="text-sm font-semibold text-blue-600 cursor-pointer">VIEW ALL →</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {offers.map((offer) => {
            const deepLink = generateTravelDeepLink('https://www.aviasales.com', travelMarker, { subId: 'offer_card' });
            return (
              <div key={offer.id} className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <img src={offer.img} alt={offer.route} className="w-20 h-20 rounded-xl object-cover" />
                  <div>
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">FLIGHTS</span>
                    <h4 className="font-bold text-slate-900 text-base">{offer.route}</h4>
                    <p className="text-xs text-slate-500 mt-1">{offer.airline} · {offer.duration} · From <strong className="text-slate-900">{offer.price}</strong></p>
                  </div>
                </div>
                <a 
                  href={deepLink} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="bg-blue-50 hover:bg-blue-600 text-blue-600 hover:text-white font-bold text-xs py-2 px-4 rounded-xl transition-all border border-blue-100 whitespace-nowrap"
                >
                  BOOK NOW
                </a>
              </div>
            );
          })}
        </div>
      </section>

      {/* 5. Bottom Prime Banner */}
      <section className="max-w-5xl mx-auto px-4 mt-10">
        <div className="bg-gradient-to-r from-blue-900 to-slate-900 text-white rounded-3xl p-6 md:p-8 shadow-lg">
          <span className="text-xs font-bold bg-amber-500 text-slate-900 px-3 py-1 rounded-full uppercase tracking-wider">⭐ PRIME DEALS</span>
          <h3 className="text-2xl font-bold mt-3">Save up to 20% on every booking</h3>
          <p className="text-blue-200 text-sm mt-1 mb-6">Join FlyMatrix Prime and unlock exclusive discounts on flights, hotels and holiday packages.</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-blue-100">
            <div>✓ Up to 20% off flights & hotels</div>
            <div>✓ Priority customer support</div>
            <div>✓ Free cancellation on select bookings</div>
            <div>✓ Early access to flash sales</div>
          </div>
        </div>
      </section>

    </div>
  );
}
