// Planet in house key — e.g. "sun_house_3"
export function planetHouseKey(planetName: string, house: number): string {
  return `${planetName.toLowerCase()}_house_${house}`;
}

// Planet in sign key — e.g. "mercury_gemini"
export function planetSignKey(planetName: string, signName: string): string {
  return `${planetName.toLowerCase()}_${signName.toLowerCase()}`;
}

// Ascendant sign key — e.g. "Aries"
export function ascendantKey(signName: string): string {
  return signName;
}

// MC sign key — e.g. "Capricorn"
export function mcKey(signName: string): string {
  return signName;
}

// Aspect key — e.g. "sun_square_mars"
export function aspectKey(planet1: string, aspectType: string, planet2: string): string {
  const order = ['Sun','Moon','Mercury','Venus','Mars','Jupiter','Saturn','Uranus','Neptune','Pluto'];
  const p1idx = order.indexOf(planet1);
  const p2idx = order.indexOf(planet2);
  const [first, second] = p1idx <= p2idx ? [planet1, planet2] : [planet2, planet1];
  return `${first.toLowerCase()}_${aspectType}_${second.toLowerCase()}`;
}

// SR planet conjunct natal planet key — e.g. "sr_venus_conjunct_natal_mars"
export function srNatalContactKey(srPlanet: string, natalPoint: string): string {
  return `sr_${srPlanet.toLowerCase()}_conjunct_natal_${natalPoint.toLowerCase()}`;
}

// Calendar event gloss key — e.g. "transiting_sun_conjunct_sr_mercury"
export function calendarGlossKey(description: string): string {
  return description.toLowerCase().replace(/\s+/g, '_');
}
