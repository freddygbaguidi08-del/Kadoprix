// KADO PRIX — Proxy d'images.
// Les visuels proviennent de CDN marchands variés dont certains bloquent le
// hotlinking. Ici, l'image est récupérée par le serveur puis servie depuis le
// domaine du site : plus aucun blocage côté navigateur, et un cache CDN long.
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

export async function GET(req: NextRequest) {
  const src = req.nextUrl.searchParams.get('u');
  if (!src) return new NextResponse('missing url', { status: 400 });

  let cible: URL;
  try {
    cible = new URL(src);
  } catch {
    return new NextResponse('bad url', { status: 400 });
  }
  if (cible.protocol !== 'https:') return new NextResponse('https only', { status: 400 });

  try {
    const r = await fetch(cible.toString(), {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; KadoPrix/1.0)' },
      cache: 'force-cache',
    });
    if (!r.ok) return new NextResponse('upstream error', { status: 502 });

    const type = r.headers.get('content-type') ?? '';
    if (!type.startsWith('image/')) return new NextResponse('not an image', { status: 415 });

    return new NextResponse(r.body, {
      headers: {
        'Content-Type': type,
        'Cache-Control': 'public, max-age=86400, s-maxage=604800, immutable',
      },
    });
  } catch {
    return new NextResponse('fetch failed', { status: 502 });
  }
}
