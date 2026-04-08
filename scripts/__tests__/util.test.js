import { describe, it, expect } from 'vitest';
import { toSlug, mapProjectEntry, formatNumber } from '../util.js';

describe('toSlug', () => {
  it('lowercases and slugifies a simple string', () => {
    expect(toSlug('Ghost')).toBe('ghost');
  });

  it('handles multi-word titles', () => {
    expect(toSlug('Node CMS Guide')).toBe('node-cms-guide');
  });

  it('handles already lowercase input', () => {
    expect(toSlug('strapi')).toBe('strapi');
  });
});

describe('mapProjectEntry', () => {
  const baseEntry = {
    data: {
      title: 'Ghost',
      repo: 'TryGhost/Ghost',
      homepage: 'https://ghost.org',
      opensource: 'Yes',
      supportedgenerators: ['All'],
      typeofcms: 'API Driven',
      description: 'A platform for publishers.',
      images: [{ path: '/images/ghost.png' }],
      startertemplaterepo: 'TryGhost/starter',
    },
  };

  it('maps every field correctly', () => {
    const result = mapProjectEntry(baseEntry);
    expect(result).toEqual({
      title: 'Ghost',
      slug: 'ghost',
      repo: 'TryGhost/Ghost',
      homepage: 'https://ghost.org',
      openSource: true,
      generators: ['All'],
      type: 'API Driven',
      description: 'A platform for publishers.',
      images: [{ path: '/images/ghost.png' }],
      starterTemplateRepo: 'TryGhost/starter',
    });
  });

  it('converts opensource "Yes" to openSource: true', () => {
    expect(mapProjectEntry(baseEntry).openSource).toBe(true);
  });

  it('converts opensource "No" to openSource: false', () => {
    const entry = { data: { ...baseEntry.data, opensource: 'No' } };
    expect(mapProjectEntry(entry).openSource).toBe(false);
  });

  it('is case-insensitive for opensource "YES"', () => {
    const entry = { data: { ...baseEntry.data, opensource: 'YES' } };
    expect(mapProjectEntry(entry).openSource).toBe(true);
  });

  it('is case-insensitive for opensource "no"', () => {
    const entry = { data: { ...baseEntry.data, opensource: 'no' } };
    expect(mapProjectEntry(entry).openSource).toBe(false);
  });
});

describe('formatNumber', () => {
  it('formats a number with en-US locale', () => {
    expect(formatNumber(1234567)).toBe('1,234,567');
  });

  it('formats zero', () => {
    expect(formatNumber(0)).toBe('0');
  });

  it('returns N/A for undefined', () => {
    expect(formatNumber(undefined)).toBe('N/A');
  });

  it('returns N/A for null', () => {
    expect(formatNumber(null)).toBe('N/A');
  });

  it('returns N/A for a string', () => {
    expect(formatNumber('1000')).toBe('N/A');
  });

  it('formats NaN (NaN is typeof "number")', () => {
    // NaN has typeof 'number' so it passes the guard; toLocaleString returns 'NaN'.
    expect(formatNumber(NaN)).toBe('NaN');
  });
});
