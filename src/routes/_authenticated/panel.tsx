import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { AlertTriangle, Boxes, CheckCircle2, Cpu, TrendingUp, Wrench } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarrasMensuales, fechaCierre } from "@/components/BarrasMensuales";
import {
  CLASE_ESTADO,
  ESTADOS_EN_PROCESO,
  ESTADOS_PENDIENTE_ENTREGA,
  ETIQUETA_ESTADO,
  formatoFecha,
  type Estado,
} from "@/lib/estados";

export const Route = createFileRoute("/_authenticated/panel")({
  head: () => ({
    meta: [
      { title: "Panel gerencial · ECUTech" },
      {
        name: "description",
        content: "Indicadores de reparaciones, unidades no reparadas, modelos e inventario de ECUs.",
      },
      { property: "og:title", content: "Panel gerencial · ECUTech" },
      {
        property: "og:description",
        content: "Indicadores en tiempo real del taller de reparación de ECUs.",
      },
    ],
  }),
  component: Panel,
});

type Registro = {
  id: string;
  folio: string;
  modelo: string;
  estado: Estado;
  fecha_ingreso: string;
  fecha_entrega: string | null;
  para_venta: boolean;
  updated_at: string;
  clientes: { nombre: string } | null;
};

function inicioDe(unidad: "dia" | "mes" | "anio") {
  const d = new Date();
  if (unidad === "dia") return new Date(d.getFullYear(), d.getMonth(), d.getDate());
  if (unidad === "mes") return new Date(d.getFullYear(), d.getMonth(), 1);
  return new Date(d.getFullYear(), 0, 1);
}

function top3(registros: Registro[], estados: Estado[]) {
  const conteo = new Map<string, number>();
  registros
    .filter((r) => estados.includes(r.estado))
    .forEach((r) => conteo.set(r.modelo, (conteo.get(r.modelo) ?? 0) + 1));
  return [...conteo.entries()].sort((a, b) => b[1] - a[1]).slice(0, 3);
}

function Panel() {
  const { data: registros = [], isLoading } = useQuery({
    queryKey: ["registros-panel"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("registros_ecu")
        .select("id, folio, modelo, estado, fecha_ingreso, fecha_entrega, para_venta, updated_at, clientes(nombre)")
        .order("updated_at", { ascending: false });
      if (error) throw error;
      return data as unknown as Registro[];
    },
  });

  const reparadas = registros.filter((r) => r.estado === "reparada" || r.estado === "pendiente_entrega" || r.estado === "completada");
  const noReparadas = registros.filter((r) => r.estado === "no_reparada" || r.estado === "no_reparable");

  const cuenta = (lista: Registro[], desde: Date) =>
    lista.filter((r) => new Date(fechaCierre(r)) >= desde).length;

  const kpis = [
    { label: "Reparaciones del día", valor: cuenta(reparadas, inicioDe("dia")), icon: CheckCircle2, tono: "text-success" },
    { label: "Reparaciones del mes", valor: cuenta(reparadas, inicioDe("mes")), icon: TrendingUp, tono: "text-primary" },
    { label: "Reparaciones del año", valor: cuenta(reparadas, inicioDe("anio")), icon: Wrench, tono: "text-accent" },
    { label: "No reparadas (mes)", valor: cuenta(noReparadas, inicioDe("mes")), icon: AlertTriangle, tono: "text-destructive" },
    { label: "No reparadas (año)", valor: cuenta(noReparadas, inicioDe("anio")), icon: AlertTriangle, tono: "text-destructive" },
    { label: "En proceso", valor: registros.filter((r) => ESTADOS_EN_PROCESO.includes(r.estado)).length, icon: Cpu, tono: "text-warning" },
  ];

  const inventario = [
    { label: "Disponibles para venta", valor: registros.filter((r) => r.para_venta && r.estado !== "completada").length },
    { label: "En reparación", valor: registros.filter((r) => ESTADOS_EN_PROCESO.includes(r.estado)).length },
    { label: "Pendientes de entrega", valor: registros.filter((r) => ESTADOS_PENDIENTE_ENTREGA.includes(r.estado)).length },
    { label: "Entregadas", valor: registros.filter((r) => r.estado === "completada").length },
  ];

  const topReparados = top3(registros, ["reparada", "pendiente_entrega", "completada"]);
  const topFallidos = top3(registros, ["no_reparada", "no_reparable"]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold">Panel gerencial</h1>
        <p className="text-sm text-muted-foreground">
          Indicadores del taller en tiempo real.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {kpis.map((k) => (
          <Card key={k.label}>
            <CardContent className="flex items-center justify-between p-5">
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">{k.label}</p>
                <p className="mt-1 font-display text-3xl font-semibold">
                  {isLoading ? "—" : k.valor}
                </p>
              </div>
              <k.icon className={`size-8 ${k.tono}`} />
            </CardContent>
          </Card>
        ))}
      </div>

      <BarrasMensuales registros={registros} />


      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader className="flex-row items-center gap-2">
            <Boxes className="size-4 text-primary" />
            <CardTitle className="text-base">Inventario</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {inventario.map((i) => (
              <div key={i.label} className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{i.label}</span>
                <span className="font-display text-lg font-semibold">{i.valor}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Top 3 modelos más reparados</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {topReparados.length === 0 && (
              <p className="text-sm text-muted-foreground">Sin datos todavía.</p>
            )}
            {topReparados.map(([modelo, total], i) => (
              <div key={modelo} className="flex items-center justify-between text-sm">
                <span>
                  <span className="mr-2 text-muted-foreground">{i + 1}.</span>
                  {modelo}
                </span>
                <Badge variant="outline" className="border-success/40 text-success">
                  {total}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Top 3 modelos con más fallas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {topFallidos.length === 0 && (
              <p className="text-sm text-muted-foreground">Sin datos todavía.</p>
            )}
            {topFallidos.map(([modelo, total], i) => (
              <div key={modelo} className="flex items-center justify-between text-sm">
                <span>
                  <span className="mr-2 text-muted-foreground">{i + 1}.</span>
                  {modelo}
                </span>
                <Badge variant="outline" className="border-destructive/40 text-destructive">
                  {total}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Movimientos recientes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {registros.slice(0, 8).map((r) => (
            <Link
              key={r.id}
              to="/ecus/$id"
              params={{ id: r.id }}
              className="flex flex-wrap items-center gap-3 rounded-md border border-border px-3 py-2 text-sm transition-colors hover:bg-secondary"
            >
              <span className="font-mono text-primary">{r.folio}</span>
              <span className="text-muted-foreground">{r.clientes?.nombre ?? "Sin cliente"}</span>
              <span>{r.modelo}</span>
              <Badge variant="outline" className={`ml-auto ${CLASE_ESTADO[r.estado]}`}>
                {ETIQUETA_ESTADO[r.estado]}
              </Badge>
              <span className="text-xs text-muted-foreground">{formatoFecha(r.updated_at)}</span>
            </Link>
          ))}
          {!isLoading && registros.length === 0 && (
            <p className="text-sm text-muted-foreground">
              Aún no hay ECUs registradas. Comienza en la pantalla de Recepción.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
