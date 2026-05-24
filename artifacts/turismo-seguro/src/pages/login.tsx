import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLogin } from "@workspace/api-client-react";
import { useAuth } from "@/lib/auth";
import { useLocation } from "wouter";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ShieldAlert } from "lucide-react";
import { Link } from "wouter";

const schema = z.object({
  correo: z.string().email("Correo inválido"),
  contrasena: z.string().min(1, "Contraseña requerida"),
});

type FormData = z.infer<typeof schema>;

export default function Login() {
  const { login } = useAuth();
  const [, setLocation] = useLocation();
  const loginMutation = useLogin();

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { correo: "", contrasena: "" },
  });

  const onSubmit = (data: FormData) => {
    loginMutation.mutate(
      { data: { correo: data.correo, contrasena: data.contrasena } },
      {
        onSuccess: (res) => {
          login(res.usuario, res.token);
          setLocation("/dashboard");
        },
        onError: () => {
          form.setError("correo", { message: "Correo o contraseña incorrectos" });
        },
      }
    );
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 text-primary mb-4">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight">Turismo Seguro</h1>
          <p className="text-muted-foreground mt-1 text-sm">Sistema de monitoreo de incidentes — Cartagena</p>
        </div>

        <div className="bg-card border border-border rounded-2xl shadow-sm p-8">
          <h2 className="text-xl font-semibold text-foreground mb-6">Iniciar Sesión</h2>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="correo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Correo electrónico</FormLabel>
                    <FormControl>
                      <Input data-testid="input-correo" placeholder="correo@ejemplo.com" type="email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="contrasena"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contraseña</FormLabel>
                    <FormControl>
                      <Input data-testid="input-contrasena" placeholder="••••••••" type="password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button data-testid="button-login" type="submit" className="w-full" disabled={loginMutation.isPending}>
                {loginMutation.isPending ? "Entrando..." : "Iniciar Sesión"}
              </Button>
            </form>
          </Form>
          <p className="text-center text-sm text-muted-foreground mt-6">
            ¿No tienes cuenta?{" "}
            <Link href="/register" className="text-primary font-medium hover:underline">
              Regístrate aquí
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
