import { defineConfig } from 'astro/config';
import react from '@astrojs/react';

export default defineConfig({
  site: 'https://nodecms.guide',
  integrations: [react()],
  output: 'static',
});
