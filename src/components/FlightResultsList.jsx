import FlightCard from './FlightCard';

export default function FlightResultsList({ results }) {
  if (!results || results.length === 0) {
    return <p className="text-slate-500 text-center py-8">No flights found matching your route.</p>;
  }

  return (
    <div className="space-y-4">
      {results.map((flight, index) => (
        <FlightCard key={flight.id || index} flight={flight} />
      ))}
    </div>
  );
}
