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
    const newestDate = max(timestamps);
    if (!newestDate) {
      return {};
    }
    const newestTimestamp = newestDate.getTime();
    const targetOldestDate = subWeeks(new Date(), 1);
    const closestDate = closestTo(targetOldestDate, timestamps);
    const oldestTimestamp = (closestDate ?? newestDate).getTime();
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
