import { useEffect, useRef, useState } from "react";
import { useListZonas } from "@workspace/api-client-react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const NIVEL_COLORS: Record<string, string> = {
  alto:    "#ef4444",
  crítico: "#ef4444",
  critico: "#ef4444",
  medio:   "#f59e0b",
  bajo:    "#22c55e",
};

function nivelColor(nivel: string | null | undefined): string {
  return NIVEL_COLORS[(nivel ?? "").toLowerCase()] ?? "#3b82f6";
}

interface MapaIncidente {
  id: string;
  descripcion: string;
  fecha: string;
  latitud: number;
  longitud: number;
  tipoNombre: string | null;
  zonaNombre: string | null;
  nivelRiesgo: string | null;
}

export default function Mapa() {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.CircleMarker[]>([]);
  const [zonaFiltro, setZonaFiltro] = useState("");

  const { data: zonasData } = useListZonas();

  const { data: incidentes = [], isLoading } = useQuery<MapaIncidente[]>({
    queryKey: ["stats", "mapa", zonaFiltro],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (zonaFiltro && zonaFiltro !== "todas") params.set("zona", zonaFiltro);
      const token = localStorage.getItem("auth_token");
      const res = await fetch(`/api/stats/mapa?${params}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) throw new Error("Error al cargar datos del mapa");
      return res.json();
    },
    staleTime: 30_000,
  });

  // Init map once
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;
    const map = L.map(mapRef.current).setView([10.4236, -75.5515], 13);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(map);
    mapInstanceRef.current = map;
    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update markers when data changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Remove old markers
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    incidentes.forEach((inc) => {
      if (inc.latitud == null || inc.longitud == null) return;
      const color = nivelColor(inc.nivelRiesgo);
      const marker = L.circleMarker([inc.latitud, inc.longitud], {
        radius: 6,
        fillColor: color,
        color: "#fff",
        weight: 1.5,
        fillOpacity: 0.85,
      })
        .addTo(map)
        .bindPopup(`
          <div style="max-width:240px;font-family:sans-serif">
            <p style="font-weight:700;font-size:13px;margin:0 0 4px">${inc.tipoNombre ?? "Incidente"}</p>
            <p style="font-size:12px;color:#555;margin:0 0 6px;line-height:1.4">${inc.descripcion.slice(0, 120)}${inc.descripcion.length > 120 ? "…" : ""}</p>
            <div style="display:flex;gap:6px;flex-wrap:wrap">
              ${inc.zonaNombre ? `<span style="background:#f1f5f9;padding:2px 8px;border-radius:9999px;font-size:11px;color:#64748b">${inc.zonaNombre}</span>` : ""}
              ${inc.nivelRiesgo ? `<span style="background:${color}22;color:${color};padding:2px 8px;border-radius:9999px;font-size:11px;font-weight:600">${inc.nivelRiesgo}</span>` : ""}
            </div>
            <p style="font-size:11px;color:#94a3b8;margin:6px 0 0">${new Date(inc.fecha).toLocaleDateString("es-CO", { dateStyle: "medium" })}</p>
          </div>
        `);
      markersRef.current.push(marker);
    });
  }, [incidentes]);

  // Stats by zone
  const byZone = incidentes.reduce<Record<string, number>>((acc, inc) => {
    const k = inc.zonaNombre ?? "Sin zona";
    acc[k] = (acc[k] ?? 0) + 1;
    return acc;
  }, {});

  const zoneStats = Object.entries(byZone)
    .sort((a, b) => b[1] - a[1])
    .map(([nombre, count]) => {
      const zona = zonasData?.find((z) => z.nombre === nombre);
      return { nombre, count, nivelRiesgo: zona?.nivelRiesgo };
    });

  const nivelBadge = (nivel: string | null | undefined) => {
    const l = (nivel ?? "").toLowerCase();
    if (l.includes("alto") || l.includes("critico")) return "destructive";
    if (l.includes("medio")) return "default";
    return "secondary";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Mapa de Incidentes</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {isLoading ? "Cargando…" : `${incidentes.length.toLocaleString()} incidentes con ubicación GPS en Cartagena`}
          </p>
        </div>
        <Select value={zonaFiltro} onValueChange={setZonaFiltro}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Todas las zonas" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todas">Todas las zonas</SelectItem>
            {zonasData?.map((z) => (
              <SelectItem key={z._id} value={z._id}>{z.nombre}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Map */}
        <Card className="lg:col-span-3 border-border overflow-hidden">
          {isLoading ? (
            <Skeleton className="h-[520px] w-full rounded-none" />
          ) : (
            <div ref={mapRef} style={{ height: "520px", width: "100%" }} />
          )}
        </Card>

        {/* Sidebar */}
        <div className="space-y-4">
          <Card className="border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold">Nivel de Riesgo</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {[
                { label: "Alto / Crítico", color: "#ef4444" },
                { label: "Medio", color: "#f59e0b" },
                { label: "Bajo", color: "#22c55e" },
                { label: "Sin clasificar", color: "#3b82f6" },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-2 text-xs text-muted-foreground">
                  <div className="w-3 h-3 rounded-full shrink-0" style={{ background: item.color }} />
                  {item.label}
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold">Incidentes por Zona</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2.5">
              {zoneStats.length ? zoneStats.map(({ nombre, count, nivelRiesgo }) => (
                <div key={nombre} className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <Badge variant={nivelBadge(nivelRiesgo) as any} className="text-xs shrink-0 py-0 px-1.5">
                      {(nivelRiesgo ?? "?").slice(0, 1).toUpperCase()}
                    </Badge>
                    <span className="text-xs text-foreground truncate">{nombre}</span>
                  </div>
                  <span className="text-xs font-bold text-primary shrink-0">{count}</span>
                </div>
              )) : (
                <p className="text-xs text-muted-foreground">Cargando zonas…</p>
              )}
            </CardContent>
          </Card>

          <p className="text-xs text-muted-foreground text-center leading-relaxed px-1">
            Haz clic en cualquier punto para ver el detalle del incidente
          </p>
        </div>
      </div>
    </div>
  );
}
