import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('[Error] Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in environment variables.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const globalDestinationsData = [
  // --- LEISURE TRACK ---
  {
    destination_code: 'PAR-FRA',
    destination_name: 'Paris',
    country: 'France',
    category: 'leisure',
    is_active: true,
    budget_template: {
      track: 'leisure',
      currency: 'EUR',
      accommodation_avg_per_night: 140,
      daily_transit: 25,
      daily_food_allowance: 60,
      attractions_and_leisure: 90,
      emergency_buffer: 50
    },
    affiliate_mappings: {
      hotel_partner: 'booking',
      hotel_deep_link: 'https://www.booking.com/searchresults.html?ss=Paris&aid=your_affiliate_id',
      flight_partner: 'skyscanner',
      flight_deep_link: 'https://www.skyscanner.net/transport/flights/to/parm?associateid=your_affiliate_id'
    },
    highlights: [
      'Iconic art museums like the Louvre and Musée d\'Orsay',
      'World-class French culinary and café culture',
      'Historic architecture along the Seine'
    ]
  },
  {
    destination_code: 'BCN-ESP',
    destination_name: 'Barcelona',
    country: 'Spain',
    category: 'leisure',
    is_active: true,
    budget_template: {
      track: 'leisure',
      currency: 'EUR',
      accommodation_avg_per_night: 110,
      daily_transit: 20,
      daily_food_allowance: 45,
      attractions_and_leisure: 70,
      emergency_buffer: 40
    },
    affiliate_mappings: {
      hotel_partner: 'booking',
      hotel_deep_link: 'https://www.booking.com/searchresults.html?ss=Barcelona&aid=your_affiliate_id',
      flight_partner: 'skyscanner',
      flight_deep_link: 'https://www.skyscanner.net/transport/flights/to/bcn?associateid=your_affiliate_id'
    },
    highlights: [
      'Mediterranean beaches and vibrant boardwalks',
      'Stunning Gaudí architecture including Sagrada Família',
      'Lively Gothic Quarter and tapas culture'
    ]
  },
  {
    destination_code: 'NYC-USA',
    destination_name: 'New York City',
    country: 'United States',
    category: 'leisure',
    is_active: true,
    budget_template: {
      track: 'leisure',
      currency: 'USD',
      accommodation_avg_per_night: 220,
      daily_transit: 30,
      daily_food_allowance: 80,
      attractions_and_leisure: 120,
      emergency_buffer: 75
    },
    affiliate_mappings: {
      hotel_partner: 'booking',
      hotel_deep_link: 'https://www.booking.com/searchresults.html?ss=New+York&aid=your_affiliate_id',
      flight_partner: 'skyscanner',
      flight_deep_link: 'https://www.skyscanner.net/transport/flights/to/nyc?associateid=your_affiliate_id'
    },
    highlights: [
      'Manhattan skyline views and Central Park',
      'World-famous Broadway theater district',
      'Diverse global shopping and dining hubs'
    ]
  },
  {
    destination_code: 'DXB-ARE',
    destination_name: 'Dubai',
    country: 'UAE',
    category: 'leisure',
    is_active: true,
    budget_template: {
      track: 'leisure',
      currency: 'AED',
      accommodation_avg_per_night: 550,
      daily_transit: 90,
      daily_food_allowance: 220,
      attractions_and_leisure: 350,
      emergency_buffer: 200
    },
    affiliate_mappings: {
      hotel_partner: 'booking',
      hotel_deep_link: 'https://www.booking.com/searchresults.html?ss=Dubai&aid=your_affiliate_id',
      flight_partner: 'skyscanner',
      flight_deep_link: 'https://www.skyscanner.net/transport/flights/to/dxb?associateid=your_affiliate_id'
    },
    highlights: [
      'Ultra-modern architecture and luxury shopping malls',
      'Thrilling desert safaris and dune adventures',
      'Pristine coastline and world-class entertainment'
    ]
  },
  {
    destination_code: 'TYO-JPN',
    destination_name: 'Tokyo',
    country: 'Japan',
    category: 'leisure',
    is_active: true,
    budget_template: {
      track: 'leisure',
      currency: 'JPY',
      accommodation_avg_per_night: 18000,
      daily_transit: 2500,
      daily_food_allowance: 7000,
      attractions_and_leisure: 6000,
      emergency_buffer: 5000
    },
    affiliate_mappings: {
      hotel_partner: 'booking',
      hotel_deep_link: 'https://www.booking.com/searchresults.html?ss=Tokyo&aid=your_affiliate_id',
      flight_partner: 'skyscanner',
      flight_deep_link: 'https://www.skyscanner.net/transport/flights/to/tyo?associateid=your_affiliate_id'
    },
    highlights: [
      'Fascinating blend of neon-lit high-tech districts and serene shrines',
      'World-class culinary landscape from street food to Michelin stars',
      'Unique pop-culture hubs like Akihabara and Shibuya'
    ]
  },

  // --- EDUCATION TRACK ---
  {
    destination_code: 'LON-GBR',
    destination_name: 'London',
    country: 'United Kingdom',
    category: 'education',
    is_active: true,
    budget_template: {
      track: 'education',
      currency: 'GBP',
      accommodation_avg_per_night: 95,
      daily_transit: 18,
      daily_food_allowance: 35,
      academic_resources_and_library_access: 30,
      emergency_buffer: 40
    },
    affiliate_mappings: {
      student_housing_partner: 'uniplaces',
      housing_deep_link: 'https://www.uniplaces.com/accommodation/london?ref=your_affiliate_id',
      flight_partner: 'skyscanner',
      flight_deep_link: 'https://www.skyscanner.net/transport/flights/to/lonn?associateid=your_affiliate_id'
    },
    highlights: [
      'World-renowned academic libraries and research archives',
      'Global networking events and professional workshops',
      'Rich historical institutions and museum districts'
    ]
  },
  {
    destination_code: 'ROM-ITA',
    destination_name: 'Rome',
    country: 'Italy',
    category: 'education',
    is_active: true,
    budget_template: {
      track: 'education',
      currency: 'EUR',
      accommodation_avg_per_night: 80,
      daily_transit: 15,
      daily_food_allowance: 30,
      academic_resources_and_library_access: 25,
      emergency_buffer: 35
    },
    affiliate_mappings: {
      student_housing_partner: 'uniplaces',
      housing_deep_link: 'https://www.uniplaces.com/accommodation/rome?ref=your_affiliate_id',
      flight_partner: 'skyscanner',
      flight_deep_link: 'https://www.skyscanner.net/transport/flights/to/romc?associateid=your_affiliate_id'
    },
    highlights: [
      'Unrivaled access to classical history and archaeology studies',
      'Rich classical architecture and historical preservation archives',
      'Inspiring cultural centers and international student communities'
    ]
  },
  {
    destination_code: 'BOS-USA',
    destination_name: 'Boston',
    country: 'United States',
    category: 'education',
    is_active: true,
    budget_template: {
      track: 'education',
      currency: 'USD',
      accommodation_avg_per_night: 150,
      daily_transit: 22,
      daily_food_allowance: 45,
      academic_resources_and_library_access: 40,
      emergency_buffer: 50
    },
    affiliate_mappings: {
      student_housing_partner: 'uniplaces',
      housing_deep_link: 'https://www.uniplaces.com/accommodation/boston?ref=your_affiliate_id',
      flight_partner: 'skyscanner',
      flight_deep_link: 'https://www.skyscanner.net/transport/flights/to/bos?associateid=your_affiliate_id'
    },
    highlights: [
      'Proximity to premier global universities (Harvard, MIT)',
      'Extensive research symposiums and tech innovation clusters',
      'Historical American landmarks and academic libraries'
    ]
  },
  {
    destination_code: 'SIN-SGP',
    destination_name: 'Singapore',
    country: 'Singapore',
    category: 'education',
    is_active: true,
    budget_template: {
      track: 'education',
      currency: 'SGD',
      accommodation_avg_per_night: 130,
      daily_transit: 20,
      daily_food_allowance: 40,
      academic_resources_and_library_access: 35,
      emergency_buffer: 45
    },
    affiliate_mappings: {
      student_housing_partner: 'uniplaces',
      housing_deep_link: 'https://www.uniplaces.com/accommodation/singapore?ref=your_affiliate_id',
      flight_partner: 'skyscanner',
      flight_deep_link: 'https://www.skyscanner.net/transport/flights/to/sin?associateid=your_affiliate_id'
    },
    highlights: [
      'Advanced urban planning and sustainable development studies',
      'Top-tier technological institutes and corporate R&D partnerships',
      'Safe, multicultural environment tailored for student researchers'
    ]
  },
  {
    destination_code: 'BER-DEU',
    destination_name: 'Berlin',
    country: 'Germany',
    category: 'education',
    is_active: true,
    budget_template: {
      track: 'education',
      currency: 'EUR',
      accommodation_avg_per_night: 75,
      daily_transit: 16,
      daily_food_allowance: 30,
      academic_resources_and_library_access: 20,
      emergency_buffer: 30
    },
    affiliate_mappings: {
      student_housing_partner: 'uniplaces',
      housing_deep_link: 'https://www.uniplaces.com/accommodation/berlin?ref=your_affiliate_id',
      flight_partner: 'skyscanner',
      flight_deep_link: 'https://www.skyscanner.net/transport/flights/to/ber?associateid=your_affiliate_id'
    },
    highlights: [
      'Deep modern European history and political science focal point',
      'Thriving startup ecosystem and technical engineering academies',
      'Vibrant contemporary arts and affordable student living culture'
    ]
  }
];

async function seedDatabase() {
  console.log('[Seeder] Starting global destinations ingestion...');

  const { data, error } = await supabase
    .from('global_destinations')
    .upsert(globalDestinationsData, { onConflict: 'destination_code' });

  if (error) {
    console.error('[Seeder Error] Failed to insert destination records:', error.message);
    process.exit(1);
  }

  console.log(`[Seeder Success] Successfully upserted ${globalDestinationsData.length} global destinations into Supabase!`);
  process.exit(0);
}

seedDatabase();
