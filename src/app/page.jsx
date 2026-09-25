"use client";

import { useState, useEffect } from 'react';

export default function FlyMatrixDashboard() {
  const [activeTab, setActiveTab] = useState('flights');
  const [status, setStatus] = useState(null);

  // Form states
  const [searchForm, setSearchForm] = useState({ origin: 'LOS', destination: 'JFK', departureDate: '2026-06-01' });
  const [searchResult, setSearchResult] = useState(null);
  
  const [leadForm, setLeadForm] = useState({ contact: '', origin: 'LOS', destination: 'LHR', departureDate: '' });
  const [leadStatus, setLeadStatus] = useState('');

  const [alertForm, setAlertForm] = useState({ email: '', origin: 'LOS', destination: 'CDG', departureDate: '' });
  const [alertStatus, setAlertStatus] = useState('');

  // Fetch System Status on mount
  useEffect(() => {
    fetch('http://localhost:10000/api/system/status')
      .then(res => res.json())
      .then(data => setStatus(data))
      .catch(err => console.error('Backend offline', err));
  }, []);

  // Handle Flight Search
  const handleFlightSearch = async (e) => {
    e.preventDefault();
    const res = await fetch('http://localhost:10000/api/flights/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(searchForm)
    });
    const data = await res.json();
    setSearchResult(data);
  };

  // Handle Lead Interceptor
  const handleLeadSubmit = async (e) => {
    e.preventDefault();
    const res = await fetch('http://localhost:10000/api/intercept', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(leadForm)
    });
    const data = await res.json();
    setLeadStatus(data.ok ? 'Lead captured successfully!' : data.error);
  };

  // Handle Fare Alert
  const handleAlertSubmit = async (e) => {
    e.preventDefault();
    const res = await fetch('http://localhost:10000/api/fare-alert', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(alertForm)
    });
    const data = await res.json();
    setAlertStatus(data.ok ? 'Fare alert registered!' : data.error);
  };

  // Track Affiliate Click
  const trackClick = async (partner, category, route) => {
    await fetch('http://localhost:10000/api/affiliate/click', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ partner, category, route })
    });
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 p-6 font-sans">
      <header className="max-w-6xl mx-auto flex justify-between items-center pb-6 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-emerald-400">FlyMatrix Intelligence</h1>
          <p className="text-sm text-slate-400">Centralized Travel & Affiliate Command Center</p>
        </div>
        <div className="flex items-center gap-3">
          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${status?.database ? 'bg-emerald-900/50 text-emerald-300 border border-emerald-700' : 'bg-amber-900/50 text-amber-300 border border-amber-700'}`}>
            DB: {status?.database ? 'Connected' : 'Offline'}
          </span>
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-800 text-slate-300 border border-slate-700">
            Partners: {status?.partnerCount || 7} Active
          </span>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="max-w-6xl mx-auto flex gap-2 my-6 overflow-x-auto pb-2">
        {['flights', 'leads', 'alerts', 'affiliates', 'system'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${activeTab === tab ? 'bg-emerald-600 text-white' : 'bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-slate-200'}`}
          >
            {tab}
          </button>
        ))}
      </nav>

      {/* Main Content Sections */}
      <section className="max-w-6xl mx-auto bg-slate-900/60 border border-slate-800 rounded-xl p-6 shadow-xl">
        
        {/* FLIGHTS TAB */}
        {activeTab === 'flights' && (
          <div>
            <h2 className="text-xl font-semibold mb-4 text-emerald-300">Flight Search & Route Intelligence</h2>
            <form onSubmit={handleFlightSearch} className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
              <div>
                <label className="block text-xs text-slate-400 mb-1">Origin (IATA)</label>
                <input 
                  type="text" 
                  value={searchForm.origin} 
                  onChange={e => setSearchForm({...searchForm, origin: e.target.value})}
                  className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-sm text-white" 
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Destination (IATA)</label>
                <input 
                  type="text" 
                  value={searchForm.destination} 
                  onChange={e => setSearchForm({...searchForm, destination: e.target.value})}
                  className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-sm text-white" 
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Departure Date</label>
                <input 
                  type="date" 
                  value={searchForm.departureDate} 
                  onChange={e => setSearchForm({...searchForm, departureDate: e.target.value})}
                  className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-sm text-white" 
                />
              </div>
              <div className="flex items-end">
                <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-medium py-2 rounded text-sm transition-colors">
                  Search Route
                </button>
              </div>
            </form>

            {searchResult && (
              <div className="bg-slate-950 border border-slate-800 p-4 rounded-lg">
                <h3 className="text-sm font-semibold text-slate-300 mb-2">Search Response (Request ID: {searchResult.requestId})</h3>
                <pre className="text-xs text-emerald-400 overflow-x-auto p-2 bg-slate-900 rounded">
                  {JSON.stringify(searchResult, null, 2)}
                </pre>
              </div>
            )}
          </div>
        )}

        {/* LEADS TAB */}
        {activeTab === 'leads' && (
          <div>
            <h2 className="text-xl font-semibold mb-4 text-emerald-300">Inbound Lead Interceptor</h2>
            <form onSubmit={handleLeadSubmit} className="max-w-lg space-y-4">
              <div>
                <label className="block text-xs text-slate-400 mb-1">Email or WhatsApp Contact</label>
                <input 
                  type="text" 
                  placeholder="user@example.com or +234..." 
                  value={leadForm.contact}
                  onChange={e => setLeadForm({...leadForm, contact: e.target.value})}
                  className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-sm text-white"
                  required 
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <input 
                  type="text" 
                  placeholder="Origin" 
                  value={leadForm.origin}
                  onChange={e => setLeadForm({...leadForm, origin: e.target.value})}
                  className="bg-slate-950 border border-slate-700 rounded p-2 text-sm text-white" 
                />
                <input 
                  type="text" 
                  placeholder="Destination" 
                  value={leadForm.destination}
                  onChange={e => setLeadForm({...leadForm, destination: e.target.value})}
                  className="bg-slate-950 border border-slate-700 rounded p-2 text-sm text-white" 
                />
              </div>
              <button type="submit" className="bg-emerald-600 hover:bg-emerald-500 text-white font-medium py-2 px-4 rounded text-sm">
                Submit Lead Request
              </button>
              {leadStatus && <p className="text-sm text-emerald-400 mt-2">{leadStatus}</p>}
            </form>
          </div>
        )}

        {/* ALERTS TAB */}
        {activeTab === 'alerts' && (
          <div>
            <h2 className="text-xl font-semibold mb-4 text-emerald-300">Fare Alert Subscription</h2>
            <form onSubmit={handleAlertSubmit} className="max-w-lg space-y-4">
              <div>
                <label className="block text-xs text-slate-400 mb-1">Email Address</label>
                <input 
                  type="email" 
                  placeholder="traveller@domain.com" 
                  value={alertForm.email}
                  onChange={e => setAlertForm({...alertForm, email: e.target.value})}
                  className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-sm text-white"
                  required 
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <input 
                  type="text" 
                  placeholder="Origin" 
                  value={alertForm.origin}
                  onChange={e => setAlertForm({...alertForm, origin: e.target.value})}
                  className="bg-slate-950 border border-slate-700 rounded p-2 text-sm text-white" 
                />
                <input 
                  type="text" 
                  placeholder="Destination" 
                  value={alertForm.destination}
                  onChange={e => setAlertForm({...alertForm, destination: e.target.value})}
                  className="bg-slate-950 border border-slate-700 rounded p-2 text-sm text-white" 
                />
              </div>
              <button type="submit" className="bg-emerald-600 hover:bg-emerald-500 text-white font-medium py-2 px-4 rounded text-sm">
                Activate Price Alert
              </button>
              {alertStatus && <p className="text-sm text-emerald-400 mt-2">{alertStatus}</p>}
            </form>
          </div>
        )}

        {/* AFFILIATES TAB */}
        {activeTab === 'affiliates' && (
          <div>
            <h2 className="text-xl font-semibold mb-4 text-emerald-300">Partner & Affiliate Redirects</h2>
            <p className="text-sm text-slate-400 mb-4">Clicking any partner link securely routes through the backend click tracker (`/api/go/:partner`).</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { id: 'aviasales', name: 'Aviasales (Flights)', cat: 'flight' },
                { id: 'ivisa', name: 'iVisa (Travel Documentation)', cat: 'visa' },
                { id: 'booking', name: 'Booking.com (Hotels)', cat: 'hotel' },
                { id: 'airalo', name: 'Airalo (eSIMs)', cat: 'esim' },
                { id: 'airhelp', name: 'AirHelp (Flight Assistance)', cat: 'flight-assistance' }
              ].map(partner => (
                <a
                  key={partner.id}
                  href={`http://localhost:10000/api/go/${partner.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => trackClick(partner.id, partner.cat, 'GLOBAL')}
                  className="block bg-slate-950 border border-slate-800 p-4 rounded-lg hover:border-emerald-500 transition-colors"
                >
                  <h3 className="font-medium text-white text-sm">{partner.name}</h3>
                  <span className="text-xs text-emerald-400 mt-1 inline-block">Launch Partner →</span>
                </a>
              ))}
            </div>
          </div>
        )}

        {/* SYSTEM STATUS TAB */}
        {activeTab === 'system' && (
          <div>
            <h2 className="text-xl font-semibold mb-4 text-emerald-300">System & Integration Status</h2>
            <pre className="text-xs text-emerald-400 bg-slate-950 p-4 rounded border border-slate-800 overflow-x-auto">
              {JSON.stringify(status, null, 2)}
            </pre>
          </div>
        )}

      </section>
    </main>
  );
}
