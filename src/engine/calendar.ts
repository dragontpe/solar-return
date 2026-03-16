import { getSwe } from './swe';
import type { ChartData, YearEvent } from './types';
import { jdToDateString } from './solarreturn';

const FAST_PLANETS = [
  { id: 0, name: 'Transiting Sun'     },
  { id: 2, name: 'Transiting Mercury' },
  { id: 3, name: 'Transiting Venus'   },
  { id: 4, name: 'Transiting Mars'    },
];

const EVENT_ORB = 1.5;

export async function buildYearCalendar(
  srJD: number,
  srChart: ChartData,
): Promise<YearEvent[]> {
  const swe = await getSwe();
  const events: YearEvent[] = [];

  for (const tp of FAST_PLANETS) {
    for (let dayOffset = 0; dayOffset < 365; dayOffset++) {
      const jd = srJD + dayOffset;
      const pos = swe.swe_calc_ut(jd, tp.id, 0);
      const tLon = pos[0];

      for (const srP of srChart.planets) {
        const diff = Math.abs(tLon - srP.longitude);
        const angle = diff > 180 ? 360 - diff : diff;
        for (const [aspectAngle, aspectName] of [[0, 'conjunct'], [180, 'opposite']] as const) {
          const orb = Math.abs(angle - aspectAngle);
          if (orb <= EVENT_ORB) {
            events.push({
              julianDay: jd,
              date: jdToDateString(jd).split(' ')[0],
              description: `${tp.name} ${aspectName} SR ${srP.name}`,
              planet: tp.name,
              eventType: aspectName,
            });
          }
        }
      }
    }
  }

  events.sort((a, b) => a.julianDay - b.julianDay);
  return events;
}
