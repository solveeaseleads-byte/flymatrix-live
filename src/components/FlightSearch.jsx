import { useDestinations } from '@/hooks/useDestinations';

export default function DestinationSelector() {
  const { destinations, loading, error } = useDestinations();

  if (loading) return <div>Loading destinations...</div>;
  if (error) return <div>Error loading destinations: {error}</div>;

  return (
    <div className="destination-selector">
      <select aria-label="Select Destination">
        <option value="">-- Select a Destination --</option>
        {destinations.map((dest) => (
          <option key={dest.id || dest.code} value={dest.code}>
            {dest.name}
          </option>
        ))}
      </select>
    </div>
  );
}
