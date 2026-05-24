import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useCreateIncidente, useListZonas, useListTiposIncidente, getListIncidentesQueryKey, getGetMisReportesQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft } from "lucide-react";
import { Link } from "wouter";

const schema = z.object({
  descripcion: z.string().min(10, "Describe el incidente con al menos 10 caracteres"),
  tipoId: z.string().optional(),
  zonaId: z.string().optional(),
  ubicacion: z.string().optional(),
  etiquetas: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export default function NuevoIncidente() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: zonas } = useListZonas();
  const { data: tipos } = useListTiposIncidente();
  const createMutation = useCreateIncidente();

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { descripcion: "", tipoId: "", zonaId: "", ubicacion: "", etiquetas: "" },
  });

  const onSubmit = (data: FormData) => {
    const etiquetasArray = data.etiquetas
      ? data.etiquetas.split(",").map((e) => e.trim()).filter(Boolean)
      : [];

    createMutation.mutate(
      {
        data: {
          descripcion: data.descripcion,
          ...(data.tipoId ? { tipoId: data.tipoId } : {}),
          ...(data.zonaId ? { zonaId: data.zonaId } : {}),
          ...(data.ubicacion ? { ubicacion: data.ubicacion } : {}),
          etiquetas: etiquetasArray,
        },
      },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListIncidentesQueryKey() });
          queryClient.invalidateQueries({ queryKey: getGetMisReportesQueryKey() });
          toast({ title: "Incidente reportado correctamente" });
          setLocation("/incidentes");
        },
        onError: () => toast({ title: "Error al reportar incidente", variant: "destructive" }),
      }
    );
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-3">
        <Link href="/incidentes">
          <Button variant="ghost" size="icon"><ArrowLeft className="w-4 h-4" /></Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Reportar Incidente</h1>
          <p className="text-muted-foreground text-sm mt-0.5">Documenta un incidente de seguridad turística</p>
        </div>
      </div>

      <Card className="border-border">
        <CardHeader>
          <CardTitle className="text-base">Información del Incidente</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              <FormField
                control={form.control}
                name="descripcion"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descripción <span className="text-destructive">*</span></FormLabel>
                    <FormControl>
                      <Textarea
                        data-testid="input-descripcion"
                        placeholder="Describe detalladamente lo que ocurrió..."
                        className="min-h-[120px] resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="tipoId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo de incidente</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-tipo">
                            <SelectValue placeholder="Seleccionar tipo" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {tipos?.map((t) => <SelectItem key={t._id} value={t._id}>{t.nombre}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="zonaId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Zona turística</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-zona">
                            <SelectValue placeholder="Seleccionar zona" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {zonas?.map((z) => <SelectItem key={z._id} value={z._id}>{z.nombre}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="ubicacion"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ubicación específica</FormLabel>
                    <FormControl>
                      <Input data-testid="input-ubicacion" placeholder="Ej: Calle del Arsenal, frente al parque" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="etiquetas"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Etiquetas</FormLabel>
                    <FormControl>
                      <Input data-testid="input-etiquetas" placeholder="robo, nocturno, turista (separadas por coma)" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex gap-3 pt-2">
                <Button type="submit" disabled={createMutation.isPending} data-testid="button-submit">
                  {createMutation.isPending ? "Enviando..." : "Reportar Incidente"}
                </Button>
                <Link href="/incidentes">
                  <Button type="button" variant="outline">Cancelar</Button>
                </Link>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
