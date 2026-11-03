import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';

const xml = (value: string) => value.replace(/[<>&"']/g, c => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&apos;' })[c]!);
export const GET: APIRoute = async ({ url }) => {
  try {
    const { results } = await env.DB.prepare("SELECT slug FROM resources WHERE status='published' ORDER BY slug LIMIT 5000").all<{slug: string}>();
    const entries = ['/', '/explore', ...results.map(r => '/resources/' + encodeURIComponent(r.slug))];
    return new Response(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${entries.map(path => `<url><loc>${xml(new URL(path, url.origin).href)}</loc></url>`).join('')}</urlset>`, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
  } catch {
    return new Response('Sitemap temporarily unavailable', { status: 503 });
  }
};
