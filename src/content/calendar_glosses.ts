// src/content/calendar_glosses.ts
// Solar Return: Calendar event annotation labels
// Key format: lowercase_underscored event description
// Usage: Short labels (5-10 words) appearing as calendar annotations
// in the month-by-month section of the SR report.
//
// Coverage:
//   Lunar phases (generic): 4 entries
//   Eclipses (generic): 2 entries
//   Planet stations retrograde: 10 entries
//   Planet stations direct: 10 entries
//   Planet ingresses (generic): 10 entries
//   Total: 36 entries
//
// Sources: Mary Fortier Shea "Planets in Solar Returns" (3rd ed.);
// standard astrological tradition

export const CALENDAR_GLOSSES: Record<string, string> = {

  // LUNAR PHASES — generic labels
  new_moon: `New Moon — seed intentions, begin fresh`,
  first_quarter_moon: `First Quarter — act on what you started`,
  full_moon: `Full Moon — culmination, clarity, release`,
  last_quarter_moon: `Last Quarter — review, integrate, let go`,

  // ECLIPSES — generic labels
  solar_eclipse: `Solar Eclipse — major new beginning, course shift`,
  lunar_eclipse: `Lunar Eclipse — significant ending or revelation`,

  // PLANET STATIONS — RETROGRADE
  mercury_retrograde: `Mercury Rx — review communications, revisit plans`,
  venus_retrograde: `Venus Rx — reassess relationships and values`,
  mars_retrograde: `Mars Rx — redirect energy, reconsider ambitions`,
  jupiter_retrograde: `Jupiter Rx — inner growth, consolidate gains`,
  saturn_retrograde: `Saturn Rx — revisit responsibilities and structures`,
  uranus_retrograde: `Uranus Rx — internalise need for change`,
  neptune_retrograde: `Neptune Rx — clearer perception, less illusion`,
  pluto_retrograde: `Pluto Rx — deep inner transformation underway`,
  chiron_retrograde: `Chiron Rx — revisit old wounds for healing`,
  north_node_retrograde: `Nodal Rx — karmic review and course correction`,

  // PLANET STATIONS — DIRECT
  mercury_direct: `Mercury Direct — communications and plans resume`,
  venus_direct: `Venus Direct — relationships and values clarify`,
  mars_direct: `Mars Direct — forward drive and momentum restored`,
  jupiter_direct: `Jupiter Direct — expansion and opportunity open again`,
  saturn_direct: `Saturn Direct — responsibilities and goals move forward`,
  uranus_direct: `Uranus Direct — disruptive change resumes externally`,
  neptune_direct: `Neptune Direct — inspiration flows outward again`,
  pluto_direct: `Pluto Direct — transformation presses forward`,
  chiron_direct: `Chiron Direct — healing work moves outward`,
  north_node_direct: `Nodal Direct — karmic direction reasserts itself`,

  // PLANET INGRESSES — generic per planet
  mercury_ingress: `Mercury enters new sign — mental focus shifts`,
  venus_ingress: `Venus enters new sign — relational tone shifts`,
  mars_ingress: `Mars enters new sign — drive and energy shift`,
  jupiter_ingress: `Jupiter enters new sign — expansion changes domain`,
  saturn_ingress: `Saturn enters new sign — discipline shifts domain`,
  uranus_ingress: `Uranus enters new sign — disruption shifts domain`,
  neptune_ingress: `Neptune enters new sign — idealism shifts domain`,
  pluto_ingress: `Pluto enters new sign — transformation shifts domain`,
  sun_ingress: `Sun enters new sign — monthly focus shifts`,
  moon_ingress: `Moon enters new sign — emotional tone shifts`,
};
