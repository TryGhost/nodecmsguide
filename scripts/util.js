import slug from 'slug';

export function toSlug(str) {
  return slug(str.toLowerCase());
}

/**
 * Map a content collection entry to project details object
 * @param {object} entry - Content collection entry with data property
 * @returns {object} Mapped project details
 */
export function mapProjectEntry(entry) {
  return {
    title: entry.data.title,
    slug: toSlug(entry.data.title),
    repo: entry.data.repo,
    homepage: entry.data.homepage,
    openSource: entry.data.opensource.toLowerCase() === 'yes',
    generators: entry.data.supportedgenerators,
    type: entry.data.typeofcms,
    description: entry.data.description,
    images: entry.data.images,
    starterTemplateRepo: entry.data.startertemplaterepo,
  };
}

/**
 * Format a number for display with locale-specific formatting
 * @param {number | undefined} num - The number to format
 * @returns {string} Formatted number string or 'N/A' if not a number
 */
export function formatNumber(num) {
  if (typeof num !== 'number') return 'N/A';
  return num.toLocaleString('en-US');
}
