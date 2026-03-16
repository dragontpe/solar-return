import { getSwe } from './swe';
import { PLANETS, ASPECT_DEFS, signFromLongitude, houseFromLongitude } from './planets';
import type { ChartData, HouseData, PlanetPosition, Aspect } from './types';

// Convert local time to UT Julian Day
export function localToJD(year: number, month: number, day: number, localHour: number, timezone: number): number {
  const utHour = localHour - timezone;
  let d = day, m = month, y = year, h = utHour;
  if (h < 0) { d--; h += 24; }
  if (h >= 24) { d++; h -= 24; }
  // Julian Day formula (Meeus, Ch.7)
  if (m <= 2) { y--; m += 12; }
  const A = Math.floor(y / 100);
  const B = 2 - A + Math.floor(A / 4);
  return Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m + 1)) + d + h / 24.0 + B - 1524.5;
}

export async function calcChart(jd: number, lat: number, lon: number): Promise<ChartData> {
  const swe = await getSwe();

  // Planets
  const planets: PlanetPosition[] = [];
  for (const p of PLANETS) {
    const result = swe.swe_calc_ut(jd, p.id, 256); // 256 = SEFLG_SPEED
    const lon_ec = result[0];
    const lat_ec = result[1];
    const speed = result[3];
    const { sign, signName, degree, minute } = signFromLongitude(lon_ec);
    planets.push({
      id: p.id,
      name: p.name,
      longitude: lon_ec,
      latitude: lat_ec,
      speed,
      sign,
      signName,
      degree,
      minute,
      retrograde: speed < 0,
      house: 0,
    });
  }

  // Houses (Placidus)
  const h = swe.swe_houses(jd, lat, lon, 'P');
  const cusps = h.cusps;
  const asc = h.ascmc[0];
  const mc  = h.ascmc[1];
  const { sign: ascSign, signName: ascSignName } = signFromLongitude(asc);
  const { sign: mcSign,  signName: mcSignName  } = signFromLongitude(mc);

  const houses: HouseData = {
    cusps,
    ascendant: asc,
    mc,
    armc:   h.ascmc[2],
    vertex: h.ascmc[3],
    ascSign,
    ascSignName,
    mcSign,
    mcSignName,
  };

  // Assign house to each planet
  for (const p of planets) {
    p.house = houseFromLongitude(p.longitude, cusps);
  }

  // Aspects
  const aspects: Aspect[] = [];
  for (let i = 0; i < planets.length; i++) {
    for (let j = i + 1; j < planets.length; j++) {
      const diff = Math.abs(planets[i].longitude - planets[j].longitude);
      const angle = diff > 180 ? 360 - diff : diff;
      for (const def of ASPECT_DEFS) {
        const orb = Math.abs(angle - def.angle);
        if (orb <= def.orb) {
          const applying = planets[i].speed > 0 && (planets[i].longitude < planets[j].longitude);
          aspects.push({
            planet1: planets[i].name,
            planet2: planets[j].name,
            type: def.type,
            orb: Math.round(orb * 100) / 100,
            applying,
          });
          break;
        }
      }
    }
  }

  return { julianDay: jd, planets, houses, aspects };
}
