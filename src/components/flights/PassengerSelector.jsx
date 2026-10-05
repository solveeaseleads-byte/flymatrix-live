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

  const total =
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

    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      document.removeEventListener(
        "mousedown",
        handleOutsideClick
      );
    };
  }, []);

  function changePassenger(type, amount) {
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

  function summary() {
    const result = [];

    result.push(
      `${safeAdults} adult${safeAdults === 1 ? "" : "s"}`
    );

    if (safeChildren > 0) {
      result.push(
        `${safeChildren} child${
          safeChildren === 1 ? "" : "ren"
        }`
      );
    }

    if (safeInfants > 0) {
      result.push(
        `${safeInfants} infant${
          safeInfants === 1 ? "" : "s"
        }`
      );
    }

    return result.join(", ");
  }

  return (
    <div
      ref={wrapperRef}
      className={`passenger-selector ${
        open ? "passenger-selector-open" : ""
      }`}
    >
      <button
        type="button"
        className="passenger-selector-trigger"
        aria-expanded={open}
        aria-haspopup="dialog"
        onMouseDown={(event) => {
          event.preventDefault();
        }}
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
          setOpen((previous) => !previous);
        }}
      >
        <span className="passenger-selector-summary">
          {summary()}
        </span>

        <span
          className={`passenger-chevron ${
            open ? "is-open" : ""
          }`}
          aria-hidden="true"
        >
          ▾
        </span>
      </button>

      {open && (
        <div
          className="passenger-selector-menu"
          role="dialog"
          aria-label="Passenger selection"
          onClick={(event) => {
            event.stopPropagation();
          }}
        >
          <PassengerRow
            label="Adults"
            description="Age 12+"
            value={safeAdults}
            min={1}
            onDecrease={() =>
              changePassenger("adults", -1)
            }
            onIncrease={() =>
              changePassenger("adults", 1)
            }
          />

          <PassengerRow
            label="Children"
            description="Age 2–11"
            value={safeChildren}
            min={0}
            onDecrease={() =>
              changePassenger("children", -1)
            }
            onIncrease={() =>
              changePassenger("children", 1)
            }
          />

          <PassengerRow
            label="Infants"
            description="Under 2"
            value={safeInfants}
            min={0}
            max={safeAdults}
            onDecrease={() =>
              changePassenger("infants", -1)
            }
            onIncrease={() =>
              changePassenger("infants", 1)
            }
          />

          <div className="passenger-selector-footer">
            <span>
              {total} passenger
              {total === 1 ? "" : "s"}
            </span>

            <button
              type="button"
              className="passenger-done-button"
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
                setOpen(false);
              }}
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
          disabled={value <= min}
          onMouseDown={(event) => {
            event.preventDefault();
          }}
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();

            if (value > min) {
              onDecrease();
            }
          }}
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
          disabled={value >= max}
          onMouseDown={(event) => {
            event.preventDefault();
          }}
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();

            if (value < max) {
              onIncrease();
            }
          }}
          aria-label={`Increase ${label}`}
        >
          +
        </button>
      </div>
    </div>
  );
}
