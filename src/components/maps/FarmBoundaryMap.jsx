import { useEffect, useMemo } from 'react';
import { GeoJSON, MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet';
import L from 'leaflet';

const INDIA_CENTER = [20.5937, 78.9629];

function FitBounds({ fields, selected }) {
  const map = useMap();
  useEffect(() => {
    const candidates = (selected ? [selected] : fields).filter((field) => field?.boundary_geojson);
    const layers = candidates.map((field) => L.geoJSON(field.boundary_geojson)).filter((layer) => layer.getBounds().isValid());
    if (layers.length) {
      const bounds = layers[0].getBounds();
      layers.slice(1).forEach((layer) => bounds.extend(layer.getBounds()));
      map.fitBounds(bounds, { padding: [24, 24], maxZoom: 17 });
      return;
    }
    const point = selected || fields.find((field) => field.centroid_lat != null && field.centroid_lon != null);
    if (point) map.setView([point.centroid_lat, point.centroid_lon], 15);
  }, [fields, map, selected]);
  return null;
}

function centroid(field) {
  if (field?.centroid_lat != null && field?.centroid_lon != null) return [field.centroid_lat, field.centroid_lon];
  const layer = field?.boundary_geojson ? L.geoJSON(field.boundary_geojson) : null;
  if (!layer?.getBounds().isValid()) return null;
  const center = layer.getBounds().getCenter();
  return [center.lat, center.lng];
}

export default function FarmBoundaryMap({ fields, selected, onSelect, className = 'h-[430px]' }) {
  const center = useMemo(() => {
    const point = centroid(selected) || centroid(fields[0]);
    return point || INDIA_CENTER;
  }, [fields, selected]);
  return <div className={`relative z-0 overflow-hidden rounded-card border border-border shadow-card ${className}`}>
    <MapContainer center={center} zoom={selected ? 15 : 5} scrollWheelZoom className="h-full w-full" aria-label="Farm boundaries map">
      <TileLayer attribution="&copy; OpenStreetMap contributors" url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <FitBounds fields={fields} selected={selected} />
      {fields.map((field) => {
        const point = centroid(field);
        return <span key={field.id}>
          {field.boundary_geojson && <GeoJSON data={field.boundary_geojson} eventHandlers={{ click: () => onSelect?.(field) }} style={() => ({ color: field.id === selected?.id ? '#14532d' : '#2e7d32', weight: field.id === selected?.id ? 4 : 2, fillColor: field.id === selected?.id ? '#4d9b58' : '#8fbd64', fillOpacity: field.id === selected?.id ? 0.62 : 0.4 })} />}
          {point && <Marker position={point} eventHandlers={{ click: () => onSelect?.(field) }}><Popup><b>{field.name}</b><br />{field.current_crop || 'Crop not recorded'} · {field.area_acres} acres<br />{field.alert_count || 0} open alerts</Popup></Marker>}
        </span>;
      })}
    </MapContainer>
    <span className="pointer-events-none absolute bottom-3 left-3 z-[500] rounded-lg bg-black/60 px-3 py-2 text-xs text-white">Backend GeoJSON · select a field</span>
  </div>;
}
