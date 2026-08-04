import { NextRequest } from 'next/server';

export const runtime = 'edge';

const PALETTES: Record<string, [string, string]> = {
  COO: ['#0EA5E9', '#0B4F6C'],
  ABJ: ['#F59E0B', '#B45309'],
  DKR: ['#06B6D4', '#0E7490'],
  DLA: ['#10B981', '#065F46'],
  CMN: ['#EF4444', '#7F1D1D'],
  IST: ['#8B5CF6', '#5B21B6'],
  DXB: ['#F59E0B', '#92400E'],
  BKK: ['#EC4899', '#9D174D'],
  PAR: ['#6366F1', '#312E81'],
};

function couleurs(code: string): [string, string] {
  return PALETTES[code?.toUpperCase()] ?? ['#FF6B35', '#7C2D12'];
}

export async function GET(req: NextRequest) {
  const ville = req.nextUrl.searchParams.get('to') ?? 'Destination';
  const code = (req.nextUrl.searchParams.get('code') ?? '').toUpperCase();
  const [c1, c2] = couleurs(code);

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600">
    <defs>
      <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="${c1}"/>
        <stop offset="1" stop-color="${c2}"/>
      </linearGradient>
    </defs>
    <rect width="800" height="600" fill="url(#g)"/>
    <g fill="#ffffff" opacity="0.15" transform="translate(560 120) rotate(35) scale(3.2)">
      <path d="M22 2 L14 9 L4 7 L2 9 L10 13 L6 19 L3 18 L2 20 L6 22 L8 26 L10 25 L9 22 L15 18 L19 26 L21 24 L20 14 L27 6 Z"/>
    </g>
    <path d="M80 480 Q400 380 720 470" stroke="#ffffff" stroke-width="3"
          stroke-dasharray="2 14" stroke-linecap="round" fill="none" opacity="0.5"/>
    <circle cx="80" cy="480" r="8" fill="#ffffff" opacity="0.8"/>
    <circle cx="720" cy="470" r="10" fill="#ffffff"/>
    ${code ? `<text x="60" y="300" font-family="Arial, sans-serif" font-size="150"
      font-weight="900" fill="#ffffff" opacity="0.25">${code}</text>` : ''}
    <text x="60" y="400" font-family="Arial, sans-serif" font-size="64" font-weight="800"
      fill="#ffffff">${ville.replace(/[<>&]/g, '')}</text>
    <text x="62" y="440" font-family="Arial, sans-serif" font-size="24" font-weight="600"
      fill="#ffffff" opacity="0.8">✈ Bon plan vol</text>
  </svg>`;

  return new Response(svg, {
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'public, max-age=604800, immutable',
    },
  });
}
