import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { ArrowLeft, History, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useSesion } from "@/hooks/useSesion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CLASE_ESTADO, ESTADOS, ETIQUETA_ESTADO, formatoFecha, type Estado } from "@/lib/estados";

export const Route = createFileRoute("/_authenticated/ecus/$id")({
  head: () => ({
    meta: [
      { title: "Detalle de ECU · ECUTech" },
      {
        name: "description",
        content: "Ficha completa de la ECU: datos de ingreso, diagnóstico técnico y bitácora de estados.",
      },
      { property: "og:title", content: "Detalle de ECU · ECUTech" },
      {
        property: "og:description",
        content: "Historial inmutable y diagnóstico de la unidad en reparación.",
      },
    ],
  }),
  component: DetalleEcu,
});

function DetalleEcu() {
  const { id } = Route.useParams();
  const queryClient = useQueryClient();
  const { usuarioId } = useSesion();
  const [nuevoEstado, setNuevoEstado] = useState<Estado | "">("");
  const [nota, setNota] = useState("");
  const [diagnostico, setDiagnostico] = useState("");
  const [trabajo, setTrabajo] = useState("");

  const { data: registro, isLoading } = useQuery({
    queryKey: ["registro", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("registros_ecu")
        .select("*, clientes(id, nombre, numero_cliente, telefono, empresa)")
        .eq("id", id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const { data: historial = [] } = useQuery({
    queryKey: ["historial", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("historial_estados")
        .select("id, estado_anterior, estado_nuevo, motivo, created_at")
        .eq("registro_id", id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const cambiar = useMutation({
    mutationFn: async () => {
      if (!nuevoEstado) throw new Error("Selecciona un estado");
      const { error } = await supabase
        .from("registros_ecu")
        .update({
          estado: nuevoEstado,
          ...(nuevoEstado === "completada" ? { fecha_entrega: new Date().toISOString() } : {}),
        })
        .eq("id", id);
      if (error) throw error;
      if (nota.trim()) {
        const { data: ultimo } = await supabase
          .from("historial_estados")
          .select("id")
          .eq("registro_id", id)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();
        if (ultimo) {
          await supabase
            .from("historial_estados")
            .update({ motivo: nota.trim() })
            .eq("id", ultimo.id);
        }
      }
    },
    onSuccess: () => {
      setNota("");
      setNuevoEstado("");
      queryClient.invalidateQueries();
      toast.success("Estado actualizado");
    },
    onError: (e: Error) => toast.error("No se pudo actualizar", { description: e.message }),
  });

  const guardarDiagnostico = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("diagnosticos").insert({
        registro_id: id,
        tecnico_id: usuarioId,
        diagnostico: diagnostico || null,
        reparaciones_realizadas: trabajo || null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      setDiagnostico("");
      setTrabajo("");
      queryClient.invalidateQueries();
      toast.success("Diagnóstico guardado");
    },
    onError: (e: Error) => toast.error("No se pudo guardar", { description: e.message }),
  });

  const { data: diagnosticos = [] } = useQuery({
    queryKey: ["diagnosticos", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("diagnosticos")
        .select("id, diagnostico, reparaciones_realizadas, created_at")
        .eq("registro_id", id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  if (isLoading) return <p className="text-sm text-muted-foreground">Cargando ficha…</p>;
  if (!registro) return <p className="text-sm text-muted-foreground">Unidad no encontrada.</p>;

  const cliente = registro.clientes as unknown as {
    id: string;
    nombre: string;
    numero_cliente: string;
    telefono: string;
    empresa: string | null;
  } | null;

  const datos: Array<[string, string]> = [
    ["Modelo de ECU", registro.modelo],
    ["Año de ECU", registro.anio ? String(registro.anio) : "—"],
    ["Número de parte", registro.numero_parte ?? "—"],
    [
      "Vehículo",
      [registro.marca_vehiculo, registro.modelo_vehiculo, registro.anio_vehiculo]
        .filter(Boolean)
        .join(" ") || "—",
    ],
    ["Motivo de visita", registro.motivo_visita ?? "—"],
    ["Falla reportada", registro.falla_reportada ?? "—"],
    ["Observaciones", registro.observaciones ?? "—"],
    ["Ingreso", formatoFecha(registro.fecha_ingreso)],
    ["Entrega", formatoFecha(registro.fecha_entrega)],
  ];

  return (
    <div className="space-y-6">
      <Link to="/ecus" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" />
        Volver al tablero
      </Link>

      <div className="flex flex-wrap items-center gap-3">
        <h1 className="font-display text-2xl font-semibold">
          <span className="font-mono text-primary">{registro.folio}</span> · {registro.modelo}
        </h1>
        <Badge variant="outline" className={CLASE_ESTADO[registro.estado as Estado]}>
          {ETIQUETA_ESTADO[registro.estado as Estado]}
        </Badge>
        {registro.para_venta && (
          <Badge variant="outline" className="border-accent/40 text-accent">
            Para venta
          </Badge>
        )}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Datos de la unidad</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2">
            {datos.map(([k, v]) => (
              <div key={k}>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">{k}</p>
                <p className="text-sm">{v}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Cliente</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 text-sm">
            <p className="font-medium">{cliente?.nombre ?? "Sin cliente"}</p>
            <p className="font-mono text-xs text-muted-foreground">{cliente?.numero_cliente}</p>
            <p className="text-muted-foreground">{cliente?.telefono}</p>
            {cliente?.empresa && <p className="text-muted-foreground">{cliente.empresa}</p>}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Actualizar estado</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <Label>Nuevo estado</Label>
              <Select value={nuevoEstado} onValueChange={(v) => setNuevoEstado(v as Estado)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un estado" />
                </SelectTrigger>
                <SelectContent>
                  {ESTADOS.filter((e) => e !== registro.estado).map((e) => (
                    <SelectItem key={e} value={e}>
                      {ETIQUETA_ESTADO[e]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="nota">Nota del cambio</Label>
              <Textarea
                id="nota"
                maxLength={500}
                value={nota}
                onChange={(e) => setNota(e.target.value)}
                placeholder="Motivo, resultado de prueba, técnico asignado…"
              />
            </div>
            <Button onClick={() => cambiar.mutate()} disabled={cambiar.isPending || !nuevoEstado}>
              {cambiar.isPending && <Loader2 className="size-4 animate-spin" />}
              Guardar cambio
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Diagnóstico técnico</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="hallazgos">Hallazgos</Label>
              <Textarea
                id="hallazgos"
                maxLength={2000}
                value={diagnostico}
                onChange={(e) => setDiagnostico(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="trabajo">Trabajo realizado</Label>
              <Textarea
                id="trabajo"
                maxLength={2000}
                value={trabajo}
                onChange={(e) => setTrabajo(e.target.value)}
              />
            </div>
            <Button
              variant="outline"
              onClick={() => guardarDiagnostico.mutate()}
              disabled={guardarDiagnostico.isPending || (!diagnostico && !trabajo)}
            >
              {guardarDiagnostico.isPending && <Loader2 className="size-4 animate-spin" />}
              Agregar diagnóstico
            </Button>

            <div className="space-y-2 pt-2">
              {diagnosticos.map((d) => (
                <div key={d.id} className="rounded-md border border-border p-3 text-sm">
                  <p className="text-xs text-muted-foreground">{formatoFecha(d.created_at)}</p>
                  {d.diagnostico && <p className="mt-1">{d.diagnostico}</p>}
                  {d.reparaciones_realizadas && (
                    <p className="mt-1 text-muted-foreground">{d.reparaciones_realizadas}</p>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex-row items-center gap-2">
          <History className="size-4 text-primary" />
          <CardTitle className="text-base">Bitácora de estados</CardTitle>
        </CardHeader>
        <CardContent>
          {historial.length === 0 && (
            <p className="text-sm text-muted-foreground">Sin movimientos registrados.</p>
          )}
          <ol className="relative space-y-5 border-l border-border pl-6">
            {[...historial].reverse().map((h, i, arr) => (
              <li key={h.id} className="relative">
                <span
                  className={`absolute -left-[31px] top-1 flex size-3 items-center justify-center rounded-full ring-4 ring-background ${
                    i === arr.length - 1 ? "bg-primary" : "bg-border"
                  }`}
                />
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="outline" className={CLASE_ESTADO[h.estado_nuevo as Estado]}>
                    {ETIQUETA_ESTADO[h.estado_nuevo as Estado]}
                  </Badge>
                  {h.estado_anterior && (
                    <span className="text-xs text-muted-foreground">
                      desde {ETIQUETA_ESTADO[h.estado_anterior as Estado]}
                    </span>
                  )}
                  <span className="ml-auto text-xs text-muted-foreground">
                    {formatoFecha(h.created_at)}
                  </span>
                </div>
                {h.motivo && <p className="mt-1 text-sm text-muted-foreground">{h.motivo}</p>}
              </li>
            ))}
          </ol>
        </CardContent>
      </Card>
    </div>
  );
}
