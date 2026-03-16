import { getSwe } from './swe';
import { localToJD } from './chart';

// Find the Julian Day of the solar return for a given year
export async function findSolarReturn(
  natalSunLon: number,
  birthYear: number, birthMonth: number, birthDay: number,
  returnYear: number,
  birthTimezone: number,
): Promise<number> {
  const swe = await getSwe();

  // Start ~3 days before estimated birthday in the return year
  let jd = localToJD(returnYear, birthMonth, birthDay - 3, 12, 0);

  let lo = jd;
  let hi = jd + 6;

  for (let i = 0; i < 50; i++) {
    const mid = (lo + hi) / 2;
    const sunResult = swe.swe_calc_ut(mid, 0, 256);
    const sunLon = sunResult[0];

    let diff = sunLon - natalSunLon;
    if (diff > 180)  diff -= 360;
    if (diff < -180) diff += 360;

    if (Math.abs(diff) < 0.000001) break;

    if (diff < 0) {
      lo = mid;
    } else {
      hi = mid;
    }
  }

  return (lo + hi) / 2;
}

// Format Julian Day to a readable UTC date string
export function jdToDateString(jd: number): string {
  const z = Math.floor(jd + 0.5);
  const f = jd + 0.5 - z;
  let a = z;
  if (z >= 2299161) {
    const alpha = Math.floor((z - 1867216.25) / 36524.25);
    a = z + 1 + alpha - Math.floor(alpha / 4);
  }
  const b = a + 1524;
  const c = Math.floor((b - 122.1) / 365.25);
  const d = Math.floor(365.25 * c);
  const e = Math.floor((b - d) / 30.6001);
  const day = b - d - Math.floor(30.6001 * e);
  const month = e < 14 ? e - 1 : e - 13;
  const year = month > 2 ? c - 4716 : c - 4715;
  const hours = f * 24;
  const h = Math.floor(hours);
  const m = Math.floor((hours - h) * 60);
  const s = Math.floor(((hours - h) * 60 - m) * 60);
  return `${year}-${String(month).padStart(2,'0')}-${String(day).padStart(2,'0')} ${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')} UTC`;
}
