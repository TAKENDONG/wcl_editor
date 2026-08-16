import { useCallback, useEffect, useState } from 'react';
import { fetchOverview } from '../services/publisherService.ts';
import type { PublisherOverview } from '../lib/types.ts';

export function usePublishers(enabled: boolean) {
  const [publishers, setPublishers] = useState<PublisherOverview[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const reload = useCallback(async () => {
    if (!enabled) return;
    setLoading(true);
    setError(null);
    try {
      setPublishers(await fetchOverview());
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Erreur inconnue');
    } finally {
      setLoading(false);
    }
  }, [enabled]);

  useEffect(() => {
    void reload();
  }, [reload]);

  return { publishers, error, loading, reload };
}
