import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Wifi, AlertTriangle, CheckCircle } from 'lucide-react';
import { HARBORS } from '@/data';

// Use Leaflet via CDN-style dynamic import to avoid SSR issues
export const MapPage: React.FC = () => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);

  useEffect(() => {
    if (mapInstance.current || !mapRef.current) return;

    import('leaflet').then(L => {
      // Fix default icon paths
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });

      const map = L.map(mapRef.current!, {
        center: [12.87, 74.84],
        zoom: 11,
        zoomControl: true,
        attributionControl: false,
      });

      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '© OpenStreetMap contributors © CARTO',
      }).addTo(map);

      HARBORS.forEach(h => {
        const color = h.congestion === 'LOW' ? '#10b981' : h.congestion === 'MEDIUM' ? '#f59e0b' : '#f43f5e';

        // Circle heatmap
        L.circle([h.location.lat, h.location.lng], {
          radius: 1500,
          fillColor: color,
          fillOpacity: 0.18,
          color,
          weight: 1.5,
          opacity: 0.6,
        }).addTo(map);

        // Custom icon marker
        const icon = L.divIcon({
          html: `<div style="
            background:${color}22;
            border:2px solid ${color};
            border-radius:50%;
            width:32px;height:32px;
            display:flex;align-items:center;justify-content:center;
            font-size:14px;
            box-shadow:0 0 12px ${color}66;
          ">🏔</div>`,
          className: '',
          iconSize: [32, 32],
          iconAnchor: [16, 16],
        });

        const popup = `
          <div style="background:#0d1530;border:1px solid ${color}44;border-radius:12px;padding:12px;color:#e2e8f0;min-width:180px;font-family:system-ui">
            <p style="font-weight:700;font-size:13px;margin-bottom:6px">⚓ ${h.name}</p>
            <p style="color:${color};font-size:12px;font-weight:600">● ${h.congestion} Congestion</p>
            <p style="color:#94a3b8;font-size:11px;margin-top:4px">Active Vendors: ${h.activeVendors}</p>
            <p style="color:#94a3b8;font-size:11px">Supply: ${h.supplyLevel}</p>
            <p style="color:#94a3b8;font-size:11px">Zone: ${h.zone}</p>
            ${h.isRecommended ? `<p style="color:#10b981;font-size:11px;margin-top:6px;font-weight:600">✓ AI Recommended</p>` : ''}
          </div>`;

        L.marker([h.location.lat, h.location.lng], { icon }).bindPopup(popup, {
          className: 'fishflow-popup',
          maxWidth: 220,
        }).addTo(map);
      });

      mapInstance.current = map;
    });

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, []);

  return (
    <div className="min-h-screen gradient-bg-primary pt-20 px-4 pb-12">
      <div className="max-w-6xl mx-auto">

        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-5">
          <h1 className="text-2xl font-black text-white">Harbor Congestion Map</h1>
          <p className="text-slate-400 text-sm">Real-time supply density · AI traffic indicators</p>
        </motion.div>

        {/* Legend */}
        <div className="flex flex-wrap gap-4 mb-4">
          {[
            { color: 'bg-emerald-400', label: 'Low Congestion — Best to sell' },
            { color: 'bg-amber-400',   label: 'Moderate — Proceed with caution' },
            { color: 'bg-rose-400',    label: 'High Congestion / Oversupply' },
          ].map(l => (
            <div key={l.label} className="flex items-center gap-2 text-sm text-slate-300">
              <span className={`w-3 h-3 rounded-full ${l.color}`} />
              {l.label}
            </div>
          ))}
        </div>

        {/* Map container */}
        <div className="relative rounded-2xl overflow-hidden border border-cyan-500/20 mb-6" style={{ height: 420 }}>
          <div ref={mapRef} className="w-full h-full" />
          {/* Leaflet CSS */}
          <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
        </div>

        {/* Harbor cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {HARBORS.map(h => {
            const congColor = h.congestion === 'LOW' ? 'border-emerald-500/30 text-emerald-400' : h.congestion === 'MEDIUM' ? 'border-amber-500/30 text-amber-400' : 'border-rose-500/30 text-rose-400';
            const icon = h.congestion === 'LOW' ? CheckCircle : h.congestion === 'MEDIUM' ? Wifi : AlertTriangle;
            const IconComp = icon;
            return (
              <motion.div key={h.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
                className={`glass rounded-2xl border p-4 ${congColor.split(' ')[0]} ${h.isRecommended ? 'ring-1 ring-emerald-500/20' : ''}`}>
                {h.isRecommended && (
                  <span className="text-[10px] text-emerald-400 font-semibold uppercase tracking-wider">✓ AI Recommended</span>
                )}
                <div className="flex items-center gap-2 mt-1 mb-2">
                  <MapPin size={14} className={congColor.split(' ')[1]} />
                  <p className="text-white text-sm font-semibold leading-tight">{h.name}</p>
                </div>
                <div className="flex items-center gap-1.5 mb-3">
                  <IconComp size={12} className={congColor.split(' ')[1]} />
                  <span className={`text-xs font-medium ${congColor.split(' ')[1]}`}>{h.congestion} Congestion</span>
                </div>
                <div className="space-y-1 text-xs text-slate-400">
                  <p>{h.activeVendors} active vendors</p>
                  <p>Supply: {h.supplyLevel}</p>
                  <p>Zone: {h.zone}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
