import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client using your environment keys
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Master dataset combining leisure and education tracks with built-in affiliate templates
const globalDestinationsBatch = [
  {
    destination_code: "AL-SAR",
    category: "leisure",
    title: "Sarandë & Ksamil",
    country: "Albania",
    currency: "USD",
    primary_airport_code: "TIA",
    base_budget_breakdown: {
      accommodation: 140,
      transport: 40,
      food: 105,
      activities_tech: 60,
      total: 345
    },
    affiliate_templates: {
      flight: "https://www.travelpayouts.com/flights/TIA?marker=YOUR_AFFILIATE_ID",
      hotel: "https://www.booking.com/searchresults.html?ss=Sarande&aid=YOUR_AFFILIATE_ID",
      esim: "https://airalo.com?partner=YOUR_AFFILIATE_ID"
    }
  },
  {
    destination_code: "DE-BER",
    category: "education",
    title: "Berlin & Munich",
    country: "Germany",
    currency: "EUR",
    primary_airport_code: "BER",
    base_budget_breakdown: {
      accommodation: 420,
      transport: 45,
      food: 250,
      activities_tech: 85,
      total: 800
    },
    affiliate_templates: {
      flight: "https://www.travelpayouts.com/flights/BER?marker=YOUR_AFFILIATE_ID",
      hotel: "https://www.booking.com/searchresults.html?ss=Berlin&aid=YOUR_AFFILIATE_ID",
      esim: "https://airalo.com?partner=YOUR_AFFILIATE_ID"
    }
  },
  {
    destination_code: "JP-TYO",
    category: "leisure",
    title: "Tokyo & Kyoto",
    country: "Japan",
    currency: "USD",
    primary_airport_code: "NRT",
    base_budget_breakdown: {
      accommodation: 350,
      transport: 120,
      food: 210,
      activities_tech: 90,
      total: 770
    },
    affiliate_templates: {
      flight: "https://www.travelpayouts.com/flights/NRT?marker=YOUR_AFFILIATE_ID",
      hotel: "https://www.booking.com/searchresults.html?ss=Tokyo&aid=YOUR_AFFILIATE_ID",
      esim: "https://airalo.com?partner=YOUR_AFFILIATE_ID"
    }
  }
  // You can easily append hundreds more global objects here!
];

async function seedDatabase() {
  console.log("[Seed Script] Starting bulk upload to Supabase...");

  const { data, error } = await supabase
    .from('global_destinations')
    .upsert(globalDestinationsBatch, { onConflict: 'destination_code' });

  if (error) {
    console.error("[Error] Bulk insertion failed:", error.message);
  } else {
    console.log("[Success] Successfully seeded global destinations into Supabase!");
  }
}

seedDatabase();
