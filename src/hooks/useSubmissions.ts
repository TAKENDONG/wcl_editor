import { useCallback, useEffect, useState } from 'react';
import { fetchSubmissions } from '../services/submissionService.ts';
import type { Submission } from '../lib/types.ts';

export function useSubmissions(publisherId: string | null) {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const reload = useCallback(async () => {
    if (!publisherId) {
      setSubmissions([]);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      setSubmissions(await fetchSubmissions(publisherId));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Erreur inconnue');
    } finally {
      setLoading(false);
    }
  }, [publisherId]);

  useEffect(() => {
    void reload();
  }, [reload]);

  return { submissions, error, loading, reload };
}
