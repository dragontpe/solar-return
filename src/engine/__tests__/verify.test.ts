import { describe, it, expect } from 'vitest';
import { calculateSolarReturn } from '../index';

describe('Solar Return Engine', () => {
  it('calculates Meryl Streep 2027 solar return correctly', async () => {
    const result = await calculateSolarReturn(
      {
        name: 'Test',
        year: 1949, month: 6, day: 22, hour: 8.0833,
        lat: 40.7442, lon: -74.3596, timezone: -4,
      },
      { name: 'Pasadena CA', lat: 34.1478, lon: -118.1445, timezone: -7 },
      2027
    );

    // SR moment within expected range
    expect(result.returnDateUTC).toMatch(/^2027-06-2[12]/);

    // SR Ascendant in Aries
    expect(result.srChart.houses.ascSignName).toBe('Aries');

    // SR Sun in 3rd house
    const srSun = result.srChart.planets.find(p => p.name === 'Sun');
    expect(srSun?.house).toBe(3);
    expect(srSun?.signName).toBe('Cancer');

    // SR Moon in Aquarius
    const srMoon = result.srChart.planets.find(p => p.name === 'Moon');
    expect(srMoon?.signName).toBe('Aquarius');
    expect(srMoon?.house).toBe(11);

    // SR Saturn in 1st house
    const srSaturn = result.srChart.planets.find(p => p.name === 'Saturn');
    expect(srSaturn?.house).toBe(1);

    // Should have SR/natal contacts
    expect(result.srConjunctNatal.length).toBeGreaterThan(0);

    // Should have year events
    expect(result.yearEvents.length).toBeGreaterThan(50);

    // Log full output for manual verification
    console.log('Return UTC:', result.returnDateUTC);
    console.log('SR Ascendant:', result.srChart.houses.ascSignName);
    console.log('Planets:');
    result.srChart.planets.forEach(p =>
      console.log(`  ${p.name}: ${p.signName} ${p.degree}°${p.minute}' House ${p.house}${p.retrograde ? ' R' : ''}`)
    );
    console.log('SR/Natal contacts (top 5):');
    result.srConjunctNatal.slice(0, 5).forEach(c =>
      console.log(`  SR ${c.srPlanet} ${c.type} Natal ${c.natalPoint} (orb ${c.orb}°)`)
    );
    console.log('Year events (first 10):');
    result.yearEvents.slice(0, 10).forEach(e =>
      console.log(`  ${e.date}: ${e.description}`)
    );
  }, 30000);
});
