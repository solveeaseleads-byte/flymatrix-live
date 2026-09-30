import "dotenv/config";

import { createClient } from "@supabase/supabase-js";

// =========================================================
// FLYMATRIX GLOBAL DESTINATION SEED
// =========================================================

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error(
    "Missing required environment variables:"
  );

  if (!supabaseUrl) {
    console.error("- SUPABASE_URL");
  }

  if (!supabaseKey) {
    console.error(
      "- SUPABASE_SERVICE_ROLE_KEY"
    );
  }

  process.exit(1);
}

const supabase = createClient(
  supabaseUrl,
  supabaseKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

// =========================================================
// DESTINATION DATA
// =========================================================

const destinations = [
  {
    destination_code: "LHR",
    destination_name: "London",
    country: "United Kingdom",
    category: "leisure",
    is_active: true
  },

  {
    destination_code: "DXB",
    destination_name: "Dubai",
    country: "United Arab Emirates",
    category: "leisure",
    is_active: true
  },

  {
    destination_code: "YYZ",
    destination_name: "Toronto",
    country: "Canada",
    category: "leisure",
    is_active: true
  },

  {
    destination_code: "MAN",
    destination_name: "Manchester",
    country: "United Kingdom",
    category: "leisure",
    is_active: true
  },

  {
    destination_code: "CDG",
    destination_name: "Paris",
    country: "France",
    category: "leisure",
    is_active: true
  },

  {
    destination_code: "AMS",
    destination_name: "Amsterdam",
    country: "Netherlands",
    category: "leisure",
    is_active: true
  },

  {
    destination_code: "FRA",
    destination_name: "Frankfurt",
    country: "Germany",
    category: "education",
    is_active: true
  }
];

// =========================================================
// VALIDATION
// =========================================================

function validateDestinations(items) {
  if (!Array.isArray(items) || items.length === 0) {
    throw new Error(
      "No destinations were supplied."
    );
  }

  const seen = new Set();

  for (const destination of items) {
    if (
      !destination.destination_code ||
      !destination.destination_name
    ) {
      throw new Error(
        "Every destination requires destination_code and destination_name."
      );
    }

    const code =
      destination.destination_code
        .trim()
        .toUpperCase();

    if (seen.has(code)) {
      throw new Error(
        `Duplicate destination code: ${code}`
      );
    }

    seen.add(code);

    destination.destination_code = code;

    if (
      !destination.country ||
      !destination.category
    ) {
      throw new Error(
        `Incomplete destination data for ${code}.`
      );
    }

    destination.is_active =
      destination.is_active !== false;
  }
}

// =========================================================
// SEED
// =========================================================

async function seed() {
  validateDestinations(
    destinations
  );

  console.log(
    `Preparing to seed ${destinations.length} destinations...`
  );

  const {
    data,
    error
  } = await supabase
    .from("global_destinations")
    .upsert(
      destinations,
      {
        onConflict:
          "destination_code"
      }
    )
    .select(
      "destination_code,destination_name,country,category,is_active"
    );

  if (error) {
    throw new Error(
      `Supabase destination seed failed: ${error.message}`
    );
  }

  console.log(
    `Successfully seeded ${data?.length ?? destinations.length} destinations.`
  );

  for (const destination of data ?? []) {
    console.log(
      `✓ ${destination.destination_code} — ${destination.destination_name}`
    );
  }
}

// =========================================================
// MAIN
// =========================================================

async function main() {
  try {
    await seed();

    console.log(
      "FlyMatrix destination seeding completed successfully."
    );
  } catch (error) {
    console.error(
      "FlyMatrix destination seeding failed:"
    );

    console.error(
      error?.message || error
    );

    process.exitCode = 1;
  }
}

main();
