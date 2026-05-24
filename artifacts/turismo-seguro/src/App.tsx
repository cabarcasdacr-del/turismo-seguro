import { Switch, Route, Router as WouterRouter, useLocation, Redirect } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/lib/auth";
import { setAuthTokenGetter } from "@workspace/api-client-react";
import { Layout } from "@/components/layout";
import Landing from "@/pages/landing";
import Login from "@/pages/login";
import Register from "@/pages/register";
import Dashboard from "@/pages/dashboard";
import Incidentes from "@/pages/incidentes";
import MisReportes from "@/pages/mis-reportes";
import NuevoIncidente from "@/pages/nuevo-incidente";
import DetalleIncidente from "@/pages/detalle-incidente";
import Estadisticas from "@/pages/estadisticas";
import Comunidad from "@/pages/comunidad";
import Mapa from "@/pages/mapa";
import Zonas from "@/pages/zonas";
import Usuarios from "@/pages/usuarios";
import Perfil from "@/pages/perfil";
import NotFound from "@/pages/not-found";

setAuthTokenGetter(() => localStorage.getItem("auth_token"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, staleTime: 30_000 },
  },
});

function ProtectedRoute({
  component: Component,
  adminOnly = false,
  ...props
}: {
  component: React.ComponentType<any>;
  adminOnly?: boolean;
  params?: any;
}) {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) return <Redirect to="/login" />;
  if (adminOnly && user?.rol !== "administrador") return <Redirect to="/dashboard" />;

  return (
    <Layout>
      <Component {...props} />
    </Layout>
  );
}

function PublicOnlyRoute({ component: Component }: { component: React.ComponentType<any> }) {
  const { isAuthenticated } = useAuth();
  if (isAuthenticated) return <Redirect to="/dashboard" />;
  return <Component />;
}

function Router() {
  const { isAuthenticated } = useAuth();
  return (
    <Switch>
      {/* Public landing — redirect to dashboard if already logged in */}
      <Route path="/" component={() => isAuthenticated ? <Redirect to="/dashboard" /> : <Landing />} />

      {/* Auth pages */}
      <Route path="/login" component={() => <PublicOnlyRoute component={Login} />} />
      <Route path="/register" component={() => <PublicOnlyRoute component={Register} />} />

      {/* Protected — all roles */}
      <Route path="/dashboard" component={() => <ProtectedRoute component={Dashboard} />} />
      <Route path="/incidentes/nuevo" component={() => <ProtectedRoute component={NuevoIncidente} />} />
      <Route path="/mis-reportes" component={() => <ProtectedRoute component={MisReportes} />} />
      <Route path="/comunidad" component={() => <ProtectedRoute component={Comunidad} />} />
      <Route path="/estadisticas" component={() => <ProtectedRoute component={Estadisticas} />} />
      <Route path="/mapa" component={() => <ProtectedRoute component={Mapa} />} />
      <Route path="/zonas" component={() => <ProtectedRoute component={Zonas} />} />
      <Route path="/perfil" component={() => <ProtectedRoute component={Perfil} />} />

      {/* Protected — admin only */}
      <Route path="/incidentes/:id" component={({ params }) => <ProtectedRoute component={DetalleIncidente} adminOnly params={params} />} />
      <Route path="/incidentes" component={() => <ProtectedRoute component={Incidentes} adminOnly />} />
      <Route path="/usuarios" component={() => <ProtectedRoute component={Usuarios} adminOnly />} />

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <Router />
          </WouterRouter>
          <Toaster />
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
