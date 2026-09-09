import { useEffect, useMemo, useState } from 'react';
import { Search, Tractor, Wrench } from 'lucide-react';
import { referenceApi } from '../api/referenceApi.js';
import { useFarmData } from '../context/FarmDataContext.jsx';
import { EmptyState, ErrorState, LoadingState, SourceStamp } from '../components/feedback/ApiState.jsx';
import { useLanguage } from '../hooks/useLanguage.jsx';
import { parseDisplayLocation, selectedLocation, hasCoordinates } from '../lib/location.js';
import NearbyServicesMap from '../components/maps/NearbyServicesMap.jsx';

export default function MachineryRentals() {
  const { profile, fields = [] } = useFarmData();
  const { language } = useLanguage();
  const [items, setItems] = useState([]);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [fieldId, setFieldId] = useState(fields[0]?.id || '');
  const selectedField = fields.find((field) => field.id === fieldId) || fields[0];
  const location = useMemo(() => selectedLocation(profile, selectedField), [profile, selectedField]);
  const { district, state } = parseDisplayLocation(profile?.location);
  const [radius, setRadius] = useState(25);
  const [mode, setMode] = useState('list');
  const [selectedId, setSelectedId] = useState(null);
  const [reloadToken, setReloadToken] = useState(0);
  const isHindi = language === 'hi';
  const isMarathi = language === 'mr';

  useEffect(() => {
    let active = true;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    setError(null);
    const request = hasCoordinates(location)
      ? referenceApi.nearbyMachineryRentals({ lat: location.latitude, lon: location.longitude, radius_km: radius, category: category || undefined })
      : referenceApi.listMachineryRentals({ district, state, category: category || undefined });
    request.then((result) => {
      if (active) setItems(Array.isArray(result) ? result : []);
    }).catch((reason) => { if (active) setError(reason); }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [category, district, state, location, radius, reloadToken]);

  const categories = useMemo(() => [...new Set(items.map((item) => item.category).filter(Boolean))], [items]);
  const visible = items.filter((item) => [item.name, item.category, item.provider_name, item.location].join(' ').toLowerCase().includes(query.toLowerCase()));
  const title = isMarathi ? 'शेती यंत्रसामग्री भाडे' : isHindi ? 'कृषि मशीनरी किराया' : 'Machinery & tractor rentals';

  return <div className="mx-auto max-w-[1440px] px-4 py-5 sm:px-6 lg:px-8 lg:py-7"><h1 className="text-2xl font-bold">{title}</h1><p className="mt-1 text-sm text-text-secondary">{isMarathi ? 'संदर्भ सेवेतून उपलब्ध उपकरणे शोधा.' : isHindi ? 'संदर्भ सेवा उपलब्ध उपकरणों की सूची दिखाती है।' : 'Discover equipment from the configured reference catalog. Contact providers directly; no booking is created by this screen.'}</p><div className="mt-5 flex flex-wrap items-center gap-2"><span className="text-xs text-text-secondary">Search near</span>{fields.length > 0 && <select value={selectedField?.id || ''} onChange={(event) => setFieldId(event.target.value)} className="rounded-lg border border-border bg-white px-3 py-2 text-sm">{fields.map((field) => <option value={field.id} key={field.id}>{field.name}</option>)}</select>}<select value={radius} onChange={(event) => setRadius(Number(event.target.value))} className="rounded-lg border border-border bg-white px-3 py-2 text-sm"><option value="10">10 km</option><option value="25">25 km</option><option value="50">50 km</option></select><div className="ml-auto inline-flex rounded-lg bg-surface-muted p-1"><button onClick={() => setMode('list')} className={`rounded-md px-3 py-1.5 text-xs font-semibold ${mode === 'list' ? 'bg-primary text-white' : 'text-text-secondary'}`}>List</button><button onClick={() => setMode('map')} className={`rounded-md px-3 py-1.5 text-xs font-semibold ${mode === 'map' ? 'bg-primary text-white' : 'text-text-secondary'}`}>Map</button></div></div><p className="mt-2 text-xs text-text-secondary">{location.label} · {hasCoordinates(location) ? `${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}` : 'coordinates unavailable; using district fallback'}</p><div className="mt-6">{loading && <LoadingState label="Loading machinery catalog…" />}{!loading && error && <ErrorState error={error} onRetry={() => setReloadToken((value) => value + 1)} />}{!loading && !error && !items.length && <EmptyState title="No machinery catalog records" detail="No verified rental listings matched this field and radius. Try a wider radius or clear the category." />}{!loading && !error && items.length > 0 && <><div className="flex flex-wrap gap-3"><label className="flex min-w-60 flex-1 items-center gap-2 rounded-xl border border-border bg-white px-3 py-2 shadow-card"><Search size={16} className="text-text-muted" /><input value={query} onChange={(event) => setQuery(event.target.value)} className="min-w-0 flex-1 text-sm outline-none" placeholder="Search tractors, implements, providers…" /></label><select value={category} onChange={(event) => setCategory(event.target.value)} className="rounded-xl border border-border bg-white px-3 py-2 text-sm"><option value="">All categories</option>{categories.map((item) => <option value={item} key={item}>{item}</option>)}</select></div>{mode === 'map' && <div className="mt-5"><NearbyServicesMap location={location} items={items} selectedId={selectedId} onSelect={(item) => setSelectedId(item.id)} radiusKm={radius} /></div>}{mode === 'list' && (visible.length ? <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">{visible.map((item) => <article className={`overflow-hidden rounded-card border bg-white shadow-card ${selectedId === item.id ? 'border-primary ring-2 ring-primary/10' : 'border-border'}`} key={item.id} onClick={() => setSelectedId(item.id)}>{item.image_url ? <img src={item.image_url} alt="" className="h-36 w-full object-cover" /> : <div className="grid h-36 place-items-center bg-primary-50 text-primary"><Tractor size={42} /></div>}<div className="p-5"><div className="flex items-start justify-between gap-3"><div><span className="text-xs font-semibold uppercase tracking-wide text-primary">{item.category}</span><h2 className="mt-1 font-bold">{item.name}</h2></div><Wrench size={18} className="shrink-0 text-primary" /></div><p className="mt-3 text-sm text-text-secondary">{item.description || item.provider_name}</p><div className="mt-4 grid grid-cols-2 gap-2 text-xs"><span className="rounded-lg bg-surface-muted p-2">Hourly: <b>{item.hourly_rate == null ? '—' : `₹${item.hourly_rate}`}</b></span><span className="rounded-lg bg-surface-muted p-2">Daily: <b>{item.daily_rate == null ? '—' : `₹${item.daily_rate}`}</b></span></div><p className="mt-3 text-xs text-text-secondary">{item.location}{item.distance_km == null ? '' : ` · ${item.distance_km} km`}</p><p className="mt-1 text-xs font-semibold text-emerald-700">{item.availability_status}</p>{item.contact_phone && <a href={`tel:${item.contact_phone}`} className="mt-4 inline-block rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-white">Contact provider</a>}<SourceStamp source={item.source} fetchedAt={item.fetched_at || item.observed_at} /></div></article>)}</div> : <div className="mt-5"><EmptyState title="No matching listings" detail="Try another category or search term." /></div>)}</>}</div></div>;
}
