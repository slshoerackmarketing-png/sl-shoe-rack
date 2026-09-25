import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  // TODO: confirm Cloudflare Pages project name
  site: 'https://sl-shoe-rack.pages.dev',
  output: 'static',
  build: { inlineStylesheets: 'always' },
  integrations: [sitemap({ filter: (page) => !page.includes('/thank-you') })],
});
