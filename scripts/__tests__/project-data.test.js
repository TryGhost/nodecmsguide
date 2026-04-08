import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { extractRelevantProjectData } from '../project-data.js';

describe('extractRelevantProjectData', () => {
  beforeEach(() => {
    // Fix "now" to a stable moment so subWeeks / differenceInDays are deterministic.
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-06-15T12:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns {} for an empty data object', () => {
    expect(extractRelevantProjectData({})).toEqual({});
  });

  it('returns an all-undefined shape for a project with no data points', () => {
    // date-fns `max([])` returns Invalid Date (an object, still truthy), so the
    // early-return guard in extractRelevantProjectData does not fire. The
    // function instead destructures from `undefined` and yields undefined
    // metrics with a NaN dataAgeInDays. Documented here rather than silently
    // "fixed" — tighten the implementation separately if desired.
    const result = extractRelevantProjectData({ ghost: [] });
    expect(result.ghost).toMatchObject({
      stars: undefined,
      forks: undefined,
      issues: undefined,
      starsPrevious: undefined,
      forksPrevious: undefined,
      issuesPrevious: undefined,
    });
    expect(Number.isNaN(result.ghost.dataAgeInDays)).toBe(true);
  });

  it('computes previous-vs-current from multiple data points', () => {
    const now = Date.now();
    const week = 7 * 24 * 60 * 60 * 1000;
    const data = {
      ghost: [
        { timestamp: now, stars: 100, forks: 20, issues: 5 },
        { timestamp: now - week, stars: 80, forks: 15, issues: 3 },
        { timestamp: now - 2 * week, stars: 60, forks: 10, issues: 2 },
      ],
    };
    const result = extractRelevantProjectData(data);
    expect(result.ghost.stars).toBe(100);
    expect(result.ghost.starsPrevious).toBe(80);
    expect(result.ghost.forks).toBe(20);
    expect(result.ghost.forksPrevious).toBe(15);
    expect(result.ghost.issues).toBe(5);
    expect(result.ghost.issuesPrevious).toBe(3);
    expect(result.ghost.dataAgeInDays).toBe(7);
  });

  it('uses newest as both current and previous when only one data point exists', () => {
    const now = Date.now();
    const data = {
      strapi: [{ timestamp: now, stars: 500, forks: 50, issues: 10 }],
    };
    const result = extractRelevantProjectData(data);
    expect(result.strapi.stars).toBe(500);
    expect(result.strapi.starsPrevious).toBe(500);
    expect(result.strapi.forksPrevious).toBe(50);
    expect(result.strapi.issuesPrevious).toBe(10);
    expect(result.strapi.dataAgeInDays).toBe(0);
  });

  it('handles data points missing a timestamp field', () => {
    // Same degraded shape as the empty-array case: `map(project, 'timestamp')`
    // yields `[undefined]`, which date-fns treats as Invalid Date and the
    // function falls through to return undefined metrics.
    const result = extractRelevantProjectData({
      broken: [{ stars: 1, forks: 1, issues: 1 }],
    });
    expect(result.broken.stars).toBeUndefined();
    expect(Number.isNaN(result.broken.dataAgeInDays)).toBe(true);
  });
});
