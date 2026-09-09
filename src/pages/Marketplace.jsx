import { useCallback, useEffect, useMemo, useState } from 'react';
import { ExternalLink, PackageSearch, Search, Truck, Wrench } from 'lucide-react';
import { referenceApi } from '../api/referenceApi.js';
import { useFarmData } from '../context/FarmDataContext.jsx';
import { EmptyState, ErrorState, LoadingState, SourceStamp } from '../components/feedback/ApiState.jsx';
import { parseDisplayLocation, selectedLocation, hasCoordinates } from '../lib/location.js';
import NearbyServicesMap from '../components/maps/NearbyServicesMap.jsx';

const TYPES = [
  ['all', 'Everything'], ['machinery', 'Machinery'], ['seed', 'Seeds'], ['fertilizer', 'Fertilizers'],
  ['logistics', 'Logistics'], ['buyer', 'Buyers'], ['exporter', 'Exporters'],
];

export default function Marketplace() {
  const { profile, fields = [] } = useFarmData();
  const [fieldId, setFieldId] = useState(fields[0]?.id || '');
  const selectedField = fields.find((field) => field.id === fieldId) || fields[0];
  const location = useMemo(() => selectedLocation(profile, selectedField), [profile, selectedField]);
  const { district, state } = parseDisplayLocation(profile?.location);
  const [listingType, setListingType] = useState('all');
  const [query, setQuery] = useState('');
  const [items, setItems] = useState([]);
  const [directoryStatus, setDirectoryStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [radius, setRadius] = useState(25);
  const [mode, setMode] = useState('list');
  const [selectedId, setSelectedId] = useState(null);
  const load = useCallback(async () => {
    setLoading(true); setError(null);
    try { const search = hasCoordinates(location)
      ? referenceApi.nearbyMarketplace({ lat: location.latitude, lon: location.longitude, radius_km: radius, listing_type: listingType === 'all' ? undefined : listingType })
      : referenceApi.searchMarketplace({ listing_type: listingType === 'all' ? undefined : listingType, district, state, query: query || undefined });
      const [nextItems, nextStatus] = await Promise.all([search, referenceApi.marketplaceStatus()]);
      const filtered = query ? nextItems.filter((item) => [item.title, item.category, item.provider_name, item.description, item.location].join(' ').toLowerCase().includes(query.toLowerCase())) : nextItems;
      setItems(filtered); setDirectoryStatus(nextStatus); }
    catch (reason) { setError(reason); }
    finally { setLoading(false); }
  }, [district, listingType, query, state, location, radius]);
  useEffect(() => { const timer = window.setTimeout(load, 250); return () => window.clearTimeout(timer); }, [load]);
  const categories = useMemo(() => [...new Set(items.map((item) => item.category).filter(Boolean))], [items]);

  return <main className="mx-auto max-w-[1440px] px-4 py-5 sm:px-6 lg:px-8 lg:py-7"><header className="rounded-2xl border border-primary/15 bg-primary-50 px-5 py-5"><div className="flex items-start gap-3"><span className="rounded-xl bg-primary p-3 text-white"><PackageSearch size={24} /></span><div><h1 className="text-2xl font-bold">Farm marketplace directory</h1><p className="mt-1 max-w-3xl text-sm text-text-secondary">Verified public listings for discovery only. Contact a provider directly; KisanSathi does not book, buy, sell, or guarantee a listing.</p></div></div></header><div className="mt-6 flex flex-wrap gap-2">{TYPES.map(([value, label]) => <button key={value} onClick={() => setListingType(value)} className={`rounded-full px-3 py-2 text-xs font-bold ${listingType === value ? 'bg-primary text-white' : 'border border-border bg-white text-text-secondary'}`}>{label}</button>)}</div><div className="mt-4 flex flex-wrap items-center gap-2"><span className="text-xs text-text-secondary">Search near</span>{fields.length > 0 && <select value={selectedField?.id || ''} onChange={(event) => setFieldId(event.target.value)} className="rounded-lg border border-border bg-white px-3 py-2 text-sm">{fields.map((field) => <option value={field.id} key={field.id}>{field.name}</option>)}</select>}<select value={radius} onChange={(event) => setRadius(Number(event.target.value))} className="rounded-lg border border-border bg-white px-3 py-2 text-sm"><option value="10">10 km</option><option value="25">25 km</option><option value="50">50 km</option></select><div className="ml-auto inline-flex rounded-lg bg-surface-muted p-1"><button onClick={() => setMode('list')} className={`rounded-md px-3 py-1.5 text-xs font-semibold ${mode === 'list' ? 'bg-primary text-white' : 'text-text-secondary'}`}>List</button><button onClick={() => setMode('map')} className={`rounded-md px-3 py-1.5 text-xs font-semibold ${mode === 'map' ? 'bg-primary text-white' : 'text-text-secondary'}`}>Map</button></div></div><p className="mt-2 text-xs text-text-secondary">{location.label} · {hasCoordinates(location) ? `${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}` : 'coordinates unavailable; using district fallback'}</p><label className="mt-4 flex max-w-2xl items-center gap-2 rounded-xl border border-border bg-white px-3 py-2 shadow-card"><Search size={17} className="text-text-muted" /><span className="sr-only">Search listings</span><input value={query} onChange={(event) => setQuery(event.target.value)} className="min-w-0 flex-1 text-sm outline-none" placeholder="Search provider, service, crop input, buyer, or location" /></label>{loading ? <div className="mt-5"><LoadingState label="Searching approved public directories…" /></div> : error ? <div className="mt-5"><ErrorState error={error} onRetry={load} /></div> : !items.length ? <div className="mt-5"><EmptyState title="No verified listings yet" detail={directoryStatus?.message || 'No approved listing matched this field and radius. Clear filters or widen the radius.'} /></div> : <><p className="mt-5 text-xs text-text-secondary">{items.length} listings · {categories.length ? `categories: ${categories.join(', ')}` : 'uncategorised'}</p>{mode === 'map' && <div className="mt-4"><NearbyServicesMap location={location} items={items} selectedId={selectedId} onSelect={(item) => setSelectedId(item.id)} radiusKm={radius} /></div>}{mode === 'list' && <section className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">{items.map((item) => <article key={item.id} onClick={() => setSelectedId(item.id)} className={`rounded-card border bg-white p-5 shadow-card ${selectedId === item.id ? 'border-primary ring-2 ring-primary/10' : 'border-border'}`}><div className="flex items-start justify-between gap-3"><span className="rounded-lg bg-primary-50 p-2 text-primary">{item.listing_type === 'logistics' ? <Truck size={18} /> : <Wrench size={18} />}</span><span className="rounded-full bg-surface-muted px-2 py-1 text-[10px] font-bold uppercase text-text-secondary">{item.listing_type}</span></div><h2 className="mt-4 font-bold">{item.title}</h2><p className="mt-1 text-xs font-semibold text-primary">{item.provider_name || 'Public directory listing'}</p><p className="mt-3 min-h-10 text-sm text-text-secondary">{item.description || 'No description was published by the source.'}</p>{item.price_amount != null && <p className="mt-4 text-lg font-bold">{item.price_currency || 'INR'} {item.price_amount.toLocaleString()}<span className="ml-1 text-xs font-medium text-text-secondary">{item.price_unit || ''}</span></p>}<p className="mt-4 text-xs text-text-secondary">{[item.location, item.district, item.state].filter(Boolean).join(', ') || 'Location not published'}{item.distance_km == null ? '' : ` · ${item.distance_km} km`}</p><div className="mt-4 flex flex-wrap gap-2">{item.contact_phone && <a href={`tel:${item.contact_phone}`} className="rounded-lg bg-primary px-3 py-2 text-xs font-bold text-white">Call provider</a>}{item.listing_url && <a href={item.listing_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 rounded-lg border border-border px-3 py-2 text-xs font-bold text-primary">Source listing <ExternalLink size={13} /></a>}</div><SourceStamp source={item.source} fetchedAt={item.fetched_at} /></article>)}</section>}</>}</main>;
}
