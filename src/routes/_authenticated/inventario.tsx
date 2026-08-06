import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  CLASE_ESTADO,
  ESTADOS_EN_PROCESO,
  ESTADOS_PENDIENTE_ENTREGA,
  ETIQUETA_ESTADO,
  type Estado,
} from "@/lib/estados";

export const Route = createFileRoute("/_authenticated/inventario")({
  head: () => ({
    meta: [
      { title: "Inventario de ECUs · ECUTech" },
      {
        name: "description",
        content: "Existencias del taller: unidades en reparación, pendientes de entrega y disponibles para venta.",
      },
      { property: "og:title", content: "Inventario de ECUs · ECUTech" },
      {
        property: "og:description",
        content: "Control de existencias por modelo y estado en el taller de ECUs.",
      },
    ],
  }),
  component: Inventario,
});

type Fila = { id: string; folio: string; modelo: string; estado: Estado; para_venta: boolean };

function Inventario() {
  const { data: registros = [] } = useQuery({
    queryKey: ["inventario"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("registros_ecu")
        .select("id, folio, modelo, estado, para_venta")
        .order("modelo");
      if (error) throw error;
      return data as Fila[];
    },
  });

  const grupos = [
    { titulo: "En reparación", filas: registros.filter((r) => ESTADOS_EN_PROCESO.includes(r.estado)) },
    { titulo: "Pendientes de entrega", filas: registros.filter((r) => ESTADOS_PENDIENTE_ENTREGA.includes(r.estado)) },
    { titulo: "Disponibles para venta", filas: registros.filter((r) => r.para_venta && r.estado !== "completada") },
    { titulo: "Entregadas", filas: registros.filter((r) => r.estado === "completada") },
  ];

  const porModelo = new Map<string, number>();
  registros.forEach((r) => porModelo.set(r.modelo, (porModelo.get(r.modelo) ?? 0) + 1));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold">Inventario</h1>
        <p className="text-sm text-muted-foreground">
          {registros.length} unidades en total dentro del taller.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {grupos.map((g) => (
          <Card key={g.titulo}>
            <CardContent className="p-5">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">{g.titulo}</p>
              <p className="mt-1 font-display text-3xl font-semibold">{g.filas.length}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Existencias por modelo</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {porModelo.size === 0 && (
            <p className="text-sm text-muted-foreground">Sin unidades registradas.</p>
          )}
          {[...porModelo.entries()].map(([modelo, total]) => (
            <div key={modelo} className="flex items-center justify-between rounded-md border border-border px-3 py-2 text-sm">
              <span>{modelo}</span>
              <Badge variant="outline">{total}</Badge>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Detalle por unidad</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {registros.map((r) => (
            <div key={r.id} className="flex flex-wrap items-center gap-3 rounded-md border border-border px-3 py-2 text-sm">
              <span className="font-mono text-primary">{r.folio}</span>
              <span>{r.modelo}</span>
              {r.para_venta && (
                <Badge variant="outline" className="border-accent/40 text-accent">
                  Venta
                </Badge>
              )}
              <Badge variant="outline" className={`ml-auto ${CLASE_ESTADO[r.estado]}`}>
                {ETIQUETA_ESTADO[r.estado]}
              </Badge>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
