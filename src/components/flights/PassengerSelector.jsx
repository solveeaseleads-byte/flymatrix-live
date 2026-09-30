import React, { useEffect, useRef, useState } from "react";

const DEFAULTS = {
  adults: 1,
  children: 0,
  infants: 0,
};

function clamp(value, min, max) {
  return Math.min(
    Math.max(Number(value) || 0, min),
    max
  );
}

function getTotal(adults, children, infants) {
  return (
    Number(adults) +
    Number(children) +
    Number(infants)
  );
}

function passengerLabel(adults, children, infants) {
  const total = getTotal(
    adults,
    children,
    infants
  );

  const parts = [
    `${total} ${
      total === 1
        ? "passenger"
        : "passengers"
    }`,
  ];

  if (Number(adults) > 0) {
    parts.push(
      `${adults} ${
        Number(adults) === 1
          ? "adult"
          : "adults"
      }`
    );
  }

  if (Number(children) > 0) {
    parts.push(
      `${children} ${
        Number(children) === 1
          ? "child"
          : "children"
      }`
    );
  }

  if (Number(infants) > 0) {
    parts.push(
      `${infants} ${
        Number(infants) === 1
          ? "infant"
          : "infants"
      }`
    );
  }

  return parts.join(" · ");
}

function CounterRow({
  label,
  description,
  value,
  min,
  max,
  onChange,
}) {
  const decreaseDisabled =
    Number(value) <= min;

  const increaseDisabled =
    Number(value) >= max;

  return (
    <div className="passenger-row">
      <div className="passenger-row-info">
        <strong>{label}</strong>

        <span>{description}</span>
      </div>

      <div className="passenger-counter">
        <button
          type="button"
          className="passenger-counter-button"
          disabled={decreaseDisabled}
          aria-label={`Decrease ${label}`}
          onClick={() =>
            onChange(
              clamp(
                Number(value) - 1,
                min,
                max
              )
            )
          }
        >
          −
        </button>

        <span
          className="passenger-count"
          aria-live="polite"
        >
          {value}
        </span>

        <button
          type="button"
          className="passenger-counter-button"
          disabled={increaseDisabled}
          aria-label={`Increase ${label}`}
          onClick={() =>
            onChange(
              clamp(
                Number(value) + 1,
                min,
                max
              )
            )
          }
        >
          +
        </button>
      </div>
    </div>
  );
}

export default function PassengerSelector({
  adults = DEFAULTS.adults,
  children = DEFAULTS.children,
  infants = DEFAULTS.infants,
  onChange,
  maxPassengers = 9,
}) {
  const containerRef = useRef(null);

  const [isOpen, setIsOpen] =
    useState(false);

  const [passengers, setPassengers] =
    useState({
      adults: Math.max(
        1,
        Number(adults) || 1
      ),
      children: Math.max(
        0,
        Number(children) || 0
      ),
      infants: Math.max(
        0,
        Number(infants) || 0
      ),
    });

  useEffect(() => {
    setPassengers({
      adults: Math.max(
        1,
        Number(adults) || 1
      ),
      children: Math.max(
        0,
        Number(children) || 0
      ),
      infants: Math.max(
        0,
        Number(infants) || 0
      ),
    });
  }, [adults, children, infants]);

  useEffect(() => {
    function handleOutsideClick(event) {
      if (
        containerRef.current &&
        !containerRef.current.contains(
          event.target
        )
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener(
      "mousedown",
      handleOutsideClick
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleOutsideClick
      );
    };
  }, []);

  function updatePassenger(
    type,
    nextValue
  ) {
    setPassengers((current) => {
      const next = {
        ...current,
        [type]: nextValue,
      };

      /*
       * Total passenger count is kept within
       * the configured maximum.
       */
      const total = getTotal(
        next.adults,
        next.children,
        next.infants
      );

      if (total > maxPassengers) {
        return current;
      }

      /*
       * Infants cannot exceed the number
       * of adults.
       */
      if (
        type === "infants" &&
        next.infants > next.adults
      ) {
        return current;
      }

      onChange?.(next);

      return next;
    });
  }

  function handleKeyDown(event) {
    if (event.key === "Escape") {
      setIsOpen(false);
    }

    if (
      event.key === "Enter" ||
      event.key === " "
    ) {
      if (
        event.target ===
        event.currentTarget
      ) {
        event.preventDefault();
        setIsOpen(
          (current) => !current
        );
      }
    }
  }

  const total = getTotal(
    passengers.adults,
    passengers.children,
    passengers.infants
  );

  return (
    <div
      ref={containerRef}
      className="passenger-selector"
    >
      <button
        type="button"
        className="passenger-selector-trigger"
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        onClick={() =>
          setIsOpen(
            (current) => !current
          )
        }
        onKeyDown={handleKeyDown}
      >
        <span className="passenger-selector-icon">
          👤
        </span>

        <span className="passenger-selector-value">
          {passengerLabel(
            passengers.adults,
            passengers.children,
            passengers.infants
          )}
        </span>

        <span
          className="passenger-selector-chevron"
          aria-hidden="true"
        >
          {isOpen ? "⌃" : "⌄"}
        </span>
      </button>

      {isOpen && (
        <div
          className="passenger-selector-panel"
          role="dialog"
          aria-label="Passenger selection"
        >
          <div className="passenger-panel-header">
            <div>
              <strong>
                Passengers
              </strong>

              <span>
                Maximum {maxPassengers} passengers
              </span>
            </div>

            <button
              type="button"
              className="passenger-close"
              aria-label="Close passenger selector"
              onClick={() =>
                setIsOpen(false)
              }
            >
              ×
            </button>
          </div>

          <CounterRow
            label="Adults"
            description="Age 12+"
            value={passengers.adults}
            min={1}
            max={maxPassengers}
            onChange={(value) =>
              updatePassenger(
                "adults",
                value
              )
            }
          />

          <CounterRow
            label="Children"
            description="Age 2–11"
            value={passengers.children}
            min={0}
            max={
              Math.max(
                0,
                maxPassengers -
                  passengers.adults -
                  passengers.infants
              )
            }
            onChange={(value) =>
              updatePassenger(
                "children",
                value
              )
            }
          />

          <CounterRow
            label="Infants"
            description="Under 2"
            value={passengers.infants}
            min={0}
            max={Math.min(
              passengers.adults,
              Math.max(
                0,
                maxPassengers -
                  passengers.adults -
                  passengers.children
              )
            )}
            onChange={(value) =>
              updatePassenger(
                "infants",
                value
              )
            }
          />

          <div className="passenger-panel-footer">
            <span>
              {total}{" "}
              {total === 1
                ? "passenger"
                : "passengers"}
            </span>

            <button
              type="button"
              className="btn btn-primary passenger-done"
              onClick={() =>
                setIsOpen(false)
              }
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
      }
