import React from 'react';

const corridors = [
  { id: 'los-lon', title: 'Lagos → London', origin: 'LOS', destination: 'LON', type: 'Popular Corridor' },
  { id: 'abv-dxb', title: 'Abuja → Dubai', origin: 'ABV', destination: 'DXB', type: 'Popular Corridor' },
  { id: 'los-yyz', title: 'Lagos → Toronto', origin: 'LOS', destination: 'YYZ', type: 'Long-Haul' },
  { id: 'los-man', title: 'Lagos → Manchester', origin: 'LOS', destination: 'MAN', type: 'International' },
];

export default function PopularCorridors({ onSelectCorridor }) {
  const handleCardClick = (corridor) => {
    // Option 1: Trigger a search function or update state
    if (onSelectCorridor) {
      onSelectCorridor(corridor);
    } else {
      // Option 2: Fallback to navigating with query parameters
      window.location.href = `/explore?origin=${corridor.origin}&destination=${corridor.destination}`;
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-bold text-slate-900">Popular travel corridors</h3>
      <p className="text-sm text-slate-500">Start with a route or search your own destination.</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {corridors.map((corridor) => (
          <div
            key={corridor.id}
            onClick={() => handleCardClick(corridor)}
            className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:border-indigo-300 hover:shadow-md transition-all cursor-pointer"
          >
            <span className="text-xs font-medium text-slate-400 block mb-1">{corridor.type}</span>
            <h4 className="text-base font-semibold text-slate-900 mb-2">🇳🇬 {corridor.title}</h4>
            <span className="text-sm font-medium text-indigo-600 flex items-center gap-1">
              Explore live fares →
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
