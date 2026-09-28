import React from "react";

const CORRIDORS = [
  ["Lagos", "London", "LOS", "LHR"],
  ["Abuja", "Dubai", "ABV", "DXB"],
  ["Lagos", "Toronto", "LOS", "YYZ"],
  ["Lagos", "Manchester", "LOS", "MAN"]
];

export default function PopularCorridors({
  onSelect
}) {
  return (
    <div className="fm-corridors">

      {CORRIDORS.map(
        ([from, to, origin, destination]) => (
          <button
            className="fm-corridor"
            key={`${origin}-${destination}`}
            onClick={() =>
              onSelect?.({
                origin,
                destination
              })
            }
          >
            <strong>
              {from} → {to}
            </strong>

            <span className="fm-meta">
              {origin} · {destination}
            </span>
          </button>
        )
      )}

    </div>
  );
}
