import { useState, useEffect } from 'react';

export function useDestinations() {
  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDestinations = async () => {
      try {
        const res = await fetch('/api/destinations');
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

        const json = await res.json();
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

  return { destinations, loading, error };
}
