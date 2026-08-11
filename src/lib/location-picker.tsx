import { useEffect, useRef, useState } from "react";
import { MapPin, LocateFixed, Loader2 } from "lucide-react";

// Leaflet is loaded lazily on the client only — SSR-safe.
export function LocationPicker({
  value,
  onChange,
}: {
  value: { lat: number | null; lng: number | null };
  onChange: (v: { lat: number; lng: number; address?: string; pincode?: string; city?: string }) => void;
}) {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMap = useRef<any>(null);
  const marker = useRef<any>(null);
  const [ready, setReady] = useState(false);
  const [locating, setLocating] = useState(false);
  const [addr, setAddr] = useState<string>("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const L = (await import("leaflet")).default;
      await import("leaflet/dist/leaflet.css");
      if (cancelled || !mapRef.current) return;

      const start: [number, number] = [value.lat ?? 11.3410, value.lng ?? 77.7172]; // Erode
      const map = L.map(mapRef.current, { zoomControl: true }).setView(start, value.lat ? 16 : 13);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap",
        maxZoom: 19,
      }).addTo(map);

      const pinIcon = L.divIcon({
        className: "",
        html: `<div style="transform:translate(-50%,-100%);font-size:34px;line-height:1">📍</div>`,
        iconSize: [1, 1],
      });

      const m = L.marker(start, { draggable: true, icon: pinIcon }).addTo(map);
      leafletMap.current = map;
      marker.current = m;

      async function commit(lat: number, lng: number) {
        const info = await reverseGeocode(lat, lng);
        setAddr(info?.display ?? "");
        onChange({ lat, lng, address: info?.display, pincode: info?.pincode, city: info?.city });
      }

      m.on("dragend", () => { const p = m.getLatLng(); commit(p.lat, p.lng); });
      map.on("click", (e: any) => { m.setLatLng(e.latlng); commit(e.latlng.lat, e.latlng.lng); });

      setReady(true);
      if (value.lat && value.lng) commit(value.lat, value.lng);
    })();
    return () => { cancelled = true; leafletMap.current?.remove(); leafletMap.current = null; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function useCurrent() {
    if (!navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        if (leafletMap.current && marker.current) {
          leafletMap.current.setView([latitude, longitude], 17);
          marker.current.setLatLng([latitude, longitude]);
        }
        const info = await reverseGeocode(latitude, longitude);
        setAddr(info?.display ?? "");
        onChange({ lat: latitude, lng: longitude, address: info?.display, pincode: info?.pincode, city: info?.city });
        setLocating(false);
      },
      () => setLocating(false),
      { enableHighAccuracy: true, timeout: 10000 },
    );
  }

  return (
    <div className="space-y-2">
      <p className="text-sm font-semibold flex items-center gap-1.5"><MapPin className="h-4 w-4 text-brand-red" />Pin your delivery location</p>
      <button type="button" onClick={useCurrent} disabled={locating} className="w-full inline-flex items-center justify-center gap-2.5 h-14 rounded-xl bg-brand-green text-white text-base font-bold shadow-sm hover:brightness-110 disabled:opacity-60 transition">
        {locating ? <Loader2 className="h-5 w-5 animate-spin" /> : <LocateFixed className="h-5 w-5" />}
        Use my current location
      </button>
      <div ref={mapRef} className="w-full h-72 sm:h-80 rounded-xl border border-border overflow-hidden bg-cream" />

      {!ready && <p className="text-xs text-muted-foreground">Loading map…</p>}
      {value.lat != null && value.lng != null && (
        <div className="rounded-lg bg-cream border border-border p-3 text-xs">
          <p className="font-mono">📍 {value.lat.toFixed(5)}, {value.lng.toFixed(5)}</p>
          {addr && <p className="mt-1 text-muted-foreground">{addr}</p>}
        </div>
      )}
      <p className="text-[11px] text-muted-foreground">Tip: tap the map or drag the pin to set the exact drop-off spot.</p>
    </div>
  );
}

async function reverseGeocode(lat: number, lng: number): Promise<{ display: string; pincode?: string; city?: string } | null> {
  try {
    const r = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`, {
      headers: { Accept: "application/json" },
    });
    if (!r.ok) return null;
    const j: any = await r.json();
    const a = j.address ?? {};
    return {
      display: j.display_name ?? "",
      pincode: a.postcode,
      city: a.city ?? a.town ?? a.village ?? a.suburb ?? a.county,
    };
  } catch {
    return null;
  }
}
