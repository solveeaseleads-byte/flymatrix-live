import React, { useState, useEffect } from 'react';

export default function FlightSearch() {
  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Selected destination state (optional, for your search form)
  const [selectedDestination, setSelectedDestination] = useState('');

  useEffect(() => {
    const fetchDestinations = async () => {
      try {
        const res = await fetch('/api/destinations');
        
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }

        const json = await res.json();
        
        // Safely extract the array envelope (json.data) or fallback
        const extractedData = json.data || json || [];
        setDestinations(Array.isArray(extractedData) ? extractedData : []);
      } catch (err) {
        console.error("Failed to fetch destinations:", err);
        setError(err.message);
        setDestinations([]); 
      } finally {
        setLoading(false);
      }
    };

    fetchDestinations();
  }, []);

  return (
    <div className="flight-search-container p-4">
      <h2 className="text-xl font-bold mb-4">Search Flights</h2>

      {loading && <div>Loading destinations...</div>}
      {error && <div className="text-red-500">Error loading destinations: {error}</div>}

      {!loading && !error && (
        <div className="mb-4">
          <label className="block mb-2 font-medium">Destination</label>
          <select 
            value={selectedDestination} 
            onChange={(e) => setSelectedDestination(e.target.value)}
            className="border p-2 rounded w-full"
          >
            <option value="">-- Select a Destination --</option>
            {destinations.map((dest) => (
              <option key={dest.id || dest.code} value={dest.code}>
                {dest.name}
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
}
