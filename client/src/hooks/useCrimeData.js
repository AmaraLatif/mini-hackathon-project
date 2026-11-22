/**
 * Module 2 - owns ALL map/dashboard data state: records, filters, selection,
 * layer toggles and derived stats. UI components stay "dumb" and just receive
 * what they need as props from the Dashboard page.
 */
import { useCallback, useEffect, useMemo, useState } from 'react';
import { getCrimes } from '@/services/crimeService';
import { DEFAULT_FILTERS, applyFilters, searchAreas, uniqueSorted } from '@/utils/filters';
import { computeStats } from '@/utils/stats';

export function useCrimeData() {
  const [crimes, setCrimes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [selectedId, setSelectedId] = useState(null);
  const [query, setQuery] = useState('');
  const [layers, setLayers] = useState({ heat: true, markers: true });

  useEffect(() => {
    let alive = true;
    getCrimes()
      .then((data) => alive && setCrimes(data))
      .catch((e) => alive && setError(e.message))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, []);

  const filtered = useMemo(() => applyFilters(crimes, filters), [crimes, filters]);
  const selected = useMemo(() => filtered.find((c) => c.id === selectedId) ?? null, [filtered, selectedId]);
  const stats = useMemo(() => computeStats(filtered), [filtered]);
  const suggestions = useMemo(() => searchAreas(crimes, query), [crimes, query]);
  const cities = useMemo(() => uniqueSorted(crimes.map((c) => c.city)), [crimes]);
  const types = useMemo(() => uniqueSorted(crimes.map((c) => c.crimeType)), [crimes]);
  const siblings = useMemo(
    () => (selected ? filtered.filter((c) => c.city === selected.city && c.id !== selected.id) : []),
    [filtered, selected]
  );

  const selectArea = useCallback(
    (id) => {
      if (id && !filtered.some((c) => c.id === id)) setFilters(DEFAULT_FILTERS); // area was hidden by a filter
      setSelectedId(id);
      const area = crimes.find((c) => c.id === id);
      setQuery(area ? area.area : '');
    },
    [filtered, crimes]
  );

  const clearSelection = useCallback(() => {
    setSelectedId(null);
    setQuery('');
  }, []);

  const setCity = (city) => setFilters((f) => ({ ...f, city }));
  const setType = (type) => setFilters((f) => ({ ...f, type }));
  const toggleRisk = (risk) =>
    setFilters((f) => {
      const has = f.risks.includes(risk);
      if (has && f.risks.length === 1) return f; // always keep at least one level on
      return { ...f, risks: has ? f.risks.filter((r) => r !== risk) : [...f.risks, risk] };
    });
  const resetFilters = () => setFilters(DEFAULT_FILTERS);
  const toggleLayer = (name) => setLayers((l) => ({ ...l, [name]: !l[name] }));

  const filtersActive =
    filters.city !== 'All' || filters.type !== 'All' || filters.risks.length !== DEFAULT_FILTERS.risks.length;

  return {
    crimes, filtered, selected, stats, loading, error,
    filters, filtersActive, cities, types, siblings,
    query, setQuery, suggestions,
    layers, toggleLayer,
    selectArea, clearSelection, setCity, setType, toggleRisk, resetFilters,
  };
}
