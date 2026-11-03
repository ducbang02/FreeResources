import { defineMiddleware } from 'astro:middleware';

// P01 serves public catalog data only; every deployment remains non-indexable staging.
export const onRequest = defineMiddleware(async (_context, next) => {
  const response = await next();
  response.headers.set('X-Robots-Tag', 'noindex, nofollow, noarchive');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  response.headers.set('Content-Security-Policy', "frame-ancestors 'none'; base-uri 'self'; object-src 'none'");
  response.headers.set('Cache-Control', 'no-store');
  return response;
});
