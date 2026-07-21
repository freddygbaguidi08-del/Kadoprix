import { NextResponse, type NextRequest } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server';

export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get('code');
  const suite = searchParams.get('next') ?? '/ma-liste';

  if (code) {
    const { error } = await supabaseServer().auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(`${origin}${suite}`);
  }
  return NextResponse.redirect(`${origin}/connexion?erreur=lien`);
}
