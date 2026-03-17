import { useState, useRef, useEffect } from 'react';
import citiesData from '../data/cities.json';

interface City {
  n: string;   // name
  c: string;   // country code
  lat: number;
  lon: number;
  tz: number;  // UTC offset
  tzName: string;
  pop: number;
}

const cities = citiesData as City[];

interface Props {
  label: string;
  onSelect: (city: { name: string; lat: number; lon: number; tz: number }) => void;
}

export function CitySearch({ label, onSelect }: Props) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<City[]>([]);
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState('');
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleChange = (val: string) => {
    setQuery(val);
    setSelected('');
    if (val.length < 2) {
      setResults([]);
      setOpen(false);
      return;
    }
    const lower = val.toLowerCase();
    const matches = cities
      .filter(c => c.n.toLowerCase().startsWith(lower))
      .slice(0, 12);
    // Also check contains if not enough startsWith matches
    if (matches.length < 8) {
      const containsMatches = cities
        .filter(c => !c.n.toLowerCase().startsWith(lower) && c.n.toLowerCase().includes(lower))
        .slice(0, 12 - matches.length);
      matches.push(...containsMatches);
    }
    setResults(matches);
    setOpen(matches.length > 0);
  };

  const handleSelect = (city: City) => {
    const display = `${city.n}, ${city.c}`;
    setSelected(display);
    setQuery(display);
    setOpen(false);
    onSelect({ name: display, lat: city.lat, lon: city.lon, tz: city.tz });
  };

  return (
    <div className="city-search" ref={ref}>
      <label>{label}</label>
      <input
        value={query}
        onChange={e => handleChange(e.target.value)}
        onFocus={() => { if (results.length > 0 && !selected) setOpen(true); }}
        placeholder="Start typing a city name..."
      />
      {open && (
        <ul className="city-dropdown">
          {results.map((c, i) => (
            <li key={`${c.n}-${c.c}-${i}`} onClick={() => handleSelect(c)}>
              <span className="city-name">{c.n}</span>
              <span className="city-meta">{c.c} ({c.lat.toFixed(2)}, {c.lon.toFixed(2)}) UTC{c.tz >= 0 ? '+' : ''}{c.tz}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
