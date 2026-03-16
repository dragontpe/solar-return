export const PLANETS = [
  { id: 0,  name: 'Sun'     },
  { id: 1,  name: 'Moon'    },
  { id: 2,  name: 'Mercury' },
  { id: 3,  name: 'Venus'   },
  { id: 4,  name: 'Mars'    },
  { id: 5,  name: 'Jupiter' },
  { id: 6,  name: 'Saturn'  },
  { id: 7,  name: 'Uranus'  },
  { id: 8,  name: 'Neptune' },
  { id: 9,  name: 'Pluto'   },
] as const;

export const SIGNS = [
  'Aries','Taurus','Gemini','Cancer','Leo','Virgo',
  'Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces'
] as const;

export const ASPECT_DEFS = [
  { type: 'conjunction' as const,  angle: 0,   orb: 8  },
  { type: 'sextile'     as const,  angle: 60,  orb: 6  },
  { type: 'square'      as const,  angle: 90,  orb: 8  },
  { type: 'trine'       as const,  angle: 120, orb: 8  },
  { type: 'opposition'  as const,  angle: 180, orb: 8  },
] as const;

export function signFromLongitude(lon: number): { sign: number; signName: string; degree: number; minute: number } {
  const sign = Math.floor(lon / 30);
  const withinSign = lon % 30;
  const degree = Math.floor(withinSign);
  const minute = Math.floor((withinSign - degree) * 60);
  return { sign, signName: SIGNS[sign], degree, minute };
}

export function houseFromLongitude(lon: number, cusps: number[]): number {
  for (let h = 1; h <= 12; h++) {
    const next = h === 12 ? cusps[1] + 360 : cusps[h + 1];
    const cusp = cusps[h];
    const normalised = ((lon - cusp + 360) % 360);
    const span = ((next - cusp + 360) % 360);
    if (normalised < span) return h;
  }
  return 1;
}
