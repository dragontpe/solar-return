import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';

// Polyfill fetch for file:// URLs (sweph-wasm needs this in Node)
const originalFetch = globalThis.fetch;
globalThis.fetch = async function(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;
  if (url.startsWith('file://')) {
    const buffer = readFileSync(fileURLToPath(url));
    return new Response(buffer, { status: 200, headers: { 'Content-Type': 'application/wasm' } });
  }
  return originalFetch(input, init);
};

import { calculateSolarReturn } from './src/engine/index';
import { assembleReport } from './src/report/assembler';
import { buildPDF } from './src/pdf/generator';

// Beyonce: Sept 4, 1981, 10:00 AM CDT, Houston TX
// Houston: 29.7604 N, 95.3698 W, CDT = UTC-5
// Return location: same (Houston)
async function main() {
  const srData = await calculateSolarReturn(
    {
      name: 'Beyonce',
      year: 1981, month: 9, day: 4, hour: 10.0,
      lat: 29.7604, lon: -95.3698, timezone: -5,
    },
    { name: 'Houston TX', lat: 29.7604, lon: -95.3698, timezone: -5 },
    2026
  );

  const report = assembleReport(srData, 'Beyonce');

  console.log('SR Date:', srData.returnDateUTC);
  console.log('Ascendant:', report.srAscendant);
  console.log('Sun House:', report.srSunHouse);
  console.log('Moon:', report.srMoonSign, 'House', report.srMoonHouse);
  console.log('Sections:', report.sections.length);
  console.log('Calendar events:', report.calendarEvents.length);

  const pdfBytes = await buildPDF(report, srData.srChart);
  writeFileSync('/Users/francoisdekock/Desktop/SolarReturn_Beyonce_2026.pdf', pdfBytes);
  console.log('PDF saved to Desktop');
}

main().catch(console.error);
