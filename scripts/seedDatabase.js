import "dotenv/config";

import {
  createClient
} from "@supabase/supabase-js";

const supabaseUrl =
  process.env.SUPABASE_URL;

const supabaseKey =
  process.env
    .SUPABASE_SERVICE_ROLE_KEY;

if (
  !supabaseUrl ||
  !supabaseKey
) {
  console.error(
    "SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required."
  );

  process.exit(1);
}

const supabase =
  createClient(
    supabaseUrl,
    supabaseKey
  );

const destinations = [
  {
    destination_code: "LHR",
    destination_name:
      "London",
    country:
      "United Kingdom",
    category:
      "leisure",
    is_active: true
  },

  {
    destination_code: "DXB",
    destination_name:
      "Dubai",
    country:
      "United Arab Emirates",
    category:
      "leisure",
    is_active: true
  },

  {
    destination_code: "YYZ",
    destination_name:
      "Toronto",
    country:
      "Canada",
    category:
      "leisure",
    is_active: true
  },

  {
    destination_code: "MAN",
    destination_name:
      "Manchester",
    country:
      "United Kingdom",
    category:
      "leisure",
    is_active: true
  },

  {
    destination_code: "CDG",
    destination_name:
      "Paris",
    country:
      "France",
    category:
      "leisure",
    is_active: true
  },

  {
    destination_code: "AMS",
    destination_name:
      "Amsterdam",
    country:
      "Netherlands",
    category:
      "leisure",
    is_active: true
  },

  {
    destination_code: "FRA",
    destination_name:
      "Frankfurt",
    country:
      "Germany",
    category:
      "education",
    is_active: true
  }
];

async function seed() {
  const {
    error
  } =
    await supabase
      .from(
        "global_destinations"
      )
      .upsert(
        destinations,
        {
          onConflict:
            "destination_code"
        }
      );

  if (error) {
    throw error;
  }

  console.log(
    `Seeded ${destinations.length} destinations.`
  );
}

seed().catch(
  (error) => {
    console.error(error);
    process.exit(1);
  }
);
