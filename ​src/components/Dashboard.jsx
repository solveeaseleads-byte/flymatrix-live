import React, { useState } from "react";

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("flights");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  // Form states
  const [flightForm, setFlightForm] = useState({ origin: "LOS", destination: "JFK", date: "2026-10-01" });
  const [costDest, setCostDest] = useState("JFK");
  const [weatherCity, setWeatherCity] = useState("New York");
  const [visaForm, setVisaForm] = useState({ passport: "NGA", destination: "USA" });

  const apiBase = ""; // Uses relative paths matching your Render domain

  const fetchApi = async (endpoint, params = {}) => {
    setLoading(true);
    setResult(null);
    try {
      const query = new URLSearchParams(params).toString();
      const res = await fetch(`${apiBase}/api/${endpoint}?${query}`);
      const data = await res.json();
      setResult(data);
    } catch (err) {
      setResult({ success: false, error: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-6 font-sans">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <header className="mb-8 border-b border-slate-800 pb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-cyan-400">FlyMatrix Intelligence</h1>
            <p className="text-sm text-slate-400">Centralized Travel Aggregation & Destination Intelligence</p>
          </div>
          <div className="flex gap-2">
            <a href="/go?partner=skyscanner" target="_blank" rel="noreferrer" className="px-3 py-1.5 text-xs font-semibold bg-cyan-600 hover:bg-cyan-500 rounded text-white transition">
              Book Flights
            </a>
            <a href="/go?partner=radicalstorage" target="_blank" rel="noreferrer" className="px-3 py-1.5 text-xs font-semibold bg-slate-800 hover:bg-slate-700 rounded text-slate-200 transition">
              Luggage Storage
            </a>
          </div>
        </header>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2 mb-6 border-b border-slate-800 pb-2">
          {["flights", "truecost", "weather", "visa"].map((tab) => (
            <button
              key={tab}
              onClick={() => { setActiveTab(tab); setResult(null); }}
              className={`px-4 py-2 text-sm font-medium rounded-lg capitalize transition ${
                activeTab === tab ? "bg-cyan-500 text-slate-950 font-semibold" : "bg-slate-900 text-slate-400 hover:bg-slate-800"
              }`}
            >
              {tab === "truecost" ? "True-Cost" : tab}
            </button>
          ))}
        </div>

        {/* Interactive Workspace */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Controls Panel */}
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl shadow-lg space-y-4 md:col-span-1">
            <h2 className="text-lg font-semibold capitalize text-cyan-300">{activeTab} Parameters</h2>

            {activeTab === "flights" && (
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Origin Airport</label>
                  <input type="text" value={flightForm.origin} onChange={(e) => setFlightForm({ ...flightForm, origin: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-sm text-white uppercase" />
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Destination Airport</label>
                  <input type="text" value={flightForm.destination} onChange={(e) => setFlightForm({ ...flightForm, destination: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-sm text-white uppercase" />
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Departure Date</label>
                  <input type="date" value={flightForm.date} onChange={(e) => setFlightForm({ ...flightForm, date: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-sm text-white" />
                </div>
                <button onClick={() => fetchApi("flights", flightForm)} className="w-full mt-2 py-2 bg-cyan-600 hover:bg-cyan-500 font-semibold text-sm rounded text-white transition">
                  {loading ? "Searching..." : "Search Inventory"}
                </button>
              </div>
            )}

            {activeTab === "truecost" && (
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Destination Code</label>
                  <input type="text" value={costDest} onChange={(e) => setCostDest(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-sm text-white uppercase" />
                </div>
                <button onClick={() => fetchApi("true-cost", { destination: costDest })} className="w-full mt-2 py-2 bg-cyan-600 hover:bg-cyan-500 font-semibold text-sm rounded text-white transition">
                  {loading ? "Calculating..." : "Get Cost Breakdown"}
                </button>
              </div>
            )}

            {activeTab === "weather" && (
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">City Name</label>
                  <input type="text" value={weatherCity} onChange={(e) => setWeatherCity(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-sm text-white" />
                </div>
                <button onClick={() => fetchApi("weather", { city: weatherCity })} className="w-full mt-2 py-2 bg-cyan-600 hover:bg-cyan-500 font-semibold text-sm rounded text-white transition">
                  {loading ? "Checking..." : "Fetch Weather Intelligence"}
                </button>
              </div>
            )}

            {activeTab === "visa" && (
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Passport Country</label>
                  <input type="text" value={visaForm.passport} onChange={(e) => setVisaForm({ ...visaForm, passport: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-sm text-white uppercase" />
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Destination Country</label>
                  <input type="text" value={visaForm.destination} onChange={(e) => setVisaForm({ ...visaForm, destination: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-sm text-white uppercase" />
                </div>
                <button onClick={() => fetchApi("visa", visaForm)} className="w-full mt-2 py-2 bg-cyan-600 hover:bg-cyan-500 font-semibold text-sm rounded text-white transition">
                  {loading ? "Verifying..." : "Check Visa Requirements"}
                </button>
              </div>
            )}
          </div>

          {/* Results Output Panel */}
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl shadow-lg md:col-span-2 flex flex-col justify-between">
            <div>
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Telemetry Output</h3>
              {loading && <p className="text-sm text-cyan-400 animate-pulse">Communicating with backend services...</p>}
              {!loading && !result && <p className="text-sm text-slate-500 italic">Select parameters on the left and execute a query to display results.</p>}
              {!loading && result && (
                <pre className="bg-slate-950 p-4 rounded border border-slate-800 text-xs text-cyan-300 overflow-x-auto font-mono">
                  {JSON.stringify(result, null, 2)}
                </pre>
              )}
            </div>
            <div className="mt-6 pt-4 border-t border-slate-800 text-xs text-slate-500 flex justify-between items-center">
              <span>Status: Operational</span>
              <span>FlyMatrix v1.0</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
