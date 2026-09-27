import React from 'react';
import { generateTravelDeepLink } from '@/utils/travelpayouts';
import SearchWidget from '@/components/SearchWidget';

export default function Home() {
  const travelMarker = 'YOUR_TRAVELPAYOUTS_MARKER';

  const offers = [
    { id: 1, route: 'Abuja → Doha', airline: 'Egyptair', duration: '12d', price: '₦2,541,012', img: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=500&auto=format&fit=crop&q=60' },
    { id: 2, route: 'Abuja → Lagos', airline: 'Aero', duration: '1d', price: '₦54,143', img: 'https://images.unsplash.com/photo-1578895101408-1a364fc4d187?w=500&auto=format&fit=crop&q=60' },
    { id: 3, route: 'Lagos → Washington', airline: 'Qatar Airways', duration: '20d', price: '₦2,312,446', img: 'https://images.unsplash.com/photo-1617581629397-a72507c3de9e?w=500&auto=format&fit=crop&q=60' },
    { id: 4, route: 'Lagos → Abuja', airline: 'Aero', duration: '1d', price: '₦44,681', img: 'https://images.unsplash.com/photo-1508873696983-2df5c920ac1c?w=500&auto=format&fit=crop&q=60' }
  ];

  return (
    <main className="min-h-screen bg-slate-50 font-sans text-slate-800 pb-16">
      
      {/* 1. Deep Blue Hero Header with Top Navbar Alignment */}
      <section className="bg-gradient-to-b from-blue-900 to-blue-700 text-white pt-4 pb-32 px-4 relative">
        <div className="max-w-6xl mx-auto">
          
          {/* Top Navbar Row */}
          <header className="flex items-center justify-between border-b border-blue-800/60 pb-4 mb-8">
            <div className="flex items-center gap-8">
              <span className="font-extrabold text-lg tracking-tight flex items-center gap-2">
                ✈️ FLYMATRIX
              </span>
              <nav className="hidden md:flex items-center gap-6 text-xs font-medium text-blue-100">
                <a href="#" className="hover:text-white transition-colors">Flights</a>
                <a href="#" className="hover:text-white transition-colors">Hotels</a>
                <a href="#" className="hover:text-white transition-colors">Packages</a>
                <a href="#" className="hover:text-white transition-colors">Tours</a>
                <a href="#" className="hover:text-white transition-colors">Visa</a>
                <a href="#" className="hover:text-white transition-colors">Prime</a>
              </nav>
            </div>

            <div className="flex items-center gap-3">
              <div className="bg-blue-800/80 text-white px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 border border-blue-700">
                🇳🇬 NGN (₦) ▾
              </div>
              <div className="w-8 h-8 rounded-full bg-blue-800 flex items-center justify-center text-xs font-bold border border-blue-700">
                👤
              </div>
            </div>
          </header>

          {/* Hero Titles */}
          <div>
            <span className="text-[10px] uppercase tracking-wider text-blue-200 font-semibold">YOUR TRAVEL SHOP FOR THE WORLD</span>
            <h1 className="text-3xl md:text-5xl font-extrabold mt-1">One shop, Multiple deals</h1>
            <p className="text-blue-100 text-xs md:text-sm mt-2 flex flex-wrap gap-y-1 gap-x-3">
              <span>Trusted by 2M+ travelers</span> · <span>Flexible ways to pay on every booking</span>
            </p>
          </div>
        </div>
      </section>

      {/* 2. Floating Search Widget Container */}
      <section className="max-w-5xl mx-auto px-4 -mt-24 relative z-10">
        <SearchWidget />
      </section>

      {/* 3. Top Destinations Section */}
      <section className="max-w-5xl mx-auto px-4 mt-10">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-slate-900">Top Hotel Destinations</h2>
          <span className="text-xs font-semibold text-blue-600 cursor-pointer">See all →</span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { city: 'Dubai', hotels: '440+ HOTELS', country: 'United Arab Emirates', img: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=500&auto=format&fit=crop&q=60' },
            { city: 'London', hotels: '418+ HOTELS', country: 'United Kingdom', img: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=500&auto=format&fit=crop&q=60' },
            { city: 'Nairobi', hotels: '208+ HOTELS', country: 'Kenya', img: 'https://images.unsplash.com/photo-1618245318768-ab47c276a755?w=500&auto=format&fit=crop&q=60' },
            { city: 'Accra', hotels: '148+ HOTELS', country: 'Ghana', img: 'https://images.unsplash.com/photo-1583088514729-1662d5f8bc27?w=500&auto=format&fit=crop&q=60' }
          ].map((dest, idx) => (
            <div key={idx} className="bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-md transition-all">
              <img src={dest.img} alt={dest.city} className="w-full h-28 object-cover" />
              <div className="p-3">
                <span className="text-[9px] font-bold text-blue-600 tracking-wider block">{dest.hotels}</span>
                <h3 className="font-bold text-slate-900 text-sm">{dest.city}</h3>
                <p className="text-[11px] text-slate-400 truncate">{dest.country}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. Offers Grid with BOOK NOW Buttons */}
      <section className="max-w-5xl mx-auto px-4 mt-10">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-slate-900">Offers</h2>
          <span className="text-xs font-semibold text-blue-600 cursor-pointer">VIEW ALL →</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {offers.map((offer) => {
            const deepLink = generateTravelDeepLink('https://www.aviasales.com', travelMarker, { subId: 'offer_card' });
            return (
              <div key={offer.id} className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <img src={offer.img} alt={offer.route} className="w-16 h-16 rounded-xl object-cover shrink-0" />
                  <div>
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">FLIGHTS</span>
                    <h3 className="font-bold text-slate-900 text-sm">{offer.route}</h3>
                    <p className="text-[11px] text-slate-500 mt-0.5">{offer.airline} · {offer.duration} · From <strong className="text-slate-900">{offer.price}</strong></p>
                  </div>
                </div>
                <a 
                  href={deepLink} 
                  target="_blank" 
                  rel="nofollow noopener noreferrer"
                  className="bg-blue-50 hover:bg-blue-600 text-blue-600 hover:text-white font-bold text-[11px] py-2 px-3.5 rounded-xl transition-all border border-blue-100 whitespace-nowrap"
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
          <span className="text-[10px] font-bold bg-amber-500 text-slate-900 px-2.5 py-1 rounded-full uppercase tracking-wider">⭐ PRIME DEALS</span>
          <h2 className="text-xl md:text-2xl font-bold mt-3">Save up to 20% on every booking</h2>
          <p className="text-blue-200 text-xs md:text-sm mt-1 mb-6">Join FlyMatrix Prime and unlock exclusive discounts on flights, hotels and holiday packages.</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-blue-100">
            <div>✓ Up to 20% off flights & hotels</div>
            <div>✓ Priority customer support</div>
            <div>✓ Free cancellation on select bookings</div>
            <div>✓ Early access to flash sales</div>
          </div>
        </div>
      </section>

    </main>
  );
}
