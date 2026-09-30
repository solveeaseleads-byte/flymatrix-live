import React, { useEffect, useRef, useState } from "react";

const AFFILIATES = {
  flights: "https://aviasales.tpk.lv/zXqbkMmK",
  hotels: "https://booking.tpk.lv/zXqbkMmK",
  activities: "https://getyourguide.tpk.lv/zXqbkMmK",
  esim: "https://airalo.tpk.lv/SMhYBmH2",
  assistance: "https://airhelp.tpk.lv/vuZpde9f",
  luggage: "https://radicalstorage.tpk.lv/LwLfrsRU",
  visa: "https://ivisa.tpk.lv/zXqbkMmK",
  telegram: "https://t.me/cheapflightsconcierge",
};

const FLIGHT_WIDGET_URL =
  "https://tp.media/content?currency=usd&trs=288210&shmarker=581079&show_hotels=false&powered_by=false&locale=en&searchUrl=aviasales.tpk.lv%2FzXqbkMmK&primary=%2006b6d4&color_button=%2010b981";

const DEALS = [
  ["🇳🇬 Lagos", "LOS", "🇬🇧 London", "LHR"],
  ["🇳🇬 Abuja", "ABV", "🇦🇪 Dubai", "DXB"],
  ["🇳🇬 Lagos", "LOS", "🇨🇦 Toronto", "YYZ"],
  ["🇳🇬 Lagos", "LOS", "🇬🇧 Manchester", "MAN"],
];

function App() {
  const flightWidgetRef = useRef(null);

  const [dark, setDark] = useState(
    () => localStorage.getItem("flymatrixTheme") === "dark"
  );

  const [currency, setCurrency] = useState(
    () => localStorage.getItem("flymatrixCurrency") || "USD"
  );

  const [passport, setPassport] = useState("NG");
  const [destination, setDestination] = useState("GB");
  const [visaResult, setVisaResult] = useState("");

  const [dest, setDest] = useState("");
  const [days, setDays] = useState(5);
  const [style, setStyle] = useState("Student / Low Budget");
  const [planResult, setPlanResult] = useState("");

  const [email, setEmail] = useState("");
  const [paymentLoading, setPaymentLoading] = useState(false);

  const [toastMessage, setToastMessage] = useState("");

  /*
   * -------------------------------------------------------
   * TRAVELPOUTS / AVIASALES SEARCH ENGINE
   * -------------------------------------------------------
   *
   * This is deliberately loaded after React mounts.
   * A <script> placed directly inside JSX is not reliable.
   */
  useEffect(() => {
    const container = flightWidgetRef.current;

    if (!container) return;

    container.innerHTML = "";

    const script = document.createElement("script");

    script.charset = "utf-8";
    script.async = true;
    script.src = FLIGHT_WIDGET_URL;

    container.appendChild(script);

    return () => {
      if (container) {
        container.innerHTML = "";
      }
    };
  }, []);

  useEffect(() => {
    localStorage.setItem("flymatrixTheme", dark ? "dark" : "light");
    document.documentElement.setAttribute(
      "data-theme",
      dark ? "dark" : "light"
    );
  }, [dark]);

  useEffect(() => {
    localStorage.setItem("flymatrixCurrency", currency);
  }, [currency]);

  useEffect(() => {
    if (!toastMessage) return;

    const timer = setTimeout(() => {
      setToastMessage("");
    }, 2800);

    return () => clearTimeout(timer);
  }, [toastMessage]);

  const toast = (message) => {
    setToastMessage(message);
  };

  /*
   * -------------------------------------------------------
   * VISA GUIDANCE
   * -------------------------------------------------------
   */

  const checkVisa = () => {
    let text;

    if (passport === "NG" && destination === "GB") {
      text =
        "🇬🇧 Nigerian passport holders generally need the appropriate UK visa before travel. Confirm the current visitor or student requirements with UK authorities.";
    } else if (passport === "NG" && destination === "AE") {
      text =
        "🇦🇪 UAE entry requirements depend on nationality, purpose and current rules. Confirm the current visa/eVisa process with UAE authorities or your airline before departure.";
    } else if (passport === "NG" && destination === "CA") {
      text =
        "🇨🇦 Nigerian passport holders generally require the appropriate Canadian authorization or visa before travelling. Confirm the current requirements with Canadian authorities.";
    } else {
      text =
        "ℹ️ Entry requirements vary by passport, destination, purpose and travel date. Verify the current rule with the destination country's official immigration authority.";
    }

    setVisaResult(text);
  };

  /*
   * -------------------------------------------------------
   * ITINERARY GENERATOR
   * -------------------------------------------------------
   */

  const makePlan = () => {
    const safeDestination = dest.trim() || "your destination";

    const numberOfDays = Math.max(
      1,
      Math.min(30, Number.parseInt(days, 10) || 5)
    );

    let dailyBudget;
    let focus;

    if (style.startsWith("Student")) {
      dailyBudget = "$45–$85";
      focus =
        "budget accommodation, public transport and free or low-cost attractions";
    } else if (style.startsWith("Executive")) {
      dailyBudget = "$180–$350";
      focus =
        "central accommodation, efficient transfers and business-friendly dining";
    } else {
      dailyBudget = "$80–$180";
      focus =
        "comfortable accommodation, major attractions and local experiences";
    }

    const generatedDays = [];

    for (let i = 1; i <= numberOfDays; i += 1) {
      let title;
      let body;

      if (i === 1) {
        title = "Arrival & settling in";
        body =
          "Arrive, check in, activate your eSIM and keep the first day flexible.";
      } else if (i === numberOfDays) {
        title = "Departure & final activities";
        body =
          "Leave enough time for checkout, airport transfer and flight preparation.";
      } else if (i % 2 === 0) {
        title = "Major sights & local experience";
        body =
          "Explore major attractions and keep a flexible block for weather, queues or spontaneous discoveries.";
      } else {
        title = "Culture, food & flexible exploration";
        body =
          "Explore local culture, food and selected attractions while keeping enough time for rest.";
      }

      generatedDays.push({
        day: i,
        title,
        body,
      });
    }

    setPlanResult({
      destination: safeDestination,
      numberOfDays,
      style,
      dailyBudget,
      focus,
      days: generatedDays,
    });
  };

  /*
   * -------------------------------------------------------
   * PAYSTACK
   * -------------------------------------------------------
   *
   * Uses the existing Express backend:
   * POST /api/pay
   *
   * This avoids putting payment secret credentials in React.
   */

  const pay = async () => {
    const trimmedEmail = email.trim();

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      toast("Please enter a valid email address.");
      return;
    }

    setPaymentLoading(true);

    try {
      const response = await fetch("/api/pay", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: trimmedEmail,
          amount: 500,
          metadata: {
            planName: "FlyMatrix VIP Travel Alerts",
            source: "flymatrix-web",
          },
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error || "Payment initialization failed."
        );
      }

      if (data.authorizationUrl) {
        window.location.href = data.authorizationUrl;
        return;
      }

      throw new Error("Payment authorization URL was not returned.");
    } catch (error) {
      console.error("FlyMatrix payment error:", error);
      toast(error.message || "Payment initialization failed.");
    } finally {
      setPaymentLoading(false);
    }
  };

  const openExternal = (url) => {
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  return (
    <div className="flymatrix-app">
      <style>{`
        :root {
          --fm-ink: #0f172a;
          --fm-muted: #64748b;
          --fm-primary: #06b6d4;
          --fm-primary2: #22d3ee;
          --fm-green: #10b981;
          --fm-bg: #f4f8fb;
          --fm-card: #ffffff;
          --fm-border: #dbe4ee;
          --fm-dark: #020617;
          --fm-dark2: #0f172a;
          --fm-danger: #ef4444;
          --fm-shadow: 0 14px 40px rgba(15,23,42,.08);
        }

        [data-theme="dark"] {
          --fm-ink: #f8fafc;
          --fm-muted: #94a3b8;
          --fm-bg: #080d17;
          --fm-card: #111827;
          --fm-border: #263244;
          --fm-shadow: 0 14px 40px rgba(0,0,0,.25);
        }

        .flymatrix-app {
          min-height: 100vh;
          background: var(--fm-bg);
          color: var(--fm-ink);
          font-family:
            "Plus Jakarta Sans",
            Inter,
            system-ui,
            -apple-system,
            BlinkMacSystemFont,
            "Segoe UI",
            sans-serif;
          padding-bottom: 76px;
        }

        .flymatrix-app *,
        .flymatrix-app *::before,
        .flymatrix-app *::after {
          box-sizing: border-box;
        }

        .flymatrix-app html {
          scroll-behavior: smooth;
        }

        .flymatrix-app a {
          color: inherit;
          text-decoration: none;
        }

        .flymatrix-app button,
        .flymatrix-app input,
        .flymatrix-app select {
          font: inherit;
        }

        .fm-container {
          max-width: 1080px;
          margin: auto;
          padding: 0 16px;
        }

        .fm-trust-strip {
          background: #020617;
          color: #e2e8f0;
          padding: 8px 16px;
          font-size: .72rem;
          text-align: center;
          border-bottom: 1px solid rgba(34,211,238,.35);
        }

        .fm-trust-strip b {
          color: #67e8f9;
        }

        .fm-ticker {
          background: #0b1220;
          color: white;
          border-bottom: 2px solid var(--fm-primary);
          display: flex;
          align-items: center;
          overflow: hidden;
          white-space: nowrap;
        }

        .fm-ticker-badge {
          background: #ef4444;
          color: white;
          font-size: .7rem;
          font-weight: 800;
          padding: 6px 10px;
          margin-left: 12px;
          border-radius: 5px;
          z-index: 2;
        }

        .fm-ticker-track {
          display: flex;
          width: max-content;
          animation: fmTicker 34s linear infinite;
          padding: 8px 0;
        }

        .fm-ticker:hover .fm-ticker-track {
          animation-play-state: paused;
        }

        @keyframes fmTicker {
          from {
            transform: translateX(0);
          }

          to {
            transform: translateX(-50%);
          }
        }

        .fm-deal {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          margin: 0 7px;
          padding: 6px 12px;
          border: 1px solid rgba(34,211,238,.25);
          border-radius: 20px;
          background: #111c2d;
          font-size: .76rem;
        }

        .fm-deal strong {
          color: #34d399;
        }

        .fm-header {
          background: var(--fm-card);
          border-bottom: 1px solid var(--fm-border);
          position: sticky;
          top: 0;
          z-index: 50;
        }

        .fm-nav {
          min-height: 64px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
        }

        .fm-logo {
          font-size: 1.28rem;
          font-weight: 800;
          color: var(--fm-primary);
          letter-spacing: -.5px;
        }

        .fm-nav-actions {
          display: flex;
          gap: 8px;
          align-items: center;
        }

        .fm-select,
        .fm-icon-btn {
          border: 1px solid var(--fm-border);
          background: var(--fm-card);
          color: var(--fm-ink);
          border-radius: 9px;
          padding: 8px 10px;
          cursor: pointer;
        }

        .fm-icon-btn {
          min-width: 40px;
        }

        .fm-hero {
          background:
            linear-gradient(
              135deg,
              #020617,
              #0f172a 62%,
              #083344
            );
          color: white;
          text-align: center;
          padding: 54px 16px 92px;
          border-bottom: 3px solid var(--fm-primary);
          position: relative;
          overflow: hidden;
        }

        .fm-hero h1 {
          font-size: clamp(2rem,6vw,3.25rem);
          line-height: 1.08;
          letter-spacing: -1.5px;
          max-width: 800px;
          margin: auto;
        }

        .fm-hero h1 span {
          color: #67e8f9;
        }

        .fm-hero p {
          max-width: 720px;
          margin: 14px auto 0;
          color: #cbd5e1;
          line-height: 1.6;
          font-size: .96rem;
        }

        .fm-hero-pills {
          display: flex;
          justify-content: center;
          gap: 8px;
          flex-wrap: wrap;
          margin-top: 22px;
        }

        .fm-pill {
          border: 1px solid rgba(255,255,255,.15);
          background: rgba(255,255,255,.06);
          padding: 7px 10px;
          border-radius: 999px;
          font-size: .72rem;
        }

        .fm-main {
          margin-top: -44px;
          position: relative;
        }

        .fm-card {
          background: var(--fm-card);
          border: 1px solid var(--fm-border);
          border-radius: 16px;
          box-shadow: var(--fm-shadow);
          padding: 20px;
          margin-bottom: 18px;
        }

        .fm-search-card {
          padding: 22px;
        }

        .fm-section-head {
          display: flex;
          justify-content: space-between;
          gap: 12px;
          align-items: flex-start;
          margin-bottom: 13px;
        }

        .fm-eyebrow {
          font-size: .68rem;
          text-transform: uppercase;
          letter-spacing: .08em;
          color: var(--fm-primary);
          font-weight: 800;
        }

        .fm-card h2 {
          font-size: 1.12rem;
        }

        .fm-muted {
          color: var(--fm-muted);
          font-size: .78rem;
          line-height: 1.5;
        }

        .fm-search-widget {
          min-height: 430px;
          width: 100%;
          overflow: visible;
        }

        .fm-feature-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 10px;
          margin-bottom: 18px;
        }

        .fm-feature {
          background: var(--fm-card);
          border: 1px solid var(--fm-border);
          border-radius: 13px;
          padding: 14px;
          cursor: pointer;
          transition: .2s;
        }

        .fm-feature:hover {
          border-color: var(--fm-primary);
          transform: translateY(-2px);
        }

        .fm-feature-icon {
          font-size: 1.35rem;
        }

        .fm-feature strong {
          display: block;
          font-size: .78rem;
          margin-top: 7px;
        }

        .fm-feature small {
          display: block;
          color: var(--fm-muted);
          font-size: .67rem;
          line-height: 1.45;
          margin-top: 3px;
        }

        .fm-deals {
          display: grid;
          grid-template-columns: repeat(auto-fit,minmax(285px,1fr));
          gap: 14px;
        }

        .fm-ticket {
          border: 1px solid var(--fm-border);
          border-radius: 14px;
          padding: 16px;
          background: var(--fm-card);
          transition: .2s;
        }

        .fm-ticket:hover {
          transform: translateY(-2px);
          border-color: var(--fm-primary);
        }

        .fm-ticket-top,
        .fm-ticket-bottom {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 10px;
        }

        .fm-airline {
          font-weight: 800;
          font-size: .78rem;
        }

        .fm-badge {
          font-size: .62rem;
          font-weight: 800;
          padding: 5px 7px;
          border-radius: 6px;
          background: rgba(16,185,129,.1);
          color: var(--fm-green);
        }

        .fm-route {
          display: grid;
          grid-template-columns: 1fr 1.2fr 1fr;
          align-items: center;
          text-align: center;
          margin: 18px 0;
        }

        .fm-code {
          font-size: 1.15rem;
          font-weight: 800;
        }

        .fm-city {
          font-size: .64rem;
          color: var(--fm-muted);
        }

        .fm-line {
          height: 2px;
          background: var(--fm-border);
          position: relative;
          margin: 4px 10px;
        }

        .fm-line:after {
          content: "✈";
          position: absolute;
          left: 45%;
          top: -9px;
          color: var(--fm-primary);
          font-size: 11px;
        }

        .fm-duration {
          font-size: .65rem;
          color: var(--fm-muted);
        }

        .fm-specs {
          display: grid;
          grid-template-columns: repeat(3,1fr);
          background: var(--fm-bg);
          border-radius: 9px;
          padding: 8px;
          gap: 5px;
        }

        .fm-spec {
          text-align: center;
          font-size: .67rem;
          font-weight: 700;
        }

        .fm-spec span {
          display: block;
          font-weight: 500;
          color: var(--fm-muted);
          font-size: .6rem;
          margin-top: 2px;
        }

        .fm-price {
          font-size: 1.15rem;
          font-weight: 800;
          color: var(--fm-green);
        }

        .fm-price-note {
          font-size: .58rem;
          color: var(--fm-muted);
        }

        .fm-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border: 0;
          border-radius: 9px;
          padding: 10px 14px;
          font-size: .76rem;
          font-weight: 800;
          cursor: pointer;
          transition: .2s;
        }

        .fm-btn:hover {
          transform: translateY(-1px);
        }

        .fm-btn-primary {
          background: var(--fm-primary);
          color: #001014;
        }

        .fm-btn-dark {
          background: var(--fm-dark);
          color: white;
        }

        .fm-btn-outline {
          background: transparent;
          color: var(--fm-ink);
          border: 1px solid var(--fm-border);
        }

        .fm-btn-full {
          width: 100%;
        }

        .fm-two-col {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 18px;
        }

        .fm-form-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit,minmax(150px,1fr));
          gap: 10px;
        }

        .fm-label {
          display: block;
          font-size: .68rem;
          font-weight: 800;
          margin-bottom: 5px;
        }

        .fm-input {
          width: 100%;
          padding: 10px;
          border: 1px solid var(--fm-border);
          border-radius: 9px;
          background: var(--fm-bg);
          color: var(--fm-ink);
          outline: none;
        }

        .fm-input:focus {
          border-color: var(--fm-primary);
        }

        .fm-result {
          margin-top: 12px;
          padding: 13px;
          border: 1px solid var(--fm-border);
          border-radius: 10px;
          background: var(--fm-bg);
          font-size: .77rem;
          line-height: 1.55;
        }

        .fm-itinerary {
          margin-top: 10px;
          display: grid;
          gap: 8px;
        }

        .fm-day {
          padding: 10px;
          border-left: 3px solid var(--fm-primary);
          background: var(--fm-card);
          border-radius: 7px;
        }

        .fm-day b {
          font-size: .76rem;
        }

        .fm-day p {
          font-size: .7rem;
          color: var(--fm-muted);
          margin-top: 3px;
        }

        .fm-monetize {
          display: grid;
          grid-template-columns: repeat(3,1fr);
          gap: 10px;
        }

        .fm-tool {
          border: 1px solid var(--fm-border);
          border-radius: 12px;
          padding: 14px;
          background: var(--fm-card);
          transition: .2s;
        }

        .fm-tool:hover {
          border-color: var(--fm-primary);
          transform: translateY(-2px);
        }

        .fm-tool-icon {
          font-size: 1.3rem;
        }

        .fm-tool strong {
          display: block;
          font-size: .76rem;
          margin-top: 7px;
        }

        .fm-tool small {
          display: block;
          color: var(--fm-muted);
          font-size: .65rem;
          line-height: 1.45;
          margin-top: 3px;
        }

        .fm-vip {
          background: linear-gradient(135deg,#020617,#0f172a);
          color: white;
          border: 1px solid #164e63;
        }

        .fm-vip-grid {
          display: grid;
          grid-template-columns: 1.4fr .8fr;
          gap: 18px;
          align-items: center;
        }

        .fm-vip-price {
          font-size: 2rem;
          font-weight: 800;
          color: #67e8f9;
        }

        .fm-checks {
          display: grid;
          gap: 6px;
          margin: 13px 0;
          font-size: .72rem;
          color: #dbeafe;
        }

        .fm-faq details {
          border-top: 1px solid var(--fm-border);
          padding: 12px 0;
        }

        .fm-faq summary {
          cursor: pointer;
          font-size: .78rem;
          font-weight: 800;
        }

        .fm-faq p {
          color: var(--fm-muted);
          font-size: .72rem;
          line-height: 1.6;
          margin-top: 8px;
        }

        .fm-notice {
          font-size: .68rem;
          color: var(--fm-muted);
          line-height: 1.6;
          background: var(--fm-bg);
          padding: 12px;
          border-radius: 9px;
          margin-bottom: 10px;
        }

        .fm-footer {
          max-width: 1080px;
          margin: 24px auto 0;
          padding: 0 16px 20px;
          color: var(--fm-muted);
          font-size: .65rem;
          line-height: 1.6;
        }

        .fm-sticky {
          position: fixed;
          bottom: 0;
          left: 0;
          width: 100%;
          background: var(--fm-card);
          border-top: 1px solid var(--fm-border);
          padding: 9px 14px;
          z-index: 100;
          display: flex;
          justify-content: center;
        }

        .fm-sticky-inner {
          width: min(1080px,100%);
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 10px;
        }

        .fm-sticky span {
          font-size: .72rem;
          font-weight: 700;
        }

        .fm-toast {
          position: fixed;
          left: 50%;
          bottom: 82px;
          transform: translate(-50%,20px);
          opacity: 0;
          pointer-events: none;
          background: #020617;
          color: white;
          padding: 10px 14px;
          border-radius: 9px;
          font-size: .72rem;
          z-index: 200;
          transition: .25s;
        }

        .fm-toast.show {
          opacity: 1;
          transform: translate(-50%,0);
        }

        @media(max-width:800px) {
          .fm-feature-grid {
            grid-template-columns: repeat(2,1fr);
          }

          .fm-two-col,
          .fm-vip-grid {
            grid-template-columns: 1fr;
          }
        }

        @media(max-width:520px) {
          .fm-feature-grid,
          .fm-monetize {
            grid-template-columns: 1fr 1fr;
          }

          .fm-route {
            grid-template-columns: .8fr 1.3fr .8fr;
          }

          .fm-sticky span {
            display: none;
          }

          .fm-sticky-inner {
            justify-content: center;
          }
        }
      `}</style>

      {/* TRUST STRIP */}
      <div className="fm-trust-strip">
        🔐 <b>FlyMatrix Trust Standard:</b> We don't fabricate fares.
        Prices and availability are confirmed through booking partners at
        search/booking time.
      </div>

      {/* ROUTE TICKER */}
      <div className="fm-ticker">
        <span className="fm-ticker-badge">✈ Featured</span>

        <div className="fm-ticker-track">
          {[...DEALS, ...DEALS].map(
            ([from, fromCode, to, toCode], index) => (
              <a
                key={`${fromCode}-${toCode}-${index}`}
                className="fm-deal"
                href={AFFILIATES.flights}
                target="_blank"
                rel="noopener noreferrer"
              >
                {from} → {to}{" "}
                <strong>Check current fare →</strong>
              </a>
            )
          )}
        </div>
      </div>

      {/* HEADER */}
      <header className="fm-header">
        <div className="fm-container fm-nav">
          <a className="fm-logo" href="#top">
            ⚡ FLYMATRIX
          </a>

          <div className="fm-nav-actions">
            <select
              className="fm-select"
              value={currency}
              onChange={(event) => {
                setCurrency(event.target.value);
                toast("Currency preference saved.");
              }}
              aria-label="Currency"
            >
              <option value="USD">🇺🇸 USD ($)</option>
              <option value="NGN">🇳🇬 NGN (₦)</option>
              <option value="GBP">🇬🇧 GBP (£)</option>
              <option value="EUR">🇪🇺 EUR (€)</option>
              <option value="CAD">🇨🇦 CAD ($)</option>
              <option value="AUD">🇦🇺 AUD ($)</option>
            </select>

            <button
              className="fm-icon-btn"
              onClick={() => setDark((value) => !value)}
              aria-label="Toggle dark mode"
              type="button"
            >
              {dark ? "☀️" : "🌙"}
            </button>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section className="fm-hero" id="top">
        <div className="fm-container">
          <h1>
            Find Flights. <span>Plan Smarter.</span> Travel Better.
          </h1>

          <p>
            Search flights, compare travel options, check visa guidance,
            build a practical trip plan and discover useful travel
            services—all in one simple place.
          </p>

          <div className="fm-hero-pills">
            <span className="fm-pill">🔎 Flight Search</span>
            <span className="fm-pill">🛂 Visa Guidance</span>
            <span className="fm-pill">🤖 Trip Planner</span>
            <span className="fm-pill">🔔 Fare Alerts</span>
          </div>
        </div>
      </section>

      <main className="fm-container fm-main">
        {/* FLIGHT SEARCH */}
        <section className="fm-card fm-search-card" id="search">
          <div className="fm-section-head">
            <div>
              <div className="fm-eyebrow">Start here</div>

              <h2>✈️ Search & Compare Flights</h2>

              <p className="fm-muted">
                Use the embedded Travelpayouts / Aviasales search engine
                below to check current routes, dates, airlines and prices.
              </p>
            </div>
          </div>

          <div
            ref={flightWidgetRef}
            className="fm-search-widget"
          >
            <div
              style={{
                minHeight: 300,
                display: "grid",
                placeItems: "center",
                color: "var(--fm-muted)",
              }}
            >
              Loading FlyMatrix flight search…
            </div>
          </div>

          <div
            style={{
              display: "flex",
              gap: 8,
              flexWrap: "wrap",
              marginTop: 12,
            }}
          >
            <a
              className="fm-btn fm-btn-primary"
              href={AFFILIATES.flights}
              target="_blank"
              rel="noopener noreferrer"
            >
              Open Flight Search →
            </a>

            <button
              type="button"
              className="fm-btn fm-btn-outline"
              onClick={() => scrollTo("routes")}
            >
              Popular Routes
            </button>
          </div>
        </section>

        {/* QUICK FEATURES */}
        <div className="fm-feature-grid">
          <button
            type="button"
            className="fm-feature"
            onClick={() => scrollTo("visa")}
          >
            <span className="fm-feature-icon">🛂</span>
            <strong>Visa Guidance</strong>
            <small>
              Quick starting-point checks before you travel.
            </small>
          </button>

          <button
            type="button"
            className="fm-feature"
            onClick={() => scrollTo("planner")}
          >
            <span className="fm-feature-icon">🤖</span>
            <strong>Trip Planner</strong>
            <small>
              Build a simple itinerary around your destination.
            </small>
          </button>

          <button
            type="button"
            className="fm-feature"
            onClick={() => scrollTo("extras")}
          >
            <span className="fm-feature-icon">📱</span>
            <strong>Travel Extras</strong>
            <small>
              eSIM, hotels, tours, luggage and assistance.
            </small>
          </button>

          <button
            type="button"
            className="fm-feature"
            onClick={() => scrollTo("alerts")}
          >
            <span className="fm-feature-icon">🔔</span>
            <strong>Fare Alerts</strong>
            <small>
              Join the FlyMatrix travel-alert community.
            </small>
          </button>
        </div>

        {/* FEATURED ROUTES */}
        <section className="fm-card" id="routes">
          <div className="fm-section-head">
            <div>
              <div className="fm-eyebrow">Fare discovery</div>

              <h2>🔥 Featured Routes</h2>

              <p className="fm-muted">
                These are route suggestions, not guaranteed static prices.
                Open the flight search to confirm the current fare.
              </p>
            </div>
          </div>

          <div className="fm-deals">
            {DEALS.slice(0, 3).map(
              ([from, fromCode, to, toCode]) => (
                <article
                  className="fm-ticket"
                  key={`${fromCode}-${toCode}`}
                >
                  <div className="fm-ticket-top">
                    <span className="fm-airline">
                      ✈️ {from} → {to}
                    </span>

                    <span className="fm-badge">
                      Popular
                    </span>
                  </div>

                  <div className="fm-route">
                    <div>
                      <div className="fm-code">
                        {fromCode}
                      </div>
                      <div className="fm-city">
                        {from}
                      </div>
                    </div>

                    <div>
                      <div className="fm-duration">
                        Check current availability
                      </div>

                      <div className="fm-line" />

                      <div className="fm-duration">
                        Airlines & stops vary
                      </div>
                    </div>

                    <div>
                      <div className="fm-code">
                        {toCode}
                      </div>
                      <div className="fm-city">
                        {to}
                      </div>
                    </div>
                  </div>

                  <div className="fm-specs">
                    <div className="fm-spec">
                      🧳
                      <span>Baggage varies</span>
                    </div>

                    <div className="fm-spec">
                      💺
                      <span>Fare dependent</span>
                    </div>

                    <div className="fm-spec">
                      ✈️
                      <span>Economy+</span>
                    </div>
                  </div>

                  <div
                    className="fm-ticket-bottom"
                    style={{ marginTop: 12 }}
                  >
                    <div>
                      <div className="fm-price">
                        Check live fare
                      </div>

                      <div className="fm-price-note">
                        Final price shown by provider
                      </div>
                    </div>

                    <a
                      className="fm-btn fm-btn-primary"
                      href={AFFILIATES.flights}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Search →
                    </a>
                  </div>
                </article>
              )
            )}
          </div>
        </section>

        {/* VISA + PLANNER */}
        <div className="fm-two-col">
          <section className="fm-card" id="visa">
            <div className="fm-section-head">
              <div>
                <div className="fm-eyebrow">
                  Travel preparation
                </div>

                <h2>🛂 Visa Requirement Guide</h2>

                <p className="fm-muted">
                  A planning indication only. Always verify the current
                  requirements with the destination's official authority.
                </p>
              </div>
            </div>

            <div className="fm-form-grid">
              <div>
                <label
                  className="fm-label"
                  htmlFor="passport"
                >
                  Passport
                </label>

                <select
                  id="passport"
                  className="fm-input"
                  value={passport}
                  onChange={(event) =>
                    setPassport(event.target.value)
                  }
                >
                  <option value="NG">
                    Nigeria 🇳🇬
                  </option>
                  <option value="GH">
                    Ghana 🇬🇭
                  </option>
                  <option value="KE">
                    Kenya 🇰🇪
                  </option>
                </select>
              </div>

              <div>
                <label
                  className="fm-label"
                  htmlFor="destination"
                >
                  Destination
                </label>

                <select
                  id="destination"
                  className="fm-input"
                  value={destination}
                  onChange={(event) =>
                    setDestination(event.target.value)
                  }
                >
                  <option value="GB">
                    United Kingdom 🇬🇧
                  </option>
                  <option value="AE">
                    UAE 🇦🇪
                  </option>
                  <option value="CA">
                    Canada 🇨🇦
                  </option>
                </select>
              </div>
            </div>

            <button
              className="fm-btn fm-btn-primary fm-btn-full"
              style={{ marginTop: 10 }}
              type="button"
              onClick={checkVisa}
            >
              Check guidance →
            </button>

            {visaResult && (
              <div className="fm-result">
                <strong>{visaResult}</strong>

                <br />

                <span className="fm-muted">
                  This is guidance, not an immigration decision.
                  Requirements can change.
                </span>
              </div>
            )}
          </section>

          <section className="fm-card" id="planner">
            <div className="fm-section-head">
              <div>
                <div className="fm-eyebrow">
                  Trip planning
                </div>

                <h2>🤖 Travel Blueprint</h2>

                <p className="fm-muted">
                  Generate a practical starting itinerary based on
                  destination, duration and travel style.
                </p>
              </div>
            </div>

            <div className="fm-form-grid">
              <div>
                <label
                  className="fm-label"
                  htmlFor="dest"
                >
                  Destination
                </label>

                <input
                  id="dest"
                  className="fm-input"
                  value={dest}
                  onChange={(event) =>
                    setDest(event.target.value)
                  }
                  placeholder="e.g. London"
                />
              </div>

              <div>
                <label
                  className="fm-label"
                  htmlFor="days"
                >
                  Days
                </label>

                <input
                  id="days"
                  className="fm-input"
                  type="number"
                  min="1"
                  max="30"
                  value={days}
                  onChange={(event) =>
                    setDays(event.target.value)
                  }
                />
              </div>

              <div>
                <label
                  className="fm-label"
                  htmlFor="travel-style"
                >
                  Style
                </label>

                <select
                  id="travel-style"
                  className="fm-input"
                  value={style}
                  onChange={(event) =>
                    setStyle(event.target.value)
                  }
                >
                  <option>
                    Student / Low Budget
                  </option>

                  <option>
                    Vacation / Leisure
                  </option>

                  <option>
                    Executive Business
                  </option>
                </select>
              </div>
            </div>

            <button
              className="fm-btn fm-btn-primary fm-btn-full"
              style={{ marginTop: 10 }}
              type="button"
              onClick={makePlan}
            >
              Build my plan 🚀
            </button>

            {planResult && (
              <div className="fm-result">
                <strong>
                  {planResult.numberOfDays}-Day{" "}
                  {planResult.style} Plan for{" "}
                  {planResult.destination}
                </strong>

                <p
                  className="fm-muted"
                  style={{ marginTop: 5 }}
                >
                  Suggested daily planning range:{" "}
                  {planResult.dailyBudget}, excluding
                  flights. Focus: {planResult.focus}.
                </p>

                <div className="fm-itinerary">
                  {planResult.days.map((item) => (
                    <div
                      className="fm-day"
                      key={item.day}
                    >
                      <b>
                        Day {item.day} — {item.title}
                      </b>

                      <p>{item.body}</p>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  className="fm-btn fm-btn-outline"
                  style={{ marginTop: 10 }}
                  onClick={() => {
                    const text =
                      `FlyMatrix Travel Schedule for ${planResult.destination} ` +
                      `(${planResult.numberOfDays} Days)\n\n` +
                      planResult.days
                        .map(
                          (item) =>
                            `Day ${item.day}: ${item.title} — ${item.body}`
                        )
                        .join("\n");

                    window.open(
                      `https://wa.me/?text=${encodeURIComponent(
                        text
                      )}`,
                      "_blank",
                      "noopener,noreferrer"
                    );
                  }}
                >
                  📲 Share Schedule on WhatsApp
                </button>
              </div>
            )}
          </section>
        </div>

        {/* FARE ALERTS */}
        <section
          className="fm-card fm-vip"
          id="alerts"
        >
          <div className="fm-vip-grid">
            <div>
              <div className="fm-eyebrow">
                Premium travel alerts
              </div>

              <h2
                style={{
                  fontSize: "1.35rem",
                  marginTop: 3,
                }}
              >
                🔔 Never Miss a Useful Fare Drop
              </h2>

              <p
                className="fm-muted"
                style={{
                  marginTop: 7,
                  color: "#cbd5e1",
                }}
              >
                Get curated international fare alerts and
                travel opportunities through the FlyMatrix
                Telegram channel.
              </p>

              <div className="fm-checks">
                <div>✓ Curated flight opportunities</div>
                <div>✓ Route and destination context</div>
                <div>
                  ✓ No fake discounts or invented fares
                </div>
              </div>

              <a
                className="fm-btn fm-btn-primary"
                href={AFFILIATES.telegram}
                target="_blank"
                rel="noopener noreferrer"
              >
                Join Telegram →
              </a>
            </div>

            <div style={{ textAlign: "center" }}>
              <div className="fm-vip-price">$5</div>

              <div
                style={{
                  color: "#94a3b8",
                  fontSize: ".75rem",
                }}
              >
                VIP access
              </div>

              <input
                className="fm-input"
                style={{
                  marginTop: 10,
                  background: "#111827",
                  color: "#fff",
                  borderColor: "#334155",
                }}
                type="email"
                placeholder="Your email"
                value={email}
                onChange={(event) =>
                  setEmail(event.target.value)
                }
              />

              <button
                className="fm-btn fm-btn-primary fm-btn-full"
                style={{ marginTop: 8 }}
                type="button"
                onClick={pay}
                disabled={paymentLoading}
              >
                {paymentLoading
                  ? "Initializing..."
                  : "Subscribe securely →"}
              </button>

              <p
                style={{
                  fontSize: ".58rem",
                  color: "#94a3b8",
                  marginTop: 7,
                }}
              >
                Payment is initialized through the FlyMatrix
                backend.
              </p>
            </div>
          </div>
        </section>

        {/* TRAVEL EXTRAS */}
        <section className="fm-card" id="extras">
          <div className="fm-section-head">
            <div>
              <div className="fm-eyebrow">
                Travel essentials
              </div>

              <h2>🧳 Complete Your Trip</h2>

              <p className="fm-muted">
                Useful services that can make travel easier.
                Availability, terms and prices are determined by
                each provider.
              </p>
            </div>
          </div>

          <div className="fm-monetize">
            <a
              className="fm-tool"
              href={AFFILIATES.hotels}
              target="_blank"
              rel="noopener noreferrer"
            >
              <span className="fm-tool-icon">🏨</span>
              <strong>Hotels</strong>
              <small>
                Find accommodation for your trip.
              </small>
            </a>

            <a
              className="fm-tool"
              href={AFFILIATES.activities}
              target="_blank"
              rel="noopener noreferrer"
            >
              <span className="fm-tool-icon">🎟️</span>
              <strong>Tours & Activities</strong>
              <small>
                Discover experiences at your destination.
              </small>
            </a>

            <a
              className="fm-tool"
              href={AFFILIATES.esim}
              target="_blank"
              rel="noopener noreferrer"
            >
              <span className="fm-tool-icon">📱</span>
              <strong>Global eSIM</strong>
              <small>
                Stay connected while abroad.
              </small>
            </a>

            <a
              className="fm-tool"
              href={AFFILIATES.assistance}
              target="_blank"
              rel="noopener noreferrer"
            >
              <span className="fm-tool-icon">💰</span>
              <strong>Flight Assistance</strong>
              <small>
                Explore assistance for disrupted flights.
              </small>
            </a>

            <a
              className="fm-tool"
              href={AFFILIATES.luggage}
              target="_blank"
              rel="noopener noreferrer"
            >
              <span className="fm-tool-icon">🧳</span>
              <strong>Luggage Storage</strong>
              <small>
                Find storage options in supported cities.
              </small>
            </a>

            <a
              className="fm-tool"
              href={AFFILIATES.flights}
              target="_blank"
              rel="noopener noreferrer"
            >
              <span className="fm-tool-icon">✈️</span>
              <strong>Compare More Flights</strong>
              <small>
                Return to flight search and compare options.
              </small>
            </a>
          </div>
        </section>

        {/* VISA PARTNER CTA */}
        <section className="fm-card">
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: 15,
              alignItems: "center",
              flexWrap: "wrap",
            }}
          >
            <div>
              <div className="fm-eyebrow">
                Visa services
              </div>

              <h2>🛂 Continue your visa research</h2>

              <p className="fm-muted">
                Use the partner service for additional visa
                information and assistance.
              </p>
            </div>

            <a
              className="fm-btn fm-btn-primary"
              href={AFFILIATES.visa}
              target="_blank"
              rel="noopener noreferrer"
            >
              Visa Options →
            </a>
          </div>
        </section>

        {/* TRUST / FAQ */}
        <section className="fm-card fm-faq">
          <div className="fm-section-head">
            <div>
              <div className="fm-eyebrow">
                FlyMatrix Promise
              </div>

              <h2>
                ⭐ Why Travelers Can Trust FlyMatrix
              </h2>
            </div>
          </div>

          <div className="fm-notice">
            FlyMatrix is designed to help you make better
            travel decisions. We do not guarantee a particular
            fare, airline schedule, visa outcome or third-party
            service. Prices, availability and travel
            requirements can change. Always confirm final
            details with the relevant provider, airline or
            official immigration authority.
          </div>

          <details open>
            <summary>
              Are the flight prices on FlyMatrix guaranteed?
            </summary>

            <p>
              No. Flight prices can change quickly. FlyMatrix
              sends travelers to the booking/search partner to
              confirm current availability and final pricing
              before purchase.
            </p>
          </details>

          <details>
            <summary>
              Does FlyMatrix issue visas?
            </summary>

            <p>
              No. The visa tool is a planning guide only. Visa
              decisions and requirements are controlled by the
              relevant government authority.
            </p>
          </details>

          <details>
            <summary>
              How does FlyMatrix make money?
            </summary>

            <p>
              FlyMatrix may earn commissions or referral fees
              when users choose eligible third-party travel
              services. This does not change the core travel
              information or the user's ability to compare
              options.
            </p>
          </details>

          <details>
            <summary>
              Can I suggest a deal or report a problem?
            </summary>

            <p>
              Yes. Use the Telegram channel below to contact
              the FlyMatrix team with a route, fare or
              user-experience issue.
            </p>
          </details>

          <details>
            <summary>
              Does FlyMatrix guarantee airline schedules?
            </summary>

            <p>
              No. Airlines and travel providers control
              schedules, availability, cancellation policies and
              final booking conditions.
            </p>
          </details>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="fm-footer">
        <strong>⚡ FLYMATRIX</strong>

        <br />

        Global flight search & travel intelligence. FlyMatrix
        is an independent travel-information and referral
        platform. Third-party trademarks, booking services,
        prices, availability and policies belong to their
        respective providers.
      </footer>

      {/* STICKY TELEGRAM */}
      <div className="fm-sticky">
        <div className="fm-sticky-inner">
          <span>🔔 Want useful fare alerts?</span>

          <a
            className="fm-btn fm-btn-primary"
            href={AFFILIATES.telegram}
            target="_blank"
            rel="noopener noreferrer"
          >
            Join FlyMatrix Telegram →
          </a>
        </div>
      </div>

      {/* TOAST */}
      <div
        className={`fm-toast ${
          toastMessage ? "show" : ""
        }`}
      >
        {toastMessage}
      </div>
    </div>
  );
}

export default App;
