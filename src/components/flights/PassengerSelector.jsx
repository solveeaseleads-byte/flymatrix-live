import React, { useEffect, useRef, useState } from "react";

export default function PassengerSelector({
  adults = 1,
  children = 0,
  infants = 0,
  onChange
}) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef(null);

  const safeAdults = Math.max(1, Number(adults) || 1);
  const safeChildren = Math.max(0, Number(children) || 0);
  const safeInfants = Math.min(
    safeAdults,
    Math.max(0, Number(infants) || 0)
  );

  const passengerTotal =
    safeAdults +
    safeChildren +
    safeInfants;

  useEffect(() => {
    function handleOutsideClick(event) {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target)
      ) {
        setOpen(false);
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

  function updatePassenger(type, amount) {
    const current = {
      adults: safeAdults,
      children: safeChildren,
      infants: safeInfants
    };

    const next = {
      ...current,
      [type]: Math.max(
        type === "adults" ? 1 : 0,
        current[type] + amount
      )
    };

    if (type === "adults") {
      next.infants = Math.min(
        next.infants,
        next.adults
      );
    }

    if (typeof onChange === "function") {
      onChange(next);
    }
  }

  function getSummary() {
    const parts = [];

    parts.push(
      `${safeAdults} adult${safeAdults !== 1 ? "s" : ""}`
    );

    if (safeChildren > 0) {
      parts.push(
        `${safeChildren} child${
          safeChildren !== 1 ? "ren" : ""
        }`
      );
    }

    if (safeInfants > 0) {
      parts.push(
        `${safeInfants} infant${
          safeInfants !== 1 ? "s" : ""
        }`
      );
    }

    return parts.join(", ");
  }

  return (
    <div
      className="passenger-selector"
      ref={wrapperRef}
    >
      <button
        type="button"
        className="passenger-selector-trigger"
        onClick={() =>
          setOpen((current) => !current)
        }
        aria-expanded={open}
        aria-haspopup="dialog"
      >
        <span className="passenger-selector-summary">
          {getSummary()}
        </span>

        <span
          aria-hidden="true"
          className={`passenger-chevron ${
            open ? "is-open" : ""
          }`}
        >
          ▾
        </span>
      </button>

      {open && (
        <div
          className="passenger-selector-menu"
          role="dialog"
          aria-label="Passenger selection"
        >
          <PassengerRow
            label="Adults"
            description="Age 12+"
            value={safeAdults}
            min={1}
            onDecrease={() =>
              updatePassenger(
                "adults",
                -1
              )
            }
            onIncrease={() =>
              updatePassenger(
                "adults",
                1
              )
            }
          />

          <PassengerRow
            label="Children"
            description="Age 2–11"
            value={safeChildren}
            min={0}
            onDecrease={() =>
              updatePassenger(
                "children",
                -1
              )
            }
            onIncrease={() =>
              updatePassenger(
                "children",
                1
              )
            }
          />

          <PassengerRow
            label="Infants"
            description="Under 2"
            value={safeInfants}
            min={0}
            max={safeAdults}
            onDecrease={() =>
              updatePassenger(
                "infants",
                -1
              )
            }
            onIncrease={() =>
              updatePassenger(
                "infants",
                1
              )
            }
          />

          <div className="passenger-selector-footer">
            <span>
              {passengerTotal} passenger
              {passengerTotal !== 1
                ? "s"
                : ""}
            </span>

            <button
              type="button"
              className="passenger-done-button"
              onClick={() =>
                setOpen(false)
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

function PassengerRow({
  label,
  description,
  value,
  min = 0,
  max = 99,
  onDecrease,
  onIncrease
}) {
  const decreaseDisabled =
    value <= min;

  const increaseDisabled =
    value >= max;

  return (
    <div className="passenger-row">
      <div className="passenger-info">
        <strong>{label}</strong>

        <span>{description}</span>
      </div>

      <div className="passenger-controls">
        <button
          type="button"
          className="passenger-control-button"
          onClick={onDecrease}
          disabled={decreaseDisabled}
          aria-label={`Decrease ${label}`}
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
          className="passenger-control-button"
          onClick={onIncrease}
          disabled={increaseDisabled}
          aria-label={`Increase ${label}`}
        >
          +
        </button>
      </div>
    </div>
  );
}
