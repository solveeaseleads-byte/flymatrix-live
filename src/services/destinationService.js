// Fetch all active destinations, optionally filtered by category ('leisure' or 'education')
export async function fetchDestinations(category = '') {
  try {
    const url = category 
      ? `/api/destinations?category=${category}` 
      : '/api/destinations';
      
    const response = await fetch(url);
    const result = await response.json();
    
    if (result.success) {
      return result.data;
    } else {
      console.error('Failed to fetch destinations:', result.error);
      return [];
    }
  } catch (err) {
    console.error('Network error fetching destinations:', err);
    return [];
  }
}

// Fetch a single destination template by its code (e.g., 'PAR-FRA')
export async function fetchDestinationByCode(code) {
  try {
    const response = await fetch(`/api/destinations/${code}`);
    const result = await response.json();
    
    if (result.success) {
      return result.data;
    } else {
      console.error('Destination not found:', result.error);
      return null;
    }
  } catch (err) {
    console.error('Network error fetching destination details:', err);
    return null;
  }
}
