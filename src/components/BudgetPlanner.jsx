import React, {
  useMemo,
  useState
} from "react";

export default function BudgetPlanner() {
  const [days, setDays] =
    useState(7);

  const [daily, setDaily] =
    useState(90);

  const total = useMemo(
    () => days * daily,
    [days, daily]
  );

  return (
    <div
      className="fm-card"
      style={{ padding: 20 }}
    >
      <h3>
        Quick trip budget
      </h3>

      <div className="fm-grid">

        <div className="fm-field">
          <label>Days</label>

          <input
            type="number"
            min="1"
            value={days}
            onChange={(e) =>
              setDays(
                Number(e.target.value)
              )
            }
          />
        </div>

        <div className="fm-field">
          <label>
            Daily local budget
          </label>

          <input
            type="number"
            min="0"
            value={daily}
            onChange={(e) =>
              setDaily(
                Number(e.target.value)
              )
            }
          />
        </div>

      </div>

      <p>
        <strong>
          Estimated local spend:
          {" "}
          USD {total.toLocaleString()}
        </strong>
      </p>

      <div className="fm-meta">
        Planning estimate only.
      </div>
    </div>
  );
}
