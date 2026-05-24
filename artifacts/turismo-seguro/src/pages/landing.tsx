import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ShieldAlert, MapPin, BarChart3, Users, AlertTriangle, CheckCircle, Eye, FileText } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 p-2 rounded-xl text-primary">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-foreground text-lg leading-none">Turismo Seguro</span>
              <span className="text-xs text-muted-foreground block uppercase tracking-widest font-semibold">Cartagena</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" size="sm">Iniciar Sesión</Button>
            </Link>
            <Link href="/register">
              <Button size="sm">Registrarse</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="flex-1 flex flex-col items-center justify-center text-center px-6 py-24 bg-gradient-to-b from-primary/5 via-background to-background">
        <div className="inline-flex items-center gap-2 bg-primary/10 text-primary rounded-full px-4 py-1.5 text-sm font-medium mb-6">
          <CheckCircle className="w-4 h-4" />
          Sistema oficial de monitoreo turístico
        </div>
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground tracking-tight max-w-3xl leading-tight">
          Tu seguridad en{" "}
          <span className="text-primary">Cartagena</span>{" "}
          es nuestra prioridad
        </h1>
        <p className="mt-6 text-lg text-muted-foreground max-w-2xl leading-relaxed">
          Plataforma ciudadana para reportar, consultar y monitorear incidentes de seguridad en las zonas turísticas de Cartagena de Indias. Juntos construimos una ciudad más segura.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 mt-10">
          <Link href="/register">
            <Button size="lg" className="px-8 text-base">Ingresar al sistema</Button>
          </Link>
          <Link href="/login">
            <Button size="lg" variant="outline" className="px-8 text-base">Ya tengo cuenta</Button>
          </Link>
        </div>
        {/* Stats row */}
        <div className="grid grid-cols-3 gap-8 mt-16 max-w-lg">
          <div>
            <p className="text-3xl font-bold text-foreground">1,017</p>
            <p className="text-sm text-muted-foreground mt-1">Incidentes registrados</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-foreground">5</p>
            <p className="text-sm text-muted-foreground mt-1">Zonas monitoreadas</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-foreground">1,038</p>
            <p className="text-sm text-muted-foreground mt-1">Usuarios activos</p>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-foreground mb-4">¿Qué puedes hacer?</h2>
          <p className="text-center text-muted-foreground mb-12 max-w-xl mx-auto">
            Una plataforma completa para turistas y administradores de seguridad turística
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: <FileText className="w-6 h-6" />,
                title: "Reportar Incidentes",
                desc: "Documenta en tiempo real cualquier situación de inseguridad que hayas vivido en tu visita.",
                color: "text-blue-600 bg-blue-50",
              },
              {
                icon: <Eye className="w-6 h-6" />,
                title: "Ver Reportes",
                desc: "Consulta los incidentes de la comunidad y mantente informado sobre la seguridad en cada zona.",
                color: "text-emerald-600 bg-emerald-50",
              },
              {
                icon: <MapPin className="w-6 h-6" />,
                title: "Mapa Interactivo",
                desc: "Visualiza los incidentes sobre un mapa de Cartagena con filtros por zona y tipo.",
                color: "text-amber-600 bg-amber-50",
              },
              {
                icon: <BarChart3 className="w-6 h-6" />,
                title: "Estadísticas",
                desc: "Accede a análisis detallados con gráficas sobre tendencias y zonas de mayor riesgo.",
                color: "text-purple-600 bg-purple-50",
              },
            ].map((f) => (
              <div key={f.title} className="bg-card border border-border rounded-2xl p-6 hover:shadow-md transition-shadow">
                <div className={`inline-flex p-3 rounded-xl ${f.color} mb-4`}>{f.icon}</div>
                <h3 className="font-semibold text-foreground mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Zones section */}
      <section className="py-20 px-6 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-foreground mb-4">Zonas Turísticas Monitoreadas</h2>
          <p className="text-center text-muted-foreground mb-12">Cobertura completa en los principales puntos turísticos de Cartagena</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {[
              { nombre: "Centro Histórico", nivel: "Alto", color: "bg-red-100 text-red-700 border-red-200" },
              { nombre: "Bocagrande", nivel: "Medio", color: "bg-amber-100 text-amber-700 border-amber-200" },
              { nombre: "Getsemaní", nivel: "Alto", color: "bg-red-100 text-red-700 border-red-200" },
              { nombre: "La Boquilla", nivel: "Bajo", color: "bg-green-100 text-green-700 border-green-200" },
              { nombre: "Pie del Cerro", nivel: "Medio", color: "bg-amber-100 text-amber-700 border-amber-200" },
            ].map((z) => (
              <div key={z.nombre} className="bg-card border border-border rounded-xl p-4 text-center hover:shadow-sm transition-shadow">
                <div className="bg-primary/10 text-primary p-2.5 rounded-lg w-fit mx-auto mb-3">
                  <MapPin className="w-4 h-4" />
                </div>
                <p className="font-medium text-foreground text-sm">{z.nombre}</p>
                <span className={`inline-block mt-2 text-xs font-semibold px-2 py-0.5 rounded-full border ${z.color}`}>{z.nivel}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <div className="bg-primary/5 border border-primary/20 rounded-3xl p-10">
            <AlertTriangle className="w-10 h-10 text-primary mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-foreground mb-3">¿Viviste un incidente de seguridad?</h2>
            <p className="text-muted-foreground mb-6">Tu reporte ayuda a proteger a otros turistas. Regístrate gratis y contribuye a la comunidad.</p>
            <Link href="/register">
              <Button size="lg" className="px-10">Registrarse gratis</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card py-8 px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-muted-foreground">
            <ShieldAlert className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium">Turismo Seguro Cartagena</span>
          </div>
          <p className="text-xs text-muted-foreground">Sistema de monitoreo de seguridad turística · Universidad · 2025</p>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <Link href="/login" className="hover:text-primary transition-colors">Iniciar sesión</Link>
            <Link href="/register" className="hover:text-primary transition-colors">Registrarse</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
