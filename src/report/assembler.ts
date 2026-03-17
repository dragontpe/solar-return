import type { SolarReturnData } from '../engine/types';
import type { Branding } from '../types/branding';
import {
  SUN_IN_HOUSES, ASCENDANT_SIGNS, MC_SIGNS,
  MOON_IN_HOUSES, MOON_IN_SIGNS, MERCURY_IN_HOUSES,
  VENUS_IN_HOUSES, MARS_IN_HOUSES, JUPITER_IN_HOUSES,
  SATURN_IN_HOUSES, URANUS_IN_HOUSES, NEPTUNE_IN_HOUSES,
  PLUTO_IN_HOUSES, ASPECTS_SUN,
  ASPECTS_MOON, ASPECTS_MERCURY, ASPECTS_VENUS,
  ASPECTS_MARS, ASPECTS_OUTER, SR_NATAL_CONTACTS,
  CALENDAR_GLOSSES
} from '../content/index';
import { aspectKey, srNatalContactKey, calendarGlossKey } from './keys';

// ── Types ─────────────────────────────────────────────────────────────────────

export interface ReportSection {
  heading: string;
  subheading?: string;
  body: string;
}

export interface ReportData {
  // Cover info
  name: string;
  returnYear: number;
  returnDateLocal: string;
  returnLocation: string;

  // Chart summaries (for display in report header)
  srAscendant: string;
  srMC: string;
  srSunHouse: number;
  srMoonSign: string;
  srMoonHouse: number;

  // Noon chart flag
  noonChart: boolean;

  // Branding
  branding: Branding;

  // Report sections in order
  sections: ReportSection[];

  // Year calendar events
  calendarEvents: { date: string; text: string }[];
}

// ── Planet name to house content map ──────────────────────────────────────────

const PLANET_HOUSE_MAPS: Record<string, Record<number, string>> = {
  Sun:     SUN_IN_HOUSES,
  Moon:    MOON_IN_HOUSES,
  Mercury: MERCURY_IN_HOUSES,
  Venus:   VENUS_IN_HOUSES,
  Mars:    MARS_IN_HOUSES,
  Jupiter: JUPITER_IN_HOUSES,
  Saturn:  SATURN_IN_HOUSES,
  Uranus:  URANUS_IN_HOUSES,
  Neptune: NEPTUNE_IN_HOUSES,
  Pluto:   PLUTO_IN_HOUSES,
};

// ── Aspect map lookup ─────────────────────────────────────────────────────────

function lookupAspect(planet1: string, aspectType: string, planet2: string): string | null {
  const key = aspectKey(planet1, aspectType, planet2);
  for (const map of [ASPECTS_SUN, ASPECTS_MOON, ASPECTS_MERCURY, ASPECTS_VENUS, ASPECTS_MARS]) {
    if (map[key]) return map[key];
  }
  if (ASPECTS_OUTER[key]) return ASPECTS_OUTER[key];
  return null;
}

// ── Fallback text ─────────────────────────────────────────────────────────────

function fallback(placement: string): string {
  return `This placement (${placement}) adds a subtle but meaningful dimension to your year. Consider how the themes of this area of life are showing up in your experience and what they may be asking of you.`;
}

// ── Main assembler ────────────────────────────────────────────────────────────

export function assembleReport(
  data: SolarReturnData,
  personName: string,
  noonChart = false,
  branding: Branding = { companyName: '', tagline: '', contact: '' },
): ReportData {
  const { srChart, srConjunctNatal, yearEvents, returnLocation, returnYear, returnDateLocal } = data;
  const sections: ReportSection[] = [];

  const getP = (name: string) => srChart.planets.find(p => p.name === name)!;

  const NOON_CAVEAT = 'Note: This chart was calculated using a noon birth time because the exact birth time is unknown. House placements, the Ascendant, and the Midheaven should be considered approximate. The sign positions of the planets remain accurate.';

  // ── Noon chart notice ─────────────────────────────────────────────────────
  if (noonChart) {
    sections.push({
      heading: 'About This Chart',
      subheading: 'Noon Chart — Birth Time Unknown',
      body: NOON_CAVEAT,
    });
  }

  // ── Section 1: Ascendant ───────────────────────────────────────────────────
  const ascSign = srChart.houses.ascSignName;
  const ascBody = ASCENDANT_SIGNS[ascSign] ?? fallback(`Ascendant in ${ascSign}`);
  sections.push({
    heading: 'Your Year\'s Approach',
    subheading: `Solar Return Ascendant in ${ascSign}${noonChart ? ' (approximate)' : ''}`,
    body: noonChart ? `${ascBody}\n\n(Ascendant may differ — birth time unknown.)` : ascBody,
  });

  // ── Section 2: Sun in house ───────────────────────────────────────────────
  const sun = getP('Sun');
  const sunBody = SUN_IN_HOUSES[sun.house] ?? fallback(`Sun in house ${sun.house}`);
  sections.push({
    heading: 'The Central Focus of Your Year',
    subheading: `Solar Return Sun in the ${ordinal(sun.house)} House${noonChart ? ' (approximate)' : ''}`,
    body: noonChart ? `${sunBody}\n\n(House placement may differ — birth time unknown.)` : sunBody,
  });

  // ── Section 3: MC ─────────────────────────────────────────────────────────
  const mcSign = srChart.houses.mcSignName;
  const mcBody = MC_SIGNS[mcSign] ?? fallback(`MC in ${mcSign}`);
  sections.push({
    heading: 'Career and Public Life',
    subheading: `Solar Return Midheaven in ${mcSign}${noonChart ? ' (approximate)' : ''}`,
    body: noonChart ? `${mcBody}\n\n(Midheaven may differ — birth time unknown.)` : mcBody,
  });

  // ── Section 4: Moon in house + sign ───────────────────────────────────────
  const moon = getP('Moon');
  const moonHouseText = MOON_IN_HOUSES[moon.house] ?? fallback(`Moon in house ${moon.house}`);
  const moonSignText  = MOON_IN_SIGNS[moon.signName] ?? fallback(`Moon in ${moon.signName}`);
  sections.push({
    heading: 'Your Emotional Life This Year',
    subheading: `Solar Return Moon in ${moon.signName}, ${ordinal(moon.house)} House`,
    body: `${moonHouseText}\n\n${moonSignText}`,
  });

  // ── Section 5: Inner planets in houses ────────────────────────────────────
  const innerPlanets = ['Mercury','Venus','Mars'];
  for (const pName of innerPlanets) {
    const p = getP(pName);
    const map = PLANET_HOUSE_MAPS[pName];
    const text = map?.[p.house] ?? fallback(`${pName} in house ${p.house}`);
    sections.push({
      heading: planetHeading(pName),
      subheading: `${pName} in the ${ordinal(p.house)} House${p.retrograde ? ' (Retrograde)' : ''}`,
      body: text,
    });
  }

  // ── Section 6: Outer planets in houses ────────────────────────────────────
  const outerPlanets = ['Jupiter','Saturn','Uranus','Neptune','Pluto'];
  for (const pName of outerPlanets) {
    const p = getP(pName);
    const map = PLANET_HOUSE_MAPS[pName];
    const text = map?.[p.house] ?? fallback(`${pName} in house ${p.house}`);
    sections.push({
      heading: planetHeading(pName),
      subheading: `${pName} in the ${ordinal(p.house)} House${p.retrograde ? ' (Retrograde)' : ''}`,
      body: text,
    });
  }

  // ── Section 7: SR aspects ─────────────────────────────────────────────────
  const aspectTexts: string[] = [];
  for (const asp of srChart.aspects) {
    if (asp.orb > 6) continue;
    const text = lookupAspect(asp.planet1, asp.type, asp.planet2);
    if (text) {
      aspectTexts.push(`**${asp.planet1} ${asp.type} ${asp.planet2}** (orb ${asp.orb}°)\n${text}`);
    }
  }
  if (aspectTexts.length > 0) {
    sections.push({
      heading: 'Planetary Dynamics This Year',
      subheading: 'Key aspects in your Solar Return chart',
      body: aspectTexts.join('\n\n'),
    });
  }

  // ── Section 8: SR/natal contacts ─────────────────────────────────────────
  const contactTexts: string[] = [];
  for (const contact of srConjunctNatal.slice(0, 10)) {
    const key = srNatalContactKey(contact.srPlanet, contact.natalPoint);
    const text = SR_NATAL_CONTACTS[key];
    if (text) {
      contactTexts.push(`**SR ${contact.srPlanet} ${contact.type} Natal ${contact.natalPoint}** (orb ${contact.orb}°)\n${text}`);
    }
  }
  if (contactTexts.length > 0) {
    sections.push({
      heading: 'Connections to Your Natal Chart',
      subheading: 'Solar Return planets activating natal positions',
      body: contactTexts.join('\n\n'),
    });
  }

  // ── Calendar events ───────────────────────────────────────────────────────
  const calendarEvents = yearEvents.slice(0, 60).map(e => {
    const key = calendarGlossKey(e.description);
    const gloss = CALENDAR_GLOSSES[key] ?? e.description;
    return { date: e.date, text: gloss };
  });

  return {
    name: personName,
    returnYear,
    returnDateLocal,
    returnLocation: returnLocation.name,
    srAscendant: ascSign,
    srMC: mcSign,
    srSunHouse: sun.house,
    srMoonSign: moon.signName,
    srMoonHouse: moon.house,
    noonChart,
    branding,
    sections,
    calendarEvents,
  };
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function ordinal(n: number): string {
  const s = ['th','st','nd','rd'];
  const v = n % 100;
  return n + (s[(v-20)%10] ?? s[v] ?? s[0]);
}

function planetHeading(name: string): string {
  const map: Record<string, string> = {
    Mercury: 'Communication and Thinking',
    Venus:   'Love, Money, and Values',
    Mars:    'Drive, Energy, and Action',
    Jupiter: 'Growth and Opportunity',
    Saturn:  'Responsibility and Lessons',
    Uranus:  'Change and Disruption',
    Neptune: 'Spirituality and Dissolution',
    Pluto:   'Transformation and Power',
  };
  return map[name] ?? name;
}
