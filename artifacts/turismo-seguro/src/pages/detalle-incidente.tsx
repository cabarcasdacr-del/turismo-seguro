import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useGetIncidente, useUpdateIncidente, useListZonas, useListTiposIncidente, getListIncidentesQueryKey, getGetIncidenteQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Pencil } from "lucide-react";
import { Link } from "wouter";

const schema = z.object({
  descripcion: z.string().min(10, "Mínimo 10 caracteres"),
  tipoId: z.string().optional(),
  zonaId: z.string().optional(),
  ubicacion: z.string().optional(),
  etiquetas: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export default function DetalleIncidente({ params }: { params: { id: string } }) {
  const { id } = params;
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState(false);

  const { data: incidente, isLoading } = useGetIncidente(id);
  const { data: zonas } = useListZonas();
  const { data: tipos } = useListTiposIncidente();
  const updateMutation = useUpdateIncidente();

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      descripcion: incidente?.descripcion ?? "",
      tipoId: incidente?.tipoId ?? "",
      zonaId: incidente?.zonaId ?? "",
      ubicacion: incidente?.ubicacion ?? "",
      etiquetas: incidente?.etiquetas?.join(", ") ?? "",
    },
    values: {
      descripcion: incidente?.descripcion ?? "",
      tipoId: incidente?.tipoId ?? "",
      zonaId: incidente?.zonaId ?? "",
      ubicacion: incidente?.ubicacion ?? "",
      etiquetas: incidente?.etiquetas?.join(", ") ?? "",
    },
  });

  const onSubmit = (data: FormData) => {
    updateMutation.mutate(
      {
        id,
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
          queryClient.invalidateQueries({ queryKey: getListIncidentesQueryKey() });
          queryClient.invalidateQueries({ queryKey: getGetIncidenteQueryKey(id) });
          setEditing(false);
          toast({ title: "Incidente actualizado" });
        },
        onError: () => toast({ title: "Error al actualizar", variant: "destructive" }),
      }
    );
  };

  if (isLoading) return <div className="space-y-4"><Skeleton className="h-8 w-64" /><Skeleton className="h-64 w-full" /></div>;
  if (!incidente) return <div className="text-center py-12 text-muted-foreground">Incidente no encontrado</div>;

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/incidentes">
            <Button variant="ghost" size="icon"><ArrowLeft className="w-4 h-4" /></Button>
          </Link>
          <h1 className="text-2xl font-bold text-foreground">Detalle del Incidente</h1>
        </div>
        {!editing && (
          <Button variant="outline" size="sm" onClick={() => setEditing(true)}>
            <Pencil className="w-4 h-4 mr-2" /> Editar
          </Button>
        )}
      </div>

      {!editing ? (
        <Card className="border-border">
          <CardContent className="p-6 space-y-4">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium mb-1">Descripción</p>
              <p className="text-foreground">{incidente.descripcion}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium mb-1">Tipo</p>
                <p className="text-foreground">{incidente.tipoNombre ?? "—"}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium mb-1">Zona</p>
                <p className="text-foreground">{incidente.zonaNombre ?? "—"}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium mb-1">Fecha</p>
                <p className="text-foreground">{new Date(incidente.fecha).toLocaleDateString("es-CO", { dateStyle: "long" })}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium mb-1">Reportado por</p>
                <p className="text-foreground">{incidente.usuarioNombre ?? "—"}</p>
              </div>
              {incidente.ubicacion && (
                <div className="col-span-2">
                  <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium mb-1">Ubicación</p>
                  <p className="text-foreground">{incidente.ubicacion}</p>
                </div>
              )}
            </div>
            {incidente.etiquetas?.length ? (
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium mb-2">Etiquetas</p>
                <div className="flex flex-wrap gap-2">
                  {incidente.etiquetas.map((et) => <Badge key={et} variant="secondary">{et}</Badge>)}
                </div>
              </div>
            ) : null}
          </CardContent>
        </Card>
      ) : (
        <Card className="border-border">
          <CardHeader><CardTitle className="text-base">Editar Incidente</CardTitle></CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                <FormField control={form.control} name="descripcion" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descripción</FormLabel>
                    <FormControl><Textarea className="min-h-[100px] resize-none" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <div className="grid grid-cols-2 gap-4">
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
                    <FormControl><Input {...field} /></FormControl>
                  </FormItem>
                )} />
                <FormField control={form.control} name="etiquetas" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Etiquetas (separadas por coma)</FormLabel>
                    <FormControl><Input {...field} /></FormControl>
                  </FormItem>
                )} />
                <div className="flex gap-3">
                  <Button type="submit" disabled={updateMutation.isPending}>{updateMutation.isPending ? "Guardando..." : "Guardar"}</Button>
                  <Button type="button" variant="outline" onClick={() => setEditing(false)}>Cancelar</Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
