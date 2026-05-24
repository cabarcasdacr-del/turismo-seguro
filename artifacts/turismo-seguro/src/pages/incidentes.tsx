import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { useListIncidentes, useGetMisReportes, useDeleteIncidente, useListZonas, useListTiposIncidente, getListIncidentesQueryKey, getGetMisReportesQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Trash2, Pencil, Plus, ChevronLeft, ChevronRight, Search } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";

export default function Incidentes() {
  const { user } = useAuth();
  const isAdmin = user?.rol === "administrador";
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const [page, setPage] = useState(1);
  const [zona, setZona] = useState<string>("");
  const [tipo, setTipo] = useState<string>("");
  const [fechaDesde, setFechaDesde] = useState("");
  const [fechaHasta, setFechaHasta] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data: zonasData } = useListZonas();
  const { data: tiposData } = useListTiposIncidente();
  const deleteMutation = useDeleteIncidente();

  const adminQuery = useListIncidentes(
    { page, limit: 15, ...(zona ? { zona } : {}), ...(tipo ? { tipo } : {}), ...(fechaDesde ? { fechaDesde } : {}), ...(fechaHasta ? { fechaHasta } : {}) },
    { query: { enabled: isAdmin, queryKey: getListIncidentesQueryKey({ page, limit: 15 }) } }
  );

  const turistaQuery = useGetMisReportes({ query: { enabled: !isAdmin, queryKey: getGetMisReportesQueryKey() } });

  const incidentes = isAdmin ? adminQuery.data?.data : turistaQuery.data;
  const total = isAdmin ? (adminQuery.data?.total ?? 0) : (turistaQuery.data?.length ?? 0);
  const isLoading = isAdmin ? adminQuery.isLoading : turistaQuery.isLoading;
  const totalPages = Math.ceil(total / 15);

  const handleDelete = () => {
    if (!deleteId) return;
    deleteMutation.mutate(
      { id: deleteId },
      {
        onSuccess: () => {
          setDeleteId(null);
          queryClient.invalidateQueries({ queryKey: getListIncidentesQueryKey() });
          toast({ title: "Incidente eliminado" });
        },
        onError: () => toast({ title: "Error al eliminar", variant: "destructive" }),
      }
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{isAdmin ? "Gestión de Incidentes" : "Mis Reportes"}</h1>
          <p className="text-muted-foreground text-sm mt-1">{total} incidente{total !== 1 ? "s" : ""} encontrado{total !== 1 ? "s" : ""}</p>
        </div>
        <Link href="/incidentes/nuevo">
          <Button data-testid="button-nuevo-incidente">
            <Plus className="w-4 h-4 mr-2" />
            Reportar
          </Button>
        </Link>
      </div>

      {isAdmin && (
        <Card className="border-border">
          <CardContent className="p-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <Select value={zona} onValueChange={setZona}>
                <SelectTrigger data-testid="select-zona">
                  <SelectValue placeholder="Filtrar por zona" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todas">Todas las zonas</SelectItem>
                  {zonasData?.map((z) => <SelectItem key={z._id} value={z._id}>{z.nombre}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={tipo} onValueChange={setTipo}>
                <SelectTrigger data-testid="select-tipo">
                  <SelectValue placeholder="Filtrar por tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos los tipos</SelectItem>
                  {tiposData?.map((t) => <SelectItem key={t._id} value={t._id}>{t.nombre}</SelectItem>)}
                </SelectContent>
              </Select>
              <Input type="date" value={fechaDesde} onChange={(e) => setFechaDesde(e.target.value)} placeholder="Fecha desde" data-testid="input-fecha-desde" />
              <Input type="date" value={fechaHasta} onChange={(e) => setFechaHasta(e.target.value)} placeholder="Fecha hasta" data-testid="input-fecha-hasta" />
            </div>
            <Button variant="ghost" size="sm" className="mt-2 text-muted-foreground" onClick={() => { setZona(""); setTipo(""); setFechaDesde(""); setFechaHasta(""); setPage(1); }}>
              Limpiar filtros
            </Button>
          </CardContent>
        </Card>
      )}

      <Card className="border-border">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-3">{[...Array(6)].map((_, i) => <Skeleton key={i} className="h-14 w-full" />)}</div>
          ) : incidentes?.length ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    <th className="text-left p-4 font-medium text-muted-foreground">Descripción</th>
                    <th className="text-left p-4 font-medium text-muted-foreground hidden sm:table-cell">Zona</th>
                    <th className="text-left p-4 font-medium text-muted-foreground hidden md:table-cell">Tipo</th>
                    <th className="text-left p-4 font-medium text-muted-foreground hidden lg:table-cell">Fecha</th>
                    {isAdmin && <th className="text-right p-4 font-medium text-muted-foreground">Acciones</th>}
                  </tr>
                </thead>
                <tbody>
                  {incidentes.map((inc) => (
                    <tr key={inc._id} data-testid={`row-incidente-${inc._id}`} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                      <td className="p-4">
                        <p className="font-medium text-foreground line-clamp-2 max-w-xs">{inc.descripcion}</p>
                        {inc.etiquetas?.length ? (
                          <div className="flex gap-1 mt-1 flex-wrap">
                            {inc.etiquetas.slice(0, 2).map((et) => <Badge key={et} variant="outline" className="text-xs py-0">{et}</Badge>)}
                          </div>
                        ) : null}
                      </td>
                      <td className="p-4 hidden sm:table-cell text-muted-foreground">{inc.zonaNombre ?? "—"}</td>
                      <td className="p-4 hidden md:table-cell text-muted-foreground">{inc.tipoNombre ?? "—"}</td>
                      <td className="p-4 hidden lg:table-cell text-muted-foreground">{new Date(inc.fecha).toLocaleDateString("es-CO")}</td>
                      {isAdmin && (
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setLocation(`/incidentes/${inc._id}`)} data-testid={`button-edit-${inc._id}`}>
                              <Pencil className="w-3.5 h-3.5" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10" onClick={() => setDeleteId(inc._id)} data-testid={`button-delete-${inc._id}`}>
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-16 text-center">
              <Search className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground font-medium">No se encontraron incidentes</p>
              <Link href="/incidentes/nuevo">
                <Button variant="outline" size="sm" className="mt-4">Reportar incidente</Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>

      {isAdmin && totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">Página {page} de {totalPages}</p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="sm" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar incidente</AlertDialogTitle>
            <AlertDialogDescription>Esta acción no se puede deshacer. ¿Confirmas que deseas eliminar este incidente?</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
