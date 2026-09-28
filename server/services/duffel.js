import { config }
  from "../config.js";

import {
  normalizeDuffelOffer
} from "./flightNormalizer.js";

export async function searchDuffelFlights({
  origin,
  destination,
  departureDate,
  returnDate,
  passengers = 1,
  cabin = "economy"
}) {
  if (!config.providers.duffel.apiKey) {
    const error = new Error(
      "Duffel is not configured."
    );

    error.code =
      "DUFFEL_NOT_CONFIGURED";

    throw error;
  }

  const slices = [
    {
      origin,
      destination,
      departure_date:
        departureDate
    }
  ];

  if (returnDate) {
    slices.push({
      origin: destination,
      destination: origin,
      departure_date:
        returnDate
    });
  }

  const body = {
    data: {
      slices,

      passengers:
        Array.from(
          {
            length:
              Number(passengers)
          },
          () => ({
            type: "adult"
          })
        ),

      cabin_class: cabin
    }
  };

  const response =
    await fetch(
      `${config.providers.duffel.baseUrl}/air/offer_requests?return_offers=true`,
      {
        method: "POST",

        headers: {
          Authorization:
            `Bearer ${config.providers.duffel.apiKey}`,

          "Duffel-Version":
            config.providers.duffel.version,

          "Content-Type":
            "application/json"
        },

        body:
          JSON.stringify(body)
      }
    );

  const data =
    await response.json();

  if (!response.ok) {
    throw new Error(
      data?.errors?.[0]?.message ||
      "Duffel flight search failed."
    );
  }

  return (
    data?.data?.offers || []
  ).map(
    normalizeDuffelOffer
  );
}
