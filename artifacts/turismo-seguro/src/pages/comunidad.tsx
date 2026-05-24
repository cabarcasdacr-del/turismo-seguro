import { useState } from "react";
import { useListIncidentes, useListZonas, useListTiposIncidente, getListIncidentesQueryKey } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronLeft, ChevronRight, Users, Search, SlidersHorizontal, X } from "lucide-react";

export default function Comunidad() {
  const [page, setPage] = useState(1);
  const [zona, setZona] = useState("");
  const [tipo, setTipo] = useState("");
  const [fechaDesde, setFechaDesde] = useState("");
  const [fechaHasta, setFechaHasta] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const { data: zonasData } = useListZonas();
  const { data: tiposData } = useListTiposIncidente();
  const { data, isLoading } = useListIncidentes({
    page,
    limit: 12,
    ...(zona && zona !== "todas" ? { zona } : {}),
    ...(tipo && tipo !== "todos" ? { tipo } : {}),
    ...(fechaDesde ? { fechaDesde } : {}),
    ...(fechaHasta ? { fechaHasta } : {}),
  });

  const incidentes = data?.data ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.ceil(total / 12);

  const hasFilters = !!(zona && zona !== "todas") || !!(tipo && tipo !== "todos") || !!fechaDesde || !!fechaHasta;

  const clearFilters = () => {
    setZona("");
    setTipo("");
    setFechaDesde("");
    setFechaHasta("");
    setPage(1);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Users className="w-6 h-6 text-primary" />
            Reportes de la Comunidad
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            {total.toLocaleString()} incidente{total !== 1 ? "s" : ""} reportado{total !== 1 ? "s" : ""} por la comunidad
          </p>
        </div>
        <Button
          variant={showFilters ? "default" : "outline"}
          size="sm"
          onClick={() => setShowFilters(!showFilters)}
          className="shrink-0"
        >
          <SlidersHorizontal className="w-4 h-4 mr-2" />
          Filtros
          {hasFilters && <span className="ml-1.5 bg-white/20 text-xs rounded-full px-1.5">!</span>}
        </Button>
      </div>

      {/* Filters */}
      {showFilters && (
        <Card className="border-border">
          <CardContent className="p-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <Select value={zona} onValueChange={(v) => { setZona(v); setPage(1); }}>
                <SelectTrigger>
                  <SelectValue placeholder="Zona turística" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todas">Todas las zonas</SelectItem>
                  {zonasData?.map((z) => <SelectItem key={z._id} value={z._id}>{z.nombre}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={tipo} onValueChange={(v) => { setTipo(v); setPage(1); }}>
                <SelectTrigger>
                  <SelectValue placeholder="Tipo de incidente" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos los tipos</SelectItem>
                  {tiposData?.map((t) => <SelectItem key={t._id} value={t._id}>{t.nombre}</SelectItem>)}
                </SelectContent>
              </Select>
              <Input
                type="date"
                value={fechaDesde}
                onChange={(e) => { setFechaDesde(e.target.value); setPage(1); }}
                placeholder="Desde"
              />
              <Input
                type="date"
                value={fechaHasta}
                onChange={(e) => { setFechaHasta(e.target.value); setPage(1); }}
                placeholder="Hasta"
              />
            </div>
            {hasFilters && (
              <Button variant="ghost" size="sm" className="mt-2 text-muted-foreground hover:text-foreground" onClick={clearFilters}>
                <X className="w-3.5 h-3.5 mr-1" />
                Limpiar filtros
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Results */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-36 w-full" />)}
        </div>
      ) : incidentes.length ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {incidentes.map((inc) => (
            <Card key={inc._id} className="border-border hover:shadow-md transition-shadow">
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex flex-wrap gap-1.5">
                    {inc.zonaNombre && (
                      <Badge variant="secondary" className="text-xs font-normal">{inc.zonaNombre}</Badge>
                    )}
                    {inc.tipoNombre && (
                      <Badge variant="outline" className="text-xs font-normal">{inc.tipoNombre}</Badge>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground shrink-0">
                    {new Date(inc.fecha).toLocaleDateString("es-CO", { day: "numeric", month: "short" })}
                  </span>
                </div>
                <p className="text-sm text-foreground line-clamp-3 leading-relaxed">{inc.descripcion}</p>
                {inc.etiquetas?.length ? (
                  <div className="flex flex-wrap gap-1 mt-3">
                    {inc.etiquetas.slice(0, 3).map((et) => (
                      <span key={et} className="text-xs bg-muted px-2 py-0.5 rounded-full text-muted-foreground">#{et}</span>
                    ))}
                  </div>
                ) : null}
                {inc.ubicacion && (
                  <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                    <span>📍</span> {inc.ubicacion}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="border-border">
          <CardContent className="py-16 text-center">
            <Search className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground font-medium">No se encontraron incidentes con estos filtros</p>
            {hasFilters && (
              <Button variant="outline" size="sm" className="mt-4" onClick={clearFilters}>Limpiar filtros</Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Página <strong>{page}</strong> de <strong>{totalPages}</strong> · {total.toLocaleString()} resultados
          </p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            {[...Array(Math.min(5, totalPages))].map((_, i) => {
              const p = Math.max(1, Math.min(page - 2, totalPages - 4)) + i;
              return (
                <Button
                  key={p}
                  variant={p === page ? "default" : "outline"}
                  size="sm"
                  className="w-9"
                  onClick={() => setPage(p)}
                >
                  {p}
                </Button>
              );
            })}
            <Button variant="outline" size="sm" disabled={page === totalPages} onClick={() => setPage((p) => p + 1)}>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
