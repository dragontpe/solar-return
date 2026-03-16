export interface BirthData {
  name: string;
  year: number;
  month: number;       // 1-12
  day: number;
  hour: number;        // decimal UT, e.g. 14.5 = 14:30
  lat: number;         // birth latitude
  lon: number;         // birth longitude
  timezone: number;    // UTC offset in hours, e.g. +8 for Taiwan
}

export interface LocationData {
  name: string;
  lat: number;
  lon: number;
  timezone: number;
}

export interface PlanetPosition {
  id: number;
  name: string;
  longitude: number;   // ecliptic longitude 0-360
  latitude: number;
  speed: number;       // degrees/day, negative = retrograde
  sign: number;        // 0-11 (Aries=0)
  signName: string;
  degree: number;      // 0-29 within sign
  minute: number;
  retrograde: boolean;
  house: number;       // 1-12
}

export interface HouseData {
  cusps: number[];     // [0] unused, [1]-[12] house cusp longitudes
  ascendant: number;   // longitude
  mc: number;          // longitude
  armc: number;
  vertex: number;
  ascSign: number;     // 0-11
  ascSignName: string;
  mcSign: number;
  mcSignName: string;
}

export interface Aspect {
  planet1: string;
  planet2: string;
  type: AspectType;
  orb: number;         // degrees from exact
  applying: boolean;
}

export type AspectType = 'conjunction' | 'sextile' | 'square' | 'trine' | 'opposition';

export interface ChartData {
  julianDay: number;
  planets: PlanetPosition[];
  houses: HouseData;
  aspects: Aspect[];
}

export interface SolarReturnData {
  // Input
  birthData: BirthData;
  returnLocation: LocationData;
  returnYear: number;

  // Calculated
  returnJD: number;           // Julian Day of exact solar return moment
  returnDateUTC: string;      // ISO string
  returnDateLocal: string;    // formatted in return location's timezone

  // Charts
  natalChart: ChartData;
  srChart: ChartData;

  // Cross-chart contacts
  srConjunctNatal: SRNatalContact[];

  // Calendar events
  yearEvents: YearEvent[];
}

export interface SRNatalContact {
  srPlanet: string;
  natalPoint: string;   // planet name or 'Asc' / 'MC'
  type: AspectType;
  orb: number;
}

export interface YearEvent {
  julianDay: number;
  date: string;         // formatted date string
  description: string;  // e.g. "Sun conjunct SR Mercury"
  planet: string;
  eventType: string;
}
