import { describe, it, expect } from 'vitest';
import {
  SUN_IN_HOUSES, ASCENDANT_SIGNS, MC_SIGNS,
  MOON_IN_HOUSES, MOON_IN_SIGNS, MERCURY_IN_HOUSES
} from '../index';

describe('Content files', () => {
  it('SUN_IN_HOUSES has all 12 entries', () => {
    for (let h = 1; h <= 12; h++) {
      expect(SUN_IN_HOUSES[h]).toBeTruthy();
      expect(SUN_IN_HOUSES[h].length).toBeGreaterThan(100);
    }
  });

  it('ASCENDANT_SIGNS has all 12 signs', () => {
    const signs = ['Aries','Taurus','Gemini','Cancer','Leo','Virgo',
                   'Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces'];
    for (const sign of signs) {
      expect(ASCENDANT_SIGNS[sign]).toBeTruthy();
    }
  });

  it('MC_SIGNS has all 12 signs', () => {
    const signs = ['Aries','Taurus','Gemini','Cancer','Leo','Virgo',
                   'Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces'];
    for (const sign of signs) {
      expect(MC_SIGNS[sign]).toBeTruthy();
    }
  });

  it('MOON_IN_HOUSES has all 12 entries', () => {
    for (let h = 1; h <= 12; h++) {
      expect(MOON_IN_HOUSES[h]).toBeTruthy();
    }
  });

  it('MOON_IN_SIGNS has all 12 signs', () => {
    const signs = ['Aries','Taurus','Gemini','Cancer','Leo','Virgo',
                   'Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces'];
    for (const sign of signs) {
      expect(MOON_IN_SIGNS[sign]).toBeTruthy();
    }
  });

  it('MERCURY_IN_HOUSES has all 12 entries', () => {
    for (let h = 1; h <= 12; h++) {
      expect(MERCURY_IN_HOUSES[h]).toBeTruthy();
    }
  });
});
