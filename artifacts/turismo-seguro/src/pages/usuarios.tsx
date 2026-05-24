import { useState } from "react";
import { useListUsuarios, useDeleteUsuario, useUpdateUsuario, getListUsuariosQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth";

export default function Usuarios() {
  const { user: currentUser } = useAuth();
  const { data: usuarios, isLoading } = useListUsuarios();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const deleteMutation = useDeleteUsuario();
  const updateMutation = useUpdateUsuario();
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const handleRolChange = (id: string, rol: string) => {
    updateMutation.mutate(
      { id, data: { rol: rol as "administrador" | "turista" } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListUsuariosQueryKey() });
          toast({ title: "Rol actualizado" });
        },
        onError: () => toast({ title: "Error al actualizar rol", variant: "destructive" }),
      }
    );
  };

  const handleDelete = () => {
    if (!deleteId) return;
    deleteMutation.mutate(
      { id: deleteId },
      {
        onSuccess: () => {
          setDeleteId(null);
          queryClient.invalidateQueries({ queryKey: getListUsuariosQueryKey() });
          toast({ title: "Usuario eliminado" });
        },
        onError: () => toast({ title: "Error al eliminar usuario", variant: "destructive" }),
      }
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Gestión de Usuarios</h1>
        <p className="text-muted-foreground text-sm mt-1">{usuarios?.length ?? 0} usuarios registrados</p>
      </div>

      <Card className="border-border">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-3">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-14 w-full" />)}</div>
          ) : usuarios?.length ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    <th className="text-left p-4 font-medium text-muted-foreground">Usuario</th>
                    <th className="text-left p-4 font-medium text-muted-foreground hidden sm:table-cell">Correo</th>
                    <th className="text-left p-4 font-medium text-muted-foreground">Rol</th>
                    <th className="text-left p-4 font-medium text-muted-foreground hidden md:table-cell">Registro</th>
                    <th className="text-right p-4 font-medium text-muted-foreground">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {usuarios.map((u) => (
                    <tr key={u._id} data-testid={`row-usuario-${u._id}`} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-xs shrink-0">
                            {u.nombre.charAt(0).toUpperCase()}
                          </div>
                          <span className="font-medium text-foreground">{u.nombre}</span>
                        </div>
                      </td>
                      <td className="p-4 hidden sm:table-cell text-muted-foreground">{u.correo}</td>
                      <td className="p-4">
                        {u._id === currentUser?._id ? (
                          <Badge variant={u.rol === "administrador" ? "default" : "secondary"} className="capitalize">{u.rol}</Badge>
                        ) : (
                          <Select value={u.rol} onValueChange={(val) => handleRolChange(u._id, val)}>
                            <SelectTrigger className="h-7 w-36 text-xs" data-testid={`select-rol-${u._id}`}>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="turista">Turista</SelectItem>
                              <SelectItem value="administrador">Administrador</SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                      </td>
                      <td className="p-4 hidden md:table-cell text-muted-foreground text-xs">
                        {u.fechaRegistro ? new Date(u.fechaRegistro).toLocaleDateString("es-CO") : "—"}
                      </td>
                      <td className="p-4 text-right">
                        {u._id !== currentUser?._id && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:bg-destructive/10"
                            onClick={() => setDeleteId(u._id)}
                            data-testid={`button-delete-${u._id}`}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-center py-12 text-muted-foreground">No hay usuarios registrados</p>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar usuario</AlertDialogTitle>
            <AlertDialogDescription>Esta acción no se puede deshacer. ¿Eliminar este usuario?</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Eliminar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
