import { useEffect, useState } from "react";

import { apiFetch } from "../utils/api.js";

export function useDestinations(category = "") {
  const [destinations, setDestinations] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {
    let mounted = true;

    setLoading(true);
    setError("");

    apiFetch(
      "destinations",
      category ? { category } : {}
    )
      .then((data) => {
        if (mounted) {
          setDestinations(
            data.destinations || []
          );
        }
      })
      .catch((error) => {
        if (mounted) {
          setError(error.message);
        }
      })
      .finally(() => {
        if (mounted) {
          setLoading(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, [category]);

  return {
    destinations,
    loading,
    error
  };
}
