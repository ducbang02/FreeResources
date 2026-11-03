import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';
import { getHome, getTaxonomy, searchResources } from '../../lib/catalog';

export const GET: APIRoute = async ({ url }) => {
  const q = (url.searchParams.get('q') ?? '').trim();
  if (q.length > 160) return Response.json({ error: 'Từ khóa tối đa 160 ký tự.' }, { status: 400 });
  try {
    const [taxonomy, resources] = await Promise.all([
      getTaxonomy(env.DB),
      q ? searchResources(env.DB, q, 4) : getHome(env.DB).then(home => {
        const unique = new Map([home.featured, ...home.curated].filter(r => r !== null).map(r => [r.id, r]));
        return [...unique.values()].slice(0, 2);
      }),
    ]);
    return Response.json({
      items: resources.map(({ slug, title, summary, icon }) => ({ slug, title, summary, icon })),
      categories: taxonomy.categories.slice(0, 3),
    });
  } catch {
    console.error(JSON.stringify({ event: 'catalog_search_failed' }));
    return Response.json({ error: 'Chưa thể tìm tài nguyên. Bạn thử lại nhé.' }, { status: 503 });
  }
};
