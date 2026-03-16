import { localToJD, calcChart } from './chart';
import { findSolarReturn, jdToDateString } from './solarreturn';
import { findSRNatalContacts } from './crosschart';
import { buildYearCalendar } from './calendar';
import type { BirthData, LocationData, SolarReturnData } from './types';

export async function calculateSolarReturn(
  birth: BirthData,
  returnLocation: LocationData,
  returnYear: number,
): Promise<SolarReturnData> {

  // 1. Natal chart
  const natalJD = localToJD(birth.year, birth.month, birth.day, birth.hour, birth.timezone);
  const natalChart = await calcChart(natalJD, birth.lat, birth.lon);
  const natalSunLon = natalChart.planets.find(p => p.name === 'Sun')!.longitude;

  // 2. Find exact solar return moment
  const returnJD = await findSolarReturn(
    natalSunLon,
    birth.year, birth.month, birth.day,
    returnYear,
    birth.timezone,
  );

  // 3. SR chart cast for return location
  const srChart = await calcChart(returnJD, returnLocation.lat, returnLocation.lon);

  // 4. Cross-chart contacts
  const srConjunctNatal = findSRNatalContacts(srChart, natalChart);

  // 5. Year calendar events
  const yearEvents = await buildYearCalendar(returnJD, srChart);

  return {
    birthData: birth,
    returnLocation,
    returnYear,
    returnJD,
    returnDateUTC: jdToDateString(returnJD),
    returnDateLocal: jdToDateString(returnJD + returnLocation.timezone / 24),
    natalChart,
    srChart,
    srConjunctNatal,
    yearEvents,
  };
}
