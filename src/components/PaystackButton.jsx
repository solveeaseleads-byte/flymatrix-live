'use client';

import React, { useState } from 'react';

export default function PaystackButton({ email, amount, planName }) {
  const [loading, setLoading] = useState(false);

  const handleCheckout = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/pay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          amount,
          metadata: { plan: planName },
        }),
      });

      const data = await res.json();
      if (data.authorizationUrl) {
        window.location.href = data.authorizationUrl; // Redirect to Paystack Hosted Checkout
      } else {
        alert(data.error || 'Payment initialization failed.');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleCheckout}
      disabled={loading}
      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 px-6 rounded-xl transition-all shadow-sm disabled:opacity-50"
    >
      {loading ? 'Initializing...' : `Unlock ${planName} — ₦${amount.toLocaleString()}`}
    </button>
  );
}
