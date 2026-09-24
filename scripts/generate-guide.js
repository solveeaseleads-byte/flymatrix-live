const fs = require('fs');
const path = require('path');

/**
 * FlyMatrix — Dual-Track Global Guide Generator
 *
 * Usage:
 *
 * Educational:
 * node scripts/generate-guide.js portugal "Portugal" "Europe" edu
 *
 * Leisure:
 * node scripts/generate-guide.js portugal "Portugal" "Europe" leisure
 *
 * Output:
 * content/guides/portugal-edu.mdx
 * content/guides/portugal-leisure.mdx
 */

const args = process.argv.slice(2);

const slug = args[0] || 'destination';
const title = args[1] || 'New Destination';
const region = args[2] || 'Europe';
const type = (args[3] || 'leisure').toLowerCase();

const supportedTypes = ['edu', 'leisure'];

if (!supportedTypes.includes(type)) {
  console.error(
    '❌ Invalid guide type. Use "edu" or "leisure".'
  );
  process.exit(1);
}

const isEdu = type === 'edu';

const guideType = isEdu
  ? 'Educational Tourism'
  : 'Leisure Tourism';

const trackTitle = isEdu
  ? `${title} Educational Tourism Track`
  : `${title} Leisure Tourism Track`;

const outputDir = path.join(
  __dirname,
  '../content/guides'
);

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, {
    recursive: true,
  });
}

/**
 * ---------------------------------------------------------
 * Track-specific configuration
 * ---------------------------------------------------------
 */

const configuration = isEdu
  ? {
      dailySpend: 85,

      tier: 'Educational & Cultural Study',

      focus: [
        'Research',
        'Workshops',
        'Seminars',
        'Academic Networking',
        'Cultural Education',
      ],

      activityTitle:
        'International Research & Education Symposium',

      activityDate:
        'May 10 – May 25, 2026',

      activityTime:
        '09:00–13:00',

      venue:
        `Central Research & Education Venue, ${title}`,

      discussionTopics: [
        'International education',
        'Research collaboration',
        'Professional development',
        'Skills development',
        'Cultural exchange',
      ],

      activityBudget: 450,

      foodHighlight:
        'Historic refectories, scholarly cafes and local regional cuisine',

      flightPrice: 120,
      hotelPrice: 60,
      hostelPrice: 20,
      trainPrice: 15,
      transferPrice: 20,

      coverImage:
        `/images/guides/${slug}-edu-cover.jpg`,
    }
  : {
      dailySpend: 85,

      tier: 'Leisure & Cultural Travel',

      focus: [
        'Sightseeing',
        'Biking',
        'Hiking',
        'Fitness',
        'Swimming',
        'Games',
        'Relaxation',
        'Cultural Events',
      ],

      activityTitle:
        'Global Summer Heritage & Cultural Festival',

      activityDate:
        'June 12 – June 13, 2026',

      activityTime:
        '09:00–22:00',

      venue:
        `Historic Cultural Center, ${title}`,

      discussionTopics: [
        'Local culture',
        'Heritage',
        'Regional tourism',
        'Outdoor recreation',
        'Cultural exchange',
      ],

      activityBudget: 0,

      foodHighlight:
        'Local street food, regional delicacies and traditional restaurants',

      flightPrice: 120,
      hotelPrice: 70,
      hostelPrice: 25,
      trainPrice: 15,
      transferPrice: 20,

      coverImage:
        `/images/guides/${slug}-leisure-cover.jpg`,
    };

/**
 * ---------------------------------------------------------
 * YAML helper
 * ---------------------------------------------------------
 */

function yamlArray(items) {
  return items
    .map((item) => `    - "${item}"`)
    .join('\n');
}

/**
 * ---------------------------------------------------------
 * MDX document
 * ---------------------------------------------------------
 */

const template = `---
title: "${title} — ${guideType} Travel Guide"
year: "2026"
region: "${region}"
country: "${title}"
slug: "${slug}-${type}"

tier: "${configuration.tier}"
budgetCategory: "Budget-Friendly to Premium"
estimatedDailySpend: ${configuration.dailySpend}

travelTracks:
  - "${guideType}"

focus:
${yamlArray(configuration.focus)}

securityStatus: "Verify current official travel advisory before departure"

weatherSummary: "Verify current seasonal weather and local conditions before departure"

foodProfile:
  avgMealCost: "€10 – €30"
  culinaryHighlight: "${configuration.foodHighlight}"

coverImage: "${configuration.coverImage}"

affiliateNetwork:
  provider: "Travelpayouts"
  verticals:
    - "flights"
    - "trains"
    - "transfers"
  liveConfirmationRequired: true
  directBookingLinks: true

prices:
  flightMin: ${configuration.flightPrice}
  hotelMin: ${configuration.hotelPrice}
  hostelMin: ${configuration.hostelPrice}
  trainMin: ${configuration.trainPrice}
  transferMin: ${configuration.transferPrice}

${isEdu ? `educationalTrack:
  title: "${trackTitle}"
  duration: "7 Days"
  focus:
${yamlArray(configuration.focus)}
` : `leisureTrack:
  title: "${trackTitle}"
  duration: "7 Days"
  focus:
${yamlArray(configuration.focus)}
`}
---

import DestinationMetricsCard from '@/components/DestinationMetricsCard';
import FlightSearchCard from '@/components/FlightSearchCard';
import AffiliatedPriceTag from '@/components/AffiliatedPriceTag';

<DestinationMetricsCard
  security="Verify current official travel advisory before departure"
  weather="Verify current seasonal conditions"
  foodCost="€10 – €30 per meal"
  foodHighlight="${configuration.foodHighlight}"
/>

# ${title} 2026 — ${guideType}

This guide provides a structured ${guideType.toLowerCase()} plan for travellers visiting **${title}**.

The itinerary combines travel planning, accommodation, transportation and scheduled activities while separating **indicative planning prices** from prices that must be confirmed through the live booking provider.

---

# Flight Planning

<FlightSearchCard
  origin="LOS"
  destination="${title}"
  defaultRoute="/flights/to-${slug}"
/>

<AffiliatedPriceTag
  label="Compare Flights"
  basePriceEUR={${configuration.flightPrice}}
  subpath="/flights"
/>

**Planning price:** €${configuration.flightPrice}+

Final flight availability, taxes, baggage rules and booking conditions must be confirmed through the live booking destination.

---

# ${trackTitle}

## Day 1 — Arrival & Orientation

**Morning**

Arrival at the destination and airport transfer.

<AffiliatedPriceTag
  label="Airport Transfer"
  basePriceEUR={${configuration.transferPrice}}
  subpath="/transfers"
/>

**Afternoon**

Destination orientation and introduction to the local environment.

**Evening**

Local dining and cultural orientation.

**Estimated food budget:** €10–€30.

---

## Day 2 — Core ${isEdu ? 'Educational' : 'Leisure'} Activity

### ${configuration.activityTitle}

**Date:** ${configuration.activityDate}

**Time:** ${configuration.activityTime}

**Venue:** ${configuration.venue}

**Estimated activity budget:** €${configuration.activityBudget}

### Functional Topics

${configuration.discussionTopics
  .map((topic) => `- ${topic}`)
  .join('\n')}

---

## Day 3 — Transportation & Destination Exploration

**Morning**

Local destination exploration.

**Afternoon**

Intercity or regional travel where applicable.

<AffiliatedPriceTag
  label="${isEdu ? 'Rail Planning' : 'Train / Regional Transport'}"
  basePriceEUR={${configuration.trainPrice}}
  subpath="/trains"
/>

**Estimated rail planning price:** €${configuration.trainPrice}+

Final availability must be confirmed with the live provider.

---

## Day 4 — ${isEdu ? 'Research & Cultural Learning' : 'Culture & Recreation'}

**Morning**

${isEdu
  ? 'Research, seminar or structured educational session.'
  : 'Destination sightseeing and cultural exploration.'}

**Afternoon**

${isEdu
  ? 'Cultural education and local heritage research.'
  : 'Biking, outdoor activities, swimming or organised recreation.'}

**Evening**

${isEdu
  ? 'Academic networking and discussion.'
  : 'Cultural event, entertainment or relaxation.'}

---

## Day 5 — ${isEdu ? 'Workshop & Outdoor Learning' : 'Adventure & Fitness'}

**Morning**

${isEdu
  ? 'Workshop or professional-development session.'
  : 'Hiking, biking or structured outdoor activity.'}

**Afternoon**

${isEdu
  ? 'Outdoor learning and destination research.'
  : 'Fitness, swimming, games or beach activity.'}

**Evening**

Free time and local dining.

---

## Day 6 — ${isEdu ? 'Research & Cultural Exchange' : 'Premium Leisure Day'}

**Morning**

${isEdu
  ? 'Research review and international knowledge exchange.'
  : 'Guided excursion or premium destination experience.'}

**Afternoon**

${isEdu
  ? 'Cultural exchange and networking.'
  : 'Spa, wellness, swimming, fitness or relaxation.'}

**Evening**

${isEdu
  ? 'Final networking session.'
  : 'Premium dining or cultural entertainment.'}

---

## Day 7 — Final Review & Departure

**Morning**

${isEdu
  ? 'Final educational review, discussion and documentation.'
  : 'Final sightseeing, shopping and relaxation.'}

**Afternoon**

Departure preparation.

<AffiliatedPriceTag
  label="Airport Transfer"
  basePriceEUR={${configuration.transferPrice}}
  subpath="/transfers"
/>

---

# Accommodation Planning

### Budget Accommodation

Indicative planning range:

**€${configuration.hostelPrice}–€60 per night**

### Mid-Range Accommodation

Indicative planning range:

**€60–€120 per night**

### Premium Accommodation

Indicative planning range:

**€120+ per night**

Accommodation prices must be checked against the traveller's exact dates and confirmed through the relevant live booking provider.

---

# Session-Based Travel Recommendations

When a traveller searches for a flight, the application can retain:

- Origin
- Destination
- Departure date
- Return date
- Traveller count
- Selected travel track

The destination and dates can then be reused to display relevant accommodation and transportation recommendations.

### Example

**Your ${title} travel dates have been captured.**

Recommended next step:

**Check accommodation for your selected dates.**

---

# Travel Conversion Layer

Every commercial travel recommendation should provide a clear next action:

- Search Flights
- Check Accommodation
- Book Train
- Book Airport Transfer
- View Activity
- Compare Options

Affiliate campaign identifiers can be attached to outbound links for performance tracking.

---

# Price-Drop Alert Architecture

A future alert service can allow a traveller to save:

**Origin:** Selected airport

**Destination:** ${title}

**Travel date:** Selected date

**Email:** Traveller email

The application can periodically query supported price sources and notify the traveller when an eligible price change is detected.

A notification can contain:

- Updated flight price
- Direct booking link
- Accommodation recommendation
- Transfer recommendation
- Travel-insurance recommendation

---

# Budget Framework

| Category | Indicative Planning Range |
|---|---:|
| Flight | €${configuration.flightPrice}+ |
| Hostel | €${configuration.hostelPrice}+ / night |
| Hotel | €${configuration.hotelPrice}+ / night |
| Food | €10–€30 / meal |
| Train | €${configuration.trainPrice}+ |
| Airport Transfer | €${configuration.transferPrice}+ |
| Activities | Variable |
| Premium Experiences | Variable |

---

# Booking Confirmation Rule

Prices displayed in this guide are **planning estimates unless explicitly returned and confirmed by the live booking provider**.

Travellers should verify:

- Current price
- Availability
- Taxes
- Baggage
- Cancellation terms
- Booking conditions
- Activity availability
- Current travel advisories

before making payment.

---

# Direct Booking Actions

<FlightSearchCard
  origin="LOS"
  destination="${title}"
  defaultRoute="/flights/to-${slug}"
/>

<AffiliatedPriceTag
  label="Compare Flights"
  basePriceEUR={${configuration.flightPrice}}
  subpath="/flights"
/>

<AffiliatedPriceTag
  label="Check Rail Options"
  basePriceEUR={${configuration.trainPrice}}
  subpath="/trains"
/>

<AffiliatedPriceTag
  label="Check Airport Transfers"
  basePriceEUR={${configuration.transferPrice}}
  subpath="/transfers"
/>

---

# ${title} Travel Summary

### ${isEdu ? 'Educational Tourism' : 'Leisure Tourism'}

${isEdu
  ? '**Research → Workshops → Seminars → Symposiums → Cultural Education → Networking → Review**'
  : '**Flights → Accommodation → Sightseeing → Biking → Hiking → Swimming → Fitness → Games → Wellness → Cultural Experiences**'}

The guide is designed to move the traveller from **research → comparison → booking confirmation**, while clearly distinguishing estimated planning information from live provider-confirmed information.
`;

/**
 * ---------------------------------------------------------
 * Write file
 * ---------------------------------------------------------
 */

const outputFile = path.join(
  outputDir,
  `${slug}-${type}.mdx`
);

fs.writeFileSync(
  outputFile,
  template,
  'utf8'
);

console.log(
  `✅ Generated ${guideType} guide: ${outputFile}`
);
