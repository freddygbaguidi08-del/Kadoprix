export default function BadgeVues({
  vues, seuil = 5, className = '',
}: { vues: number | null | undefined; seuil?: number; className?: string }) {
  const n = vues ?? 0;
  if (n < seuil) return null;

  const fmt = n >= 1000 ? `${(n / 1000).toFixed(1).replace('.0', '')} k` : String(n);

  return (
    <span className={`inline-flex items-center gap-1 text-[11px] text-slate-500 ${className}`}>
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor"
           strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
        <circle cx="12" cy="12" r="3" />
      </svg>
      {fmt}
    </span>
  );
}
