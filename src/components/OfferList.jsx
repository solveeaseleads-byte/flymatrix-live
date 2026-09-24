export function OfferList({ offers, selectedMarket, sessionData }) {
  
  const handleOfferClick = async (offer) => {
    try {
      if (offer.link) {
        fetch('/api/affiliate/click', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            affiliateProgramId: offer.programId || null,
            origin: offer.slices?.[0]?.origin || sessionData?.origin,
            destination: offer.slices?.[0]?.destination || sessionData?.destination,
            market: selectedMarket || 'GLOBAL'
          })
        }).catch(err => console.error('Click logging failed:', err));

        window.open(offer.link, '_blank', 'noopener,noreferrer');
        return;
      }

      const response = await fetch('/api/booking/resolve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: 'flights',
          market: selectedMarket || 'GLOBAL',
          originCountry: sessionData?.originCountry,
          destinationCountry: sessionData?.destinationCountry
        })
      });

      const data = await response.json();
      
      if (data?.selected?.trackingUrl) {
        await fetch('/api/affiliate/click', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            affiliateProgramId: data.selected.id,
            origin: sessionData?.origin,
            destination: sessionData?.destination,
            market: selectedMarket
          })
        });

        window.open(data.selected.trackingUrl, '_blank', 'noopener,noreferrer');
      } else {
        alert('No active booking partner found for this route.');
      }
    } catch (error) {
      console.error('Redirect failed:', error);
    }
  };

  return (
    <div className="flex flex-col gap-3">
      {offers.map((offer, index) => (
        <div
          key={offer.id || index}
          onClick={() => handleOfferClick(offer)}
          className="p-4 bg-slate-800 rounded-lg border border-slate-700 hover:border-cyan-500 cursor-pointer transition-all flex justify-between items-center"
        >
          <div>
            <div className="font-semibold text-white">
              {offer.airline?.name || offer.owner?.name || "Airline TBA"} — ${offer.price?.amount || "0.00"}
            </div>
            <div className="text-xs text-slate-400">
              {offer.slices?.[0]?.stops !== undefined ? `${offer.slices[0].stops} Stops` : "Stops TBA"}
            </div>
          </div>
          
          <span className="text-sm text-cyan-400 font-medium">Select &rarr;</span>
        </div>
      ))}
    </div>
  );
}
