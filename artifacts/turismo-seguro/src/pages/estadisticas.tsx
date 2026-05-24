import { useGetZonasRiesgo, useGetTiposFrecuentes, useGetIncidentesPorMes, useGetTopReporteros } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Cell, PieChart, Pie, Legend } from "recharts";
import { useAuth } from "@/lib/auth";

const COLORS = ["#2563eb", "#3b82f6", "#60a5fa", "#93c5fd", "#bfdbfe", "#1d4ed8", "#1e40af", "#1e3a8a", "#172554", "#dbeafe"];

export default function Estadisticas() {
  const { user } = useAuth();
  const isAdmin = user?.rol === "administrador";
  const { data: zonasRiesgo, isLoading: z1 } = useGetZonasRiesgo();
  const { data: tiposFrecuentes, isLoading: z2 } = useGetTiposFrecuentes();
  const { data: incidentesMes, isLoading: z3 } = useGetIncidentesPorMes();
  const { data: topReporteros, isLoading: z4 } = useGetTopReporteros();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Estadísticas</h1>
        <p className="text-muted-foreground text-sm mt-1">Análisis de incidentes mediante consultas aggregate de MongoDB</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Zonas con mas incidentes */}
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="text-base">Zonas con Mayor Incidencia</CardTitle>
            {isAdmin && <p className="text-xs text-muted-foreground">$match + $group + $sort + $lookup (aggregate)</p>}
          </CardHeader>
          <CardContent>
            {z1 ? <Skeleton className="h-64 w-full" /> : (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={zonasRiesgo?.slice(0, 8)} layout="vertical" margin={{ left: 8, right: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis type="number" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                  <YAxis type="category" dataKey="zonaNombre" width={110} tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                  <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }} />
                  <Bar dataKey="total" name="Incidentes" radius={[0, 4, 4, 0]}>
                    {zonasRiesgo?.slice(0, 8).map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Tipos mas frecuentes */}
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="text-base">Tipos de Incidentes Frecuentes</CardTitle>
            {isAdmin && <p className="text-xs text-muted-foreground">$group + $sort + $lookup + $project (aggregate)</p>}
          </CardHeader>
          <CardContent>
            {z2 ? <Skeleton className="h-64 w-full" /> : (
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie
                    data={tiposFrecuentes?.slice(0, 6)}
                    dataKey="total"
                    nameKey="tipoNombre"
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={3}
                  >
                    {tiposFrecuentes?.slice(0, 6).map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: 12 }}
                    formatter={(value: number, name: string) => [value, name]}
                  />
                  <Legend
                    iconType="circle"
                    iconSize={8}
                    formatter={(value) => <span style={{ fontSize: 11, color: "hsl(var(--muted-foreground))" }}>{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Incidentes por mes */}
        <Card className="border-border lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Incidentes por Mes</CardTitle>
            {isAdmin && <p className="text-xs text-muted-foreground">$group por año/mes con $year, $month (aggregate)</p>}
          </CardHeader>
          <CardContent>
            {z3 ? <Skeleton className="h-64 w-full" /> : (
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={incidentesMes} margin={{ left: 0, right: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="mes" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                  <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                  <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }} />
                  <Line type="monotone" dataKey="total" name="Incidentes" stroke="#2563eb" strokeWidth={2.5} dot={{ fill: "#2563eb", r: 4 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Top reporteros */}
        <Card className="border-border lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Usuarios con Mas Reportes</CardTitle>
            {isAdmin && <p className="text-xs text-muted-foreground">$group + $lookup + $sort (aggregate)</p>}
          </CardHeader>
          <CardContent>
            {z4 ? <Skeleton className="h-32 w-full" /> : topReporteros?.length ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left p-3 font-medium text-muted-foreground">#</th>
                      <th className="text-left p-3 font-medium text-muted-foreground">Usuario</th>
                      {isAdmin && <th className="text-left p-3 font-medium text-muted-foreground">Correo</th>}
                      <th className="text-right p-3 font-medium text-muted-foreground">Reportes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topReporteros.map((rep, i) => (
                      <tr key={rep.usuarioId} data-testid={`row-reportero-${rep.usuarioId}`} className="border-b border-border last:border-0 hover:bg-muted/30">
                        <td className="p-3 text-muted-foreground font-mono text-xs">{i + 1}</td>
                        <td className="p-3 font-medium text-foreground">{rep.usuarioNombre}</td>
                        {isAdmin && <td className="p-3 text-muted-foreground">{rep.correo ?? "—"}</td>}
                        <td className="p-3 text-right font-bold text-primary">{rep.total}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-muted-foreground text-sm text-center py-6">Sin datos disponibles</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
