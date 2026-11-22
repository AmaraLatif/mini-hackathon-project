/** Module 2 - area search with an autocomplete dropdown. */
import { useEffect, useRef, useState } from 'react';
import { FiMapPin, FiSearch, FiX } from 'react-icons/fi';
import RiskBadge from '@/components/ui/RiskBadge';

export default function SearchBar({ query, onQueryChange, suggestions, onPick, onClear }) {
  const [open, setOpen] = useState(false);
  const [cursor, setCursor] = useState(0);
  const wrapRef = useRef(null);

  useEffect(() => {
    const close = (e) => wrapRef.current && !wrapRef.current.contains(e.target) && setOpen(false);
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);
  useEffect(() => setCursor(0), [suggestions]);

  const pick = (c) => {
    onPick(c.id);
    setOpen(false);
  };

  const onKeyDown = (e) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setCursor((i) => Math.min(i + 1, suggestions.length - 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setCursor((i) => Math.max(i - 1, 0)); }
    else if (e.key === 'Enter' && suggestions[cursor]) pick(suggestions[cursor]);
    else if (e.key === 'Escape') setOpen(false);
  };

  const showList = open && query.trim().length > 0;

  return (
    <div ref={wrapRef} className="relative">
      <FiSearch className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
      <input
        className="glass-input !pl-11 !pr-10"
        placeholder="Search an area or city, e.g. Saddar or Sukkur"
        value={query}
        onChange={(e) => { onQueryChange(e.target.value); setOpen(true); }}
        onFocus={() => setOpen(true)}
        onKeyDown={onKeyDown}
        role="combobox"
        aria-expanded={showList}
        aria-controls="area-suggestions"
        aria-label="Search areas"
      />
      {query && (
        <button type="button" onClick={onClear} aria-label="Clear search" className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1.5 text-slate-400 hover:bg-white/10 hover:text-white">
          <FiX size={14} />
        </button>
      )}

      {showList && (
        <ul id="area-suggestions" role="listbox" className="glass absolute z-30 mt-2 w-full overflow-hidden rounded-2xl bg-ink-800/95 p-1.5">
          {suggestions.length === 0 && <li className="px-3 py-3 text-sm text-slate-400">No areas match "{query}".</li>}
          {suggestions.map((c, i) => (
            <li key={c.id} role="option" aria-selected={i === cursor}>
              <button
                type="button"
                onMouseEnter={() => setCursor(i)}
                onClick={() => pick(c)}
                className={`flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-left transition ${i === cursor ? 'bg-white/10' : ''}`}
              >
                <span className="flex min-w-0 items-center gap-2.5">
                  <FiMapPin className="shrink-0 text-slate-500" />
                  <span className="truncate text-sm text-white">{c.area}<span className="text-slate-400">, {c.city}</span></span>
                </span>
                <RiskBadge risk={c.riskLevel} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
