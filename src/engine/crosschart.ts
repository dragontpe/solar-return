import type { ChartData, SRNatalContact } from './types';
import { ASPECT_DEFS } from './planets';

const CONJUNCTION_ORB = 4;

export function findSRNatalContacts(srChart: ChartData, natalChart: ChartData): SRNatalContact[] {
  const contacts: SRNatalContact[] = [];

  // SR planet to natal planet
  for (const srP of srChart.planets) {
    for (const natP of natalChart.planets) {
      const diff = Math.abs(srP.longitude - natP.longitude);
      const angle = diff > 180 ? 360 - diff : diff;
      for (const def of ASPECT_DEFS) {
        const orb = Math.abs(angle - def.angle);
        if (orb <= (def.type === 'conjunction' ? CONJUNCTION_ORB : def.orb)) {
          contacts.push({
            srPlanet: srP.name,
            natalPoint: natP.name,
            type: def.type,
            orb: Math.round(orb * 100) / 100,
          });
          break;
        }
      }
    }
  }

  // SR planet to natal Asc and MC
  const angles = [
    { name: 'Asc', lon: natalChart.houses.ascendant },
    { name: 'MC',  lon: natalChart.houses.mc },
  ];
  for (const srP of srChart.planets) {
    for (const ang of angles) {
      const diff = Math.abs(srP.longitude - ang.lon);
      const angle = diff > 180 ? 360 - diff : diff;
      if (angle <= CONJUNCTION_ORB || Math.abs(angle - 180) <= CONJUNCTION_ORB) {
        contacts.push({
          srPlanet: srP.name,
          natalPoint: ang.name,
          type: angle <= CONJUNCTION_ORB ? 'conjunction' : 'opposition',
          orb: Math.round(Math.min(angle, Math.abs(angle - 180)) * 100) / 100,
        });
      }
    }
  }

  return contacts.sort((a, b) => a.orb - b.orb);
}
