import { useAuth } from "@/lib/auth";
import { Link, useLocation } from "wouter";
import {
  ShieldAlert,
  LayoutDashboard,
  FileText,
  MapPin,
  Users,
  BarChart3,
  LogOut,
  UserCircle,
  Menu,
  FilePlus2,
  Globe,
  Map,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export function Layout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const [location, setLocation] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setLocation("/");
  };

  const adminLinks = [
    { href: "/dashboard", label: "Dashboard", icon: <LayoutDashboard className="w-5 h-5 mr-3" /> },
    { href: "/incidentes", label: "Incidentes", icon: <FileText className="w-5 h-5 mr-3" /> },
    { href: "/comunidad", label: "Comunidad", icon: <Globe className="w-5 h-5 mr-3" /> },
    { href: "/estadisticas", label: "Estadísticas", icon: <BarChart3 className="w-5 h-5 mr-3" /> },
    { href: "/mapa", label: "Mapa", icon: <Map className="w-5 h-5 mr-3" /> },
    { href: "/zonas", label: "Zonas", icon: <MapPin className="w-5 h-5 mr-3" /> },
    { href: "/usuarios", label: "Usuarios", icon: <Users className="w-5 h-5 mr-3" /> },
    { href: "/perfil", label: "Mi Perfil", icon: <UserCircle className="w-5 h-5 mr-3" /> },
  ];

  const turistaLinks = [
    { href: "/dashboard", label: "Dashboard", icon: <LayoutDashboard className="w-5 h-5 mr-3" /> },
    { href: "/incidentes/nuevo", label: "Reportar Incidente", icon: <FilePlus2 className="w-5 h-5 mr-3" /> },
    { href: "/mis-reportes", label: "Mis Reportes", icon: <FileText className="w-5 h-5 mr-3" /> },
    { href: "/comunidad", label: "Comunidad", icon: <Globe className="w-5 h-5 mr-3" /> },
    { href: "/estadisticas", label: "Estadísticas", icon: <BarChart3 className="w-5 h-5 mr-3" /> },
    { href: "/mapa", label: "Mapa", icon: <Map className="w-5 h-5 mr-3" /> },
    { href: "/zonas", label: "Zonas", icon: <MapPin className="w-5 h-5 mr-3" /> },
    { href: "/perfil", label: "Mi Perfil", icon: <UserCircle className="w-5 h-5 mr-3" /> },
  ];

  const links = user?.rol === "administrador" ? adminLinks : turistaLinks;

  const NavLinks = () => (
    <div className="flex flex-col gap-1 p-3">
      {links.map((link) => {
        const isActive =
          location === link.href ||
          (link.href !== "/dashboard" &&
            link.href !== "/incidentes/nuevo" &&
            location.startsWith(link.href));
        return (
          <Link key={link.href} href={link.href} className="w-full">
            <Button
              variant={isActive ? "secondary" : "ghost"}
              className={`w-full justify-start text-sm ${
                isActive
                  ? "bg-primary/10 text-primary hover:bg-primary/20 font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {link.icon}
              {link.label}
            </Button>
          </Link>
        );
      })}
    </div>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-60 flex-col bg-card border-r border-border shadow-sm">
        <div className="p-5 border-b border-border flex items-center gap-3">
          <div className="bg-primary/10 p-2 rounded-lg text-primary">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-bold text-base leading-tight text-foreground tracking-tight">
              Turismo Seguro
            </h1>
            <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
              Cartagena
            </p>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          <NavLinks />
        </div>
        <div className="p-4 border-t border-border">
          <div className="flex items-center gap-3 mb-3 px-1">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-sm">
              {user?.nombre?.charAt(0).toUpperCase() || "U"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{user?.nombre}</p>
              <p className="text-xs text-muted-foreground capitalize">{user?.rol}</p>
            </div>
          </div>
          <Button
            variant="outline"
            className="w-full justify-start text-destructive hover:bg-destructive/10 hover:text-destructive border-destructive/20 text-sm"
            onClick={handleLogout}
          >
            <LogOut className="w-4 h-4 mr-2" />
            Cerrar Sesión
          </Button>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="flex-1 flex flex-col w-full min-w-0">
        <header className="md:hidden flex items-center justify-between p-4 border-b bg-card">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-primary" />
            <h1 className="font-bold text-base text-foreground">Turismo Seguro</h1>
          </div>
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="w-5 h-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 flex flex-col w-64">
              <div className="p-5 border-b border-border flex items-center gap-3 bg-card">
                <div className="bg-primary/10 p-2 rounded-lg text-primary">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div>
                  <h1 className="font-bold text-base leading-tight text-foreground">Turismo Seguro</h1>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Cartagena</p>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto">
                <NavLinks />
              </div>
              <div className="p-4 border-t border-border bg-card">
                <Button
                  variant="outline"
                  className="w-full justify-start text-destructive text-sm"
                  onClick={handleLogout}
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Cerrar Sesión
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto bg-background/50 p-4 md:p-8">
          <div className="mx-auto max-w-6xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
