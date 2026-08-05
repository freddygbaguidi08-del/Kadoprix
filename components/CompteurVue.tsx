'use client';
import { useEffect, useRef } from 'react';

export default function CompteurVue({ dealId }: { dealId: number }) {
  const fait = useRef(false);

  useEffect(() => {
    if (fait.current) return;
    fait.current = true;

    const cle = `vu:${dealId}`;
    try {
      if (sessionStorage.getItem(cle)) return;
      sessionStorage.setItem(cle, '1');
    } catch {}

    fetch('/api/vue', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ dealId }),
      keepalive: true,
    }).catch(() => {});
  }, [dealId]);

  return null;
}
