/**
 * Module 3 - fetches AI safety advice for the selected area, with an in-memory
 * cache so re-selecting an area is instant. Aborts stale requests.
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { fetchAdvice } from '@/services/advisorService';

const cache = new Map();

export function useSafetyAdvice(area) {
  const [state, setState] = useState({ advice: null, loading: false, error: null });
  const [attempt, setAttempt] = useState(0);
  const areaRef = useRef(area);
  areaRef.current = area;
  const id = area?.id ?? null;

  useEffect(() => {
    if (!id) {
      setState({ advice: null, loading: false, error: null });
      return undefined;
    }
    const cached = cache.get(id);
    if (cached) {
      setState({ advice: cached, loading: false, error: null });
      return undefined;
    }
    const controller = new AbortController();
    setState({ advice: null, loading: true, error: null });
    fetchAdvice(areaRef.current, { signal: controller.signal })
      .then((advice) => {
        cache.set(id, advice);
        setState({ advice, loading: false, error: null });
      })
      .catch((err) => {
        if (err.name !== 'AbortError') setState({ advice: null, loading: false, error: 'Could not load safety advice.' });
      });
    return () => controller.abort();
  }, [id, attempt]);

  const retry = useCallback(() => {
    cache.delete(id);
    setAttempt((n) => n + 1);
  }, [id]);

  return { ...state, retry };
}
