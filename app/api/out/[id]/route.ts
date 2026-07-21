// Route de redirection affiliée : /api/out/123
// 1) log le clic avec un SubID (rapprochement cashback via CSV des régies)
// 2) incrémente le compteur  3) redirige vers l'URL affiliée
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const db = supabaseAdmin();
  const dealId = Number(params.id);

  const { data: deal } = await db.from('deals')
    .select('url_affiliee, url_source').eq('id', dealId).single();
  if (!deal) return NextResponse.redirect(new URL('/', req.url));

  const subid = `pz_${dealId}_${Date.now().toString(36)}`;
  await db.from('clicks').insert({ deal_id: dealId, subid });
  await db.rpc('increment_clicks', { p_deal_id: dealId });

  // Ajoute le SubID au lien affilié (paramètre selon la régie : clickref=Awin, ascsubtag=Amazon)
  const url = new URL(deal.url_affiliee ?? deal.url_source);
  if (url.hostname.includes('awin')) url.searchParams.set('clickref', subid);
  else if (url.hostname.includes('amazon')) url.searchParams.set('ascsubtag', subid);
  else url.searchParams.set('utm_source', 'promoz');

  return NextResponse.redirect(url.toString(), { status: 302 });
}
