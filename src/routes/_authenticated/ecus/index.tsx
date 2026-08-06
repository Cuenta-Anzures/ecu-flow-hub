import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Car, Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { CLASE_ESTADO, ESTADOS, ETIQUETA_ESTADO, formatoFecha, type Estado } from "@/lib/estados";

export const Route = createFileRoute("/_authenticated/ecus/")({
  head: () => ({
    meta: [
      { title: "Tablero de ECUs · ECUTech" },
      {
        name: "description",
        content: "Seguimiento de todas las ECUs del taller por estado, folio, cliente y modelo.",
      },
      { property: "og:title", content: "Tablero de ECUs · ECUTech" },
      {
        property: "og:description",
        content: "Consulta el estado de cada ECU en reparación dentro del taller.",
      },
    ],
  }),
  component: ListaEcus,
});

type Registro = {
  id: string;
  folio: string;
  modelo: string;
  estado: Estado;
  fecha_ingreso: string;
  para_venta: boolean;
  numero_parte: string | null;
  marca_vehiculo: string | null;
  modelo_vehiculo: string | null;
  anio_vehiculo: number | null;
  clientes: { nombre: string; numero_cliente: string; telefono: string } | null;
};

function ListaEcus() {
  const [texto, setTexto] = useState("");
  const [filtro, setFiltro] = useState<Estado | "todos">("todos");

  const { data: registros = [], isLoading } = useQuery({
    queryKey: ["registros"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("registros_ecu")
        .select(
          "id, folio, modelo, estado, fecha_ingreso, para_venta, numero_parte, marca_vehiculo, modelo_vehiculo, anio_vehiculo, clientes(nombre, numero_cliente, telefono)",
        )
        .order("fecha_ingreso", { ascending: false });
      if (error) throw error;
      return data as unknown as Registro[];
    },
  });

  const t = texto.trim().toLowerCase();
  const visibles = registros.filter((r) => {
    const coincide =
      !t ||
      r.folio.toLowerCase().includes(t) ||
      r.modelo.toLowerCase().includes(t) ||
      (r.numero_parte ?? "").toLowerCase().includes(t) ||
      (r.marca_vehiculo ?? "").toLowerCase().includes(t) ||
      (r.modelo_vehiculo ?? "").toLowerCase().includes(t) ||
      (r.clientes?.nombre ?? "").toLowerCase().includes(t) ||
      (r.clientes?.telefono ?? "").toLowerCase().includes(t);
    return coincide && (filtro === "todos" || r.estado === filtro);
  });

  const conteo = (e: Estado) => registros.filter((r) => r.estado === e).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold">Tablero de ECUs</h1>
          <p className="text-sm text-muted-foreground">
            {registros.length} unidades registradas · {visibles.length} en la vista actual.
          </p>
        </div>
        <div className="relative w-full sm:w-80">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Folio, cliente, teléfono, modelo, vehículo o No. de parte"
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setFiltro("todos")}
          className={cn(
            "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
            filtro === "todos"
              ? "border-primary/50 bg-primary/15 text-primary"
              : "border-border text-muted-foreground hover:bg-secondary",
          )}
        >
          Todos <span className="ml-1 opacity-70">{registros.length}</span>
        </button>
        {ESTADOS.map((e) => (
          <button
            key={e}
            type="button"
            onClick={() => setFiltro(e)}
            className={cn(
              "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
              filtro === e
                ? "border-primary/50 bg-primary/15 text-primary"
                : "border-border text-muted-foreground hover:bg-secondary",
            )}
          >
            {ETIQUETA_ESTADO[e]} <span className="ml-1 opacity-70">{conteo(e)}</span>
          </button>
        ))}
      </div>

      {isLoading && <p className="text-sm text-muted-foreground">Cargando unidades…</p>}

      {!isLoading && visibles.length === 0 && (
        <Card>
          <CardContent className="p-6 text-center text-sm text-muted-foreground">
            No hay ECUs que coincidan con el filtro.
          </CardContent>
        </Card>
      )}

      {visibles.length > 0 && (
        <div className="overflow-hidden rounded-lg border border-border bg-card">
          <div className="hidden grid-cols-12 gap-3 border-b border-border bg-secondary/40 px-4 py-2.5 text-xs uppercase tracking-wide text-muted-foreground md:grid">
            <span className="col-span-2">Folio</span>
            <span className="col-span-3">Cliente</span>
            <span className="col-span-3">ECU / Vehículo</span>
            <span className="col-span-2">Ingreso</span>
            <span className="col-span-2 text-right">Estado</span>
          </div>
          <div className="divide-y divide-border">
            {visibles.map((r) => (
              <Link
                key={r.id}
                to="/ecus/$id"
                params={{ id: r.id }}
                className="grid grid-cols-1 gap-2 px-4 py-3 text-sm transition-colors hover:bg-secondary/50 md:grid-cols-12 md:items-center md:gap-3"
              >
                <div className="md:col-span-2">
                  <span className="font-mono text-primary">{r.folio}</span>
                  {r.para_venta && (
                    <Badge variant="outline" className="ml-2 border-accent/40 text-accent">
                      Venta
                    </Badge>
                  )}
                </div>
                <div className="md:col-span-3">
                  <p className="truncate font-medium">{r.clientes?.nombre ?? "Sin cliente"}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {r.clientes?.telefono ?? "—"}
                  </p>
                </div>
                <div className="md:col-span-3">
                  <p className="truncate">{r.modelo}</p>
                  <p className="flex items-center gap-1 truncate text-xs text-muted-foreground">
                    <Car className="size-3" />
                    {[r.marca_vehiculo, r.modelo_vehiculo, r.anio_vehiculo]
                      .filter(Boolean)
                      .join(" ") || "Vehículo sin datos"}
                  </p>
                </div>
                <div className="text-xs text-muted-foreground md:col-span-2">
                  {formatoFecha(r.fecha_ingreso)}
                </div>
                <div className="md:col-span-2 md:text-right">
                  <Badge variant="outline" className={CLASE_ESTADO[r.estado]}>
                    {ETIQUETA_ESTADO[r.estado]}
                  </Badge>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
