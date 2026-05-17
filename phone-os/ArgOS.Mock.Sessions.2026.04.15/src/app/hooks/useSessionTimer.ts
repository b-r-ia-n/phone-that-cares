import { useEffect, useRef } from 'react';
import { useSessionsStore } from '../store/sessionsStore';

/**
 * While mounted, increments the per-app time-spent-today by elapsed wall time.
 * Pauses when the tab is hidden.
 */
export function useSessionTimer(appId: string | undefined) {
  const tick = useSessionsStore((s) => s.tick);
  const lastRef = useRef<number | null>(null);

  useEffect(() => {
    if (!appId) return;
    lastRef.current = Date.now();

    const interval = window.setInterval(() => {
      if (document.hidden) {
        lastRef.current = Date.now();
        return;
      }
      const now = Date.now();
      const delta = now - (lastRef.current ?? now);
      lastRef.current = now;
      if (delta > 0 && delta < 10_000) {
        tick(appId, delta);
      }
    }, 250);

    const onVis = () => {
      lastRef.current = Date.now();
    };
    document.addEventListener('visibilitychange', onVis);

    return () => {
      window.clearInterval(interval);
      document.removeEventListener('visibilitychange', onVis);
    };
  }, [appId, tick]);
}
