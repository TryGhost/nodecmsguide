import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

/**
 * Projects collection schema
 * Matches existing frontmatter in src/content/projects/*.md
 */
const projects = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/projects' }),
  schema: z.object({
    title: z.string(),
    repo: z.string().optional(),
    homepage: z
      .string()
      .url({ message: 'homepage must be a valid URL (e.g., https://example.com)' })
      .optional(),
    twitter: z.string().optional(),
    opensource: z.enum(['Yes', 'No']),
    typeofcms: z.string(),
    supportedgenerators: z.array(z.string()),
    description: z.string(),
    images: z
      .array(
        z.object({
          path: z.string(),
        })
      )
      .optional(),
    startertemplaterepo: z.string().optional(),
  }),
});

/**
 * Pages collection schema
 * Matches existing frontmatter in src/content/pages/*.md
 */
const pages = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/pages' }),
  schema: z.object({
    title: z.string(),
  }),
});

export const collections = {
  projects,
  pages,
};
