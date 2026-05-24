import { useState } from "react";
import { useGetMisReportes, useDeleteIncidente, useUpdateIncidente, useListZonas, useListTiposIncidente, getGetMisReportesQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2, Pencil, Plus, FileText } from "lucide-react";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { Incidente } from "@workspace/api-client-react";

const editSchema = z.object({
  descripcion: z.string().min(10, "Mínimo 10 caracteres"),
  tipoId: z.string().optional(),
  zonaId: z.string().optional(),
  ubicacion: z.string().optional(),
  etiquetas: z.string().optional(),
});
type EditForm = z.infer<typeof editSchema>;

function EditDialog({ incidente, open, onClose }: { incidente: Incidente; open: boolean; onClose: () => void }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: zonas } = useListZonas();
  const { data: tipos } = useListTiposIncidente();
  const updateMutation = useUpdateIncidente();

  const form = useForm<EditForm>({
    resolver: zodResolver(editSchema),
    values: {
      descripcion: incidente.descripcion,
      tipoId: incidente.tipoId ?? "",
      zonaId: incidente.zonaId ?? "",
      ubicacion: incidente.ubicacion ?? "",
      etiquetas: incidente.etiquetas?.join(", ") ?? "",
    },
  });

  const onSubmit = (data: EditForm) => {
    updateMutation.mutate(
      {
        id: incidente._id,
        data: {
          descripcion: data.descripcion,
          ...(data.tipoId ? { tipoId: data.tipoId } : {}),
          ...(data.zonaId ? { zonaId: data.zonaId } : {}),
          ...(data.ubicacion ? { ubicacion: data.ubicacion } : {}),
          etiquetas: data.etiquetas ? data.etiquetas.split(",").map((e) => e.trim()).filter(Boolean) : [],
        },
      },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetMisReportesQueryKey() });
          toast({ title: "Reporte actualizado correctamente" });
          onClose();
        },
        onError: () => toast({ title: "Error al actualizar", variant: "destructive" }),
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Editar Reporte</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField control={form.control} name="descripcion" render={({ field }) => (
              <FormItem>
                <FormLabel>Descripción</FormLabel>
                <FormControl><Textarea className="min-h-[90px] resize-none" {...field} /></FormControl>
              </FormItem>
            )} />
            <div className="grid grid-cols-2 gap-3">
              <FormField control={form.control} name="tipoId" render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Tipo" /></SelectTrigger></FormControl>
                    <SelectContent>{tipos?.map((t) => <SelectItem key={t._id} value={t._id}>{t.nombre}</SelectItem>)}</SelectContent>
                  </Select>
                </FormItem>
              )} />
              <FormField control={form.control} name="zonaId" render={({ field }) => (
                <FormItem>
                  <FormLabel>Zona</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Zona" /></SelectTrigger></FormControl>
                    <SelectContent>{zonas?.map((z) => <SelectItem key={z._id} value={z._id}>{z.nombre}</SelectItem>)}</SelectContent>
                  </Select>
                </FormItem>
              )} />
            </div>
            <FormField control={form.control} name="ubicacion" render={({ field }) => (
              <FormItem>
                <FormLabel>Ubicación</FormLabel>
                <FormControl><Input placeholder="Ej: Calle del Arsenal" {...field} /></FormControl>
              </FormItem>
            )} />
            <FormField control={form.control} name="etiquetas" render={({ field }) => (
              <FormItem>
                <FormLabel>Etiquetas (separadas por coma)</FormLabel>
                <FormControl><Input placeholder="robo, nocturno..." {...field} /></FormControl>
              </FormItem>
            )} />
            <div className="flex gap-2 pt-1">
              <Button type="submit" disabled={updateMutation.isPending} className="flex-1">
                {updateMutation.isPending ? "Guardando..." : "Guardar cambios"}
              </Button>
              <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

export default function MisReportes() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { data: incidentes, isLoading } = useGetMisReportes();
  const deleteMutation = useDeleteIncidente();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editingInc, setEditingInc] = useState<Incidente | null>(null);

  const handleDelete = () => {
    if (!deleteId) return;
    deleteMutation.mutate(
      { id: deleteId },
      {
        onSuccess: () => {
          setDeleteId(null);
          queryClient.invalidateQueries({ queryKey: getGetMisReportesQueryKey() });
          toast({ title: "Reporte eliminado" });
        },
        onError: () => toast({ title: "Error al eliminar", variant: "destructive" }),
      }
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Mis Reportes</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {incidentes?.length ?? 0} reporte{(incidentes?.length ?? 0) !== 1 ? "s" : ""} enviado{(incidentes?.length ?? 0) !== 1 ? "s" : ""}
          </p>
        </div>
        <Link href="/incidentes/nuevo">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Nuevo Reporte
          </Button>
        </Link>
      </div>

      {isLoading ? (
        <div className="space-y-3">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-28 w-full" />)}</div>
      ) : incidentes?.length ? (
        <div className="space-y-3">
          {incidentes.map((inc) => (
            <Card key={inc._id} className="border-border hover:shadow-sm transition-shadow">
              <CardContent className="p-5">
                <div className="flex items-start gap-4">
                  <div className="bg-primary/10 text-primary p-2 rounded-lg shrink-0">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground leading-relaxed">{inc.descripcion}</p>
                    <div className="flex flex-wrap items-center gap-2 mt-2">
                      {inc.zonaNombre && <Badge variant="secondary" className="text-xs">{inc.zonaNombre}</Badge>}
                      {inc.tipoNombre && <Badge variant="outline" className="text-xs">{inc.tipoNombre}</Badge>}
                      <span className="text-xs text-muted-foreground">
                        {new Date(inc.fecha).toLocaleDateString("es-CO", { dateStyle: "medium" })}
                      </span>
                      {inc.ubicacion && (
                        <span className="text-xs text-muted-foreground">📍 {inc.ubicacion}</span>
                      )}
                    </div>
                    {inc.etiquetas?.length ? (
                      <div className="flex gap-1 mt-2">
                        {inc.etiquetas.map((et) => (
                          <span key={et} className="text-xs bg-muted px-2 py-0.5 rounded-full text-muted-foreground">#{et}</span>
                        ))}
                      </div>
                    ) : null}
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-primary/70 hover:text-primary hover:bg-primary/10"
                      onClick={() => setEditingInc(inc)}
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive/70 hover:text-destructive hover:bg-destructive/10"
                      onClick={() => setDeleteId(inc._id)}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="border-border">
          <CardContent className="py-16 text-center">
            <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-foreground font-medium">Aún no tienes reportes</p>
            <p className="text-muted-foreground text-sm mt-1 mb-5">¿Viviste un incidente? Cuéntale a la comunidad</p>
            <Link href="/incidentes/nuevo">
              <Button>Crear mi primer reporte</Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {editingInc && (
        <EditDialog
          incidente={editingInc}
          open={!!editingInc}
          onClose={() => setEditingInc(null)}
        />
      )}

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar reporte</AlertDialogTitle>
            <AlertDialogDescription>Esta acción no se puede deshacer. ¿Confirmas que deseas eliminar este reporte?</AlertDialogDescription>
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
