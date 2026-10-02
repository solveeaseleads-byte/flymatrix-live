import React, { useEffect, useRef, useState } from "react";

export default function PassengerSelector({
  adults = 1,
  children = 0,
  infants = 0,
  onChange
}) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef(null);

  const passengerTotal =
    Number(adults || 0) +
    Number(children || 0) +
    Number(infants || 0);

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
      adults: Number(adults) || 1,
      children: Number(children) || 0,
      infants: Number(infants) || 0
    };

    const next = {
      ...current
    };

    next[type] =
      Math.max(
        type === "adults" ? 1 : 0,
        current[type] + amount
      );

    /*
     * Optional safety rule:
     * infants cannot exceed adults.
     */
    if (type === "adults") {
      next.infants = Math.min(
        next.infants,
        next.adults
      );
    }

    if (
      typeof onChange === "function"
    ) {
      onChange(next);
    }
  }

  function getSummary() {
    const parts = [];

    if (adults > 0) {
      parts.push(
        `${adults} adult${adults !== 1 ? "s" : ""}`
      );
    }

    if (children > 0) {
      parts.push(
        `${children} child${children !== 1 ? "ren" : ""}`
      );
    }

    if (infants > 0) {
      parts.push(
        `${infants} infant${infants !== 1 ? "s" : ""}`
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
        <span>
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
            value={adults}
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
            value={children}
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
            value={infants}
            min={0}
            max={adults}
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
        <strong>
          {label}
        </strong>

        <span>
          {description}
        </span>
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
