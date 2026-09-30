import React from "react";

export default function FlightFilters({
  sortBy = "price",
  onSortChange,
  maxStops = "any",
  onStopsChange,
}) {
  return (
    <aside className="flight-filters" aria-label="Flight filters">
      <div className="flight-filter-group">
        <label htmlFor="flight-sort">
          Sort by
        </label>

        <select
          id="flight-sort"
          value={sortBy}
          onChange={(event) => {
            if (typeof onSortChange === "function") {
              onSortChange(event.target.value);
            }
          }}
        >
          <option value="price">
            Lowest price
          </option>

          <option value="duration">
            Shortest duration
          </option>

          <option value="departure">
            Earliest departure
          </option>

          <option value="arrival">
            Earliest arrival
          </option>

          <option value="stops">
            Fewest stops
          </option>
        </select>
      </div>

      <div className="flight-filter-group">
        <label htmlFor="flight-stops">
          Stops
        </label>

        <select
          id="flight-stops"
          value={maxStops}
          onChange={(event) => {
            if (typeof onStopsChange === "function") {
              onStopsChange(event.target.value);
            }
          }}
        >
          <option value="any">
            Any number of stops
          </option>

          <option value="0">
            Direct only
          </option>

          <option value="1">
            Up to 1 stop
          </option>

          <option value="2">
            Up to 2 stops
          </option>
        </select>
      </div>
    </aside>
  );
}
