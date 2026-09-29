import React, {
  useState
} from "react";

import { apiPost } from "../utils/api.js";

export default function PaystackButton({
  planName = "Pro",
  amount = 15000,
  email = ""
}) {
  const [loading, setLoading] =
    useState(false);

  async function checkout() {
    if (!email) {
      alert(
        "Enter your email before checkout."
      );

      return;
    }

    try {
      setLoading(true);

      const data =
        await apiPost(
          "pay",
          {
            email,
            amount,
            metadata: {
              plan: planName
            }
          }
        );

      if (!data.authorizationUrl) {
        throw new Error(
          "Payment URL was not returned."
        );
      }

      window.location.href =
        data.authorizationUrl;
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      className="fm-btn fm-primary"
      onClick={checkout}
      disabled={loading}
    >
      {loading
        ? "Opening checkout..."
        : `Get ${planName}`}
    </button>
  );
}
