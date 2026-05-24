import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useUpdateUsuario } from "@workspace/api-client-react";
import { useAuth } from "@/lib/auth";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { UserCircle } from "lucide-react";

const schema = z.object({
  nombre: z.string().min(2, "Nombre requerido"),
  correo: z.string().email("Correo inválido"),
});

type FormData = z.infer<typeof schema>;

export default function Perfil() {
  const { user, updateUser } = useAuth();
  const { toast } = useToast();
  const updateMutation = useUpdateUsuario();

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { nombre: user?.nombre ?? "", correo: user?.correo ?? "" },
    values: { nombre: user?.nombre ?? "", correo: user?.correo ?? "" },
  });

  const onSubmit = (data: FormData) => {
    if (!user) return;
    updateMutation.mutate(
      { id: user._id, data: { nombre: data.nombre, correo: data.correo } },
      {
        onSuccess: (updated) => {
          updateUser(updated);
          toast({ title: "Perfil actualizado correctamente" });
        },
        onError: () => toast({ title: "Error al actualizar perfil", variant: "destructive" }),
      }
    );
  };

  return (
    <div className="space-y-6 max-w-lg">
      <h1 className="text-2xl font-bold text-foreground">Mi Perfil</h1>

      <Card className="border-border">
        <CardContent className="p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center text-primary text-2xl font-bold">
              {user?.nombre?.charAt(0).toUpperCase() ?? <UserCircle />}
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">{user?.nombre}</h2>
              <Badge variant={user?.rol === "administrador" ? "default" : "secondary"} className="capitalize mt-1">
                {user?.rol}
              </Badge>
            </div>
          </div>

          {user?.fechaRegistro && (
            <p className="text-xs text-muted-foreground mb-6">
              Miembro desde {new Date(user.fechaRegistro).toLocaleDateString("es-CO", { dateStyle: "long" })}
            </p>
          )}

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="nombre"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre completo</FormLabel>
                    <FormControl>
                      <Input data-testid="input-nombre" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="correo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Correo electrónico</FormLabel>
                    <FormControl>
                      <Input data-testid="input-correo" type="email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={updateMutation.isPending} data-testid="button-save-perfil">
                {updateMutation.isPending ? "Guardando..." : "Guardar cambios"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
