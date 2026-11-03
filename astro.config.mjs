import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';

export default defineConfig({
  output: 'server',
  adapter: cloudflare({
    imageService: 'passthrough',
    remoteBindings: false,
    ...(process.env.P01_STAGING_BUILD === '1' ? { configPath: 'deploy/wrangler.staging.json' } : {}),
  }),
  session: false,
  devToolbar: { enabled: false },
  vite: { server: { host: '127.0.0.1' } },
});
