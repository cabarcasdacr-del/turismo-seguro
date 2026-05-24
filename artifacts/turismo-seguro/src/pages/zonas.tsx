import { useListZonas } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { MapPin } from "lucide-react";

export default function Zonas() {
  const { data: zonas, isLoading } = useListZonas();

  const nivelColor = (nivel: string | null | undefined) => {
    if (!nivel) return "secondary";
    const l = nivel.toLowerCase();
    if (l.includes("alto") || l.includes("critico") || l.includes("crítico")) return "destructive";
    if (l.includes("medio")) return "default";
    return "secondary";
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Zonas Turísticas</h1>
        <p className="text-muted-foreground text-sm mt-1">Información de seguridad en las principales zonas turísticas de Cartagena</p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-32 w-full" />)}
        </div>
      ) : zonas?.length ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {zonas.map((zona) => (
            <Card key={zona._id} data-testid={`card-zona-${zona._id}`} className="border-border hover:shadow-md transition-shadow">
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="bg-primary/10 text-primary p-2 rounded-lg">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <Badge variant={nivelColor(zona.nivelRiesgo) as any} className="shrink-0">
                    {zona.nivelRiesgo ?? "Sin clasificar"}
                  </Badge>
                </div>
                <h3 className="font-semibold text-foreground leading-tight">{zona.nombre}</h3>
                <p className="text-sm text-muted-foreground mt-1">{zona.ciudad ?? "Cartagena"}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="border-border">
          <CardContent className="py-16 text-center">
            <MapPin className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground font-medium">No hay zonas registradas</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
