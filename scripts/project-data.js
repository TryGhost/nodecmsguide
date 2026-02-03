import { map, mapValues, find } from 'lodash-es';
import { max, subWeeks, closestTo, differenceInDays } from 'date-fns';

/**
 * Extract relevant project data from raw archive data.
 * Compares newest data with data from ~1 week ago to calculate trends.
 * @param {Record<string, any[]>} data - Raw project data keyed by slug
 * @returns {Record<string, object>} Processed project data with trends
 */
export function extractRelevantProjectData(data) {
  return mapValues(data, (project) => {
    const timestamps = map(project, 'timestamp');
    if (timestamps.length === 0) return {};

    const newestTimestamp = max(timestamps)?.getTime() || Date.now();
    const targetOldestTimestamp = subWeeks(Date.now(), 1).getTime();
    const oldestTimestamp = closestTo(targetOldestTimestamp, timestamps)?.getTime() || newestTimestamp;
    const dataAgeInDays = differenceInDays(Date.now(), oldestTimestamp);

    const { forks, stars, issues } = find(project, { timestamp: newestTimestamp }) || {};
    const {
      forks: forksPrevious,
      stars: starsPrevious,
      issues: issuesPrevious,
    } = find(project, { timestamp: oldestTimestamp }) || {};

    return {
      forks,
      stars,
      issues,
      forksPrevious,
      starsPrevious,
      issuesPrevious,
      dataAgeInDays,
    };
  });
}
