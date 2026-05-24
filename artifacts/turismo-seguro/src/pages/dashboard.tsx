import { useAuth } from "@/lib/auth";
import { useGetDashboardStats, useListIncidentes, useGetZonasRiesgo } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { ShieldAlert, AlertTriangle, Users, MapPin, TrendingUp, CalendarDays } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function Dashboard() {
  const { user } = useAuth();
  const isAdmin = user?.rol === "administrador";

  const { data: stats, isLoading: statsLoading } = useGetDashboardStats();
  const { data: incidentesData, isLoading: incLoading } = useListIncidentes({ limit: 5, page: 1 });
  const { data: zonasRiesgo, isLoading: zonasLoading } = useGetZonasRiesgo();

  const statCards = isAdmin
    ? [
        { label: "Total Incidentes", value: stats?.totalIncidentes, icon: <ShieldAlert className="w-5 h-5" />, color: "text-blue-600" },
        { label: "Usuarios Registrados", value: stats?.totalUsuarios, icon: <Users className="w-5 h-5" />, color: "text-emerald-600" },
        { label: "Zonas Monitoreadas", value: stats?.totalZonas, icon: <MapPin className="w-5 h-5" />, color: "text-amber-600" },
        { label: "Incidentes Hoy", value: stats?.incidentesHoy, icon: <AlertTriangle className="w-5 h-5" />, color: "text-red-600" },
      ]
    : [
        { label: "Incidentes Totales", value: stats?.totalIncidentes, icon: <ShieldAlert className="w-5 h-5" />, color: "text-blue-600" },
        { label: "Zonas en Riesgo", value: stats?.totalZonas, icon: <MapPin className="w-5 h-5" />, color: "text-amber-600" },
        { label: "Incidentes Este Mes", value: stats?.incidentesEsteMes, icon: <CalendarDays className="w-5 h-5" />, color: "text-purple-600" },
        { label: "Reportados Hoy", value: stats?.incidentesHoy, icon: <TrendingUp className="w-5 h-5" />, color: "text-red-600" },
      ];

  const nivelColor = (nivel: string | null | undefined) => {
    if (!nivel) return "secondary";
    const l = nivel.toLowerCase();
    if (l.includes("alto") || l.includes("critico")) return "destructive";
    if (l.includes("medio")) return "default";
    return "secondary";
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          Bienvenido, {user?.nombre}
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">
          {isAdmin ? "Panel de administración — Sistema de monitoreo de incidentes turísticos" : "Panel de turista — Consulta y reporte de incidentes de seguridad"}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, i) => (
          <Card key={i} className="border-border">
            <CardContent className="p-5">
              {statsLoading ? (
                <Skeleton className="h-16 w-full" />
              ) : (
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">{card.label}</p>
                    <p className="text-3xl font-bold text-foreground mt-1">{card.value ?? 0}</p>
                  </div>
                  <div className={`${card.color} bg-current/10 p-2 rounded-lg opacity-80`}>
                    <div className={card.color}>{card.icon}</div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Incidents */}
        <Card className="border-border">
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <CardTitle className="text-base font-semibold">Incidentes Recientes</CardTitle>
            <Link href="/incidentes">
              <Button variant="ghost" size="sm" className="text-primary text-xs">Ver todos</Button>
            </Link>
          </CardHeader>
          <CardContent>
            {incLoading ? (
              <div className="space-y-3">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
            ) : incidentesData?.data?.length ? (
              <div className="space-y-3">
                {incidentesData.data.map((inc) => (
                  <div key={inc._id} data-testid={`row-incidente-${inc._id}`} className="flex items-start justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{inc.descripcion}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {inc.zonaNombre ?? "Zona no especificada"} · {inc.tipoNombre ?? "Sin tipo"} · {new Date(inc.fecha).toLocaleDateString("es-CO")}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-6">No hay incidentes registrados</p>
            )}
          </CardContent>
        </Card>

        {/* Top Risk Zones */}
        <Card className="border-border">
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <CardTitle className="text-base font-semibold">Zonas con Mayor Riesgo</CardTitle>
            <Link href="/zonas">
              <Button variant="ghost" size="sm" className="text-primary text-xs">Ver zonas</Button>
            </Link>
          </CardHeader>
          <CardContent>
            {zonasLoading ? (
              <div className="space-y-3">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}</div>
            ) : zonasRiesgo?.length ? (
              <div className="space-y-3">
                {zonasRiesgo.slice(0, 5).map((zona) => (
                  <div key={zona.zonaId} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-muted-foreground shrink-0" />
                      <span className="text-sm font-medium text-foreground">{zona.zonaNombre}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={nivelColor(zona.nivelRiesgo) as any} className="text-xs">{zona.nivelRiesgo ?? "N/A"}</Badge>
                      <span className="text-xs font-bold text-foreground">{zona.total}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-6">Sin datos de zonas</p>
            )}
          </CardContent>
        </Card>
      </div>

      {!isAdmin && (
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-foreground">¿Viviste un incidente de seguridad?</h3>
              <p className="text-sm text-muted-foreground mt-1">Reporta tu experiencia para ayudar a otros turistas</p>
            </div>
            <Link href="/incidentes/nuevo">
              <Button className="shrink-0">Reportar ahora</Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
