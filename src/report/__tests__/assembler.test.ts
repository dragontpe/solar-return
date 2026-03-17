import { describe, it, expect } from 'vitest';
import { assembleReport } from '../assembler';
import { calculateSolarReturn } from '../../engine/index';

describe('Report assembler', () => {
  it('assembles a complete report for Meryl Streep 2027', async () => {
    const srData = await calculateSolarReturn(
      {
        name: 'Test',
        year: 1949, month: 6, day: 22, hour: 8.0833,
        lat: 40.7442, lon: -74.3596, timezone: -4,
      },
      { name: 'Pasadena CA', lat: 34.1478, lon: -118.1445, timezone: -7 },
      2027
    );

    const report = assembleReport(srData, 'Meryl');

    expect(report.name).toBe('Meryl');
    expect(report.srAscendant).toBe('Aries');
    expect(report.srSunHouse).toBe(3);
    expect(report.srMoonSign).toBe('Aquarius');
    expect(report.srMoonHouse).toBe(11);
    expect(report.sections.length).toBeGreaterThan(5);
    expect(report.sections[0].body.length).toBeGreaterThan(50);
    expect(report.calendarEvents.length).toBeGreaterThan(0);

    console.log('Report sections:');
    report.sections.forEach(s => console.log(' -', s.heading, ':', s.subheading));
    console.log('Calendar events (first 5):');
    report.calendarEvents.slice(0, 5).forEach(e => console.log(' ', e.date, e.text));
  }, 30000);
});
