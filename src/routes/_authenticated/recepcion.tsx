import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Loader2, Search, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useSesion } from "@/hooks/useSesion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/_authenticated/recepcion")({
  head: () => ({
    meta: [
      { title: "Recepción de ECU · ECUTech" },
      {
        name: "description",
        content: "Captura rápida en mostrador: cliente, modelo de ECU, falla reportada y folio automático.",
      },
      { property: "og:title", content: "Recepción de ECU · ECUTech" },
      {
        property: "og:description",
        content: "Registro de ingreso de ECUs con folio automático y estado inicial Recibida.",
      },
    ],
  }),
  component: Recepcion,
});

const esquemaCliente = z.object({
  nombre: z.string().trim().min(2, "Nombre requerido").max(120),
  telefono: z.string().trim().min(7, "Teléfono requerido").max(20),
  email: z.string().trim().email("Correo inválido").max(255).optional().or(z.literal("")),
  empresa: z.string().trim().max(120).optional(),
  direccion: z.string().trim().max(200).optional(),
  municipio: z.string().trim().max(120).optional(),
  observaciones: z.string().trim().max(1000).optional(),
});

const esquemaEcu = z.object({
  modelo: z.string().trim().min(1, "Modelo requerido").max(120),
  anio: z.string().trim().max(4).optional(),
  numero_parte: z.string().trim().max(80).optional(),
  marca_vehiculo: z.string().trim().max(80).optional(),
  modelo_vehiculo: z.string().trim().max(80).optional(),
  anio_vehiculo: z.string().trim().max(4).optional(),
  motivo_visita: z.string().trim().max(300).optional(),
  falla_reportada: z.string().trim().max(1000).optional(),
  observaciones: z.string().trim().max(1000).optional(),
});

type Cliente = { id: string; numero_cliente: string; nombre: string; telefono: string; empresa: string | null };

function Recepcion() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { usuarioId } = useSesion();

  const [busqueda, setBusqueda] = useState("");
  const [clienteSel, setClienteSel] = useState<Cliente | null>(null);
  const [nuevoCliente, setNuevoCliente] = useState(false);
  const [cliente, setCliente] = useState({
    nombre: "",
    telefono: "",
    email: "",
    empresa: "",
    direccion: "",
    municipio: "",
    observaciones: "",
  });
  const [ecu, setEcu] = useState({
    modelo: "",
    anio: "",
    numero_parte: "",
    marca_vehiculo: "",
    modelo_vehiculo: "",
    anio_vehiculo: "",
    motivo_visita: "",
    falla_reportada: "",
    observaciones: "",
  });
  const [paraVenta, setParaVenta] = useState(false);

  const { data: resultados = [] } = useQuery({
    queryKey: ["clientes-busqueda", busqueda],
    enabled: busqueda.trim().length >= 2 && !nuevoCliente,
    queryFn: async () => {
      const t = busqueda.trim();
      const { data, error } = await supabase
        .from("clientes")
        .select("id, numero_cliente, nombre, telefono, empresa")
        .or(`nombre.ilike.%${t}%,telefono.ilike.%${t}%,numero_cliente.ilike.%${t}%`)
        .limit(8);
      if (error) throw error;
      return data as Cliente[];
    },
  });

  const { data: modelos = [] } = useQuery({
    queryKey: ["modelos"],
    queryFn: async () => {
      const { data, error } = await supabase.from("modelos_ecu").select("nombre").order("nombre");
      if (error) throw error;
      return data.map((m) => m.nombre);
    },
  });

  const registrar = useMutation({
    mutationFn: async () => {
      let clienteId = clienteSel?.id ?? null;

      if (nuevoCliente || !clienteId) {
        const parsed = esquemaCliente.safeParse(cliente);
        if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? "Datos del cliente inválidos");
        const { data, error } = await supabase
          .from("clientes")
          .insert({
            nombre: parsed.data.nombre,
            telefono: parsed.data.telefono,
            email: parsed.data.email || null,
            empresa: parsed.data.empresa || null,
            direccion: parsed.data.direccion || null,
            municipio: parsed.data.municipio || null,
            observaciones: parsed.data.observaciones || null,
            created_by: usuarioId,
          })
          .select("id")
          .single();
        if (error) throw error;
        clienteId = data.id;
      }

      const parsedEcu = esquemaEcu.safeParse(ecu);
      if (!parsedEcu.success) throw new Error(parsedEcu.error.issues[0]?.message ?? "Datos de la ECU inválidos");

      const { data, error } = await supabase
        .from("registros_ecu")
        .insert({
          cliente_id: clienteId,
          modelo: parsedEcu.data.modelo,
          anio: parsedEcu.data.anio ? Number(parsedEcu.data.anio) : null,
          numero_parte: parsedEcu.data.numero_parte || null,
          marca_vehiculo: parsedEcu.data.marca_vehiculo || null,
          modelo_vehiculo: parsedEcu.data.modelo_vehiculo || null,
          anio_vehiculo: parsedEcu.data.anio_vehiculo ? Number(parsedEcu.data.anio_vehiculo) : null,
          motivo_visita: parsedEcu.data.motivo_visita || null,
          falla_reportada: parsedEcu.data.falla_reportada || null,
          observaciones: parsedEcu.data.observaciones || null,
          recibido_por: usuarioId,
          para_venta: paraVenta,
        })
        .select("id, folio")
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries();
      toast.success(`ECU registrada con folio ${data.folio}`);
      navigate({ to: "/ecus/$id", params: { id: data.id } });
    },
    onError: (e: Error) => toast.error("No se pudo registrar", { description: e.message }),
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold">Recepción de ECU</h1>
        <p className="text-sm text-muted-foreground">
          El folio, la fecha de ingreso y el responsable se registran automáticamente.
        </p>
      </div>

      <form
        className="grid gap-4 lg:grid-cols-2"
        onSubmit={(e) => {
          e.preventDefault();
          registrar.mutate();
        }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="text-base">1. Cliente</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {!nuevoCliente && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="buscar">Buscar cliente</Label>
                  <div className="relative">
                    <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="buscar"
                      className="pl-9"
                      placeholder="Nombre, teléfono o número de cliente"
                      value={busqueda}
                      onChange={(e) => {
                        setBusqueda(e.target.value);
                        setClienteSel(null);
                      }}
                    />
                  </div>
                </div>

                {clienteSel ? (
                  <div className="rounded-md border border-primary/40 bg-primary/10 p-3 text-sm">
                    <p className="font-medium">{clienteSel.nombre}</p>
                    <p className="text-muted-foreground">
                      {clienteSel.numero_cliente} · {clienteSel.telefono}
                      {clienteSel.empresa ? ` · ${clienteSel.empresa}` : ""}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    {resultados.map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => setClienteSel(c)}
                        className="flex w-full items-center justify-between rounded-md border border-border px-3 py-2 text-left text-sm hover:bg-secondary"
                      >
                        <span>{c.nombre}</span>
                        <span className="text-xs text-muted-foreground">{c.telefono}</span>
                      </button>
                    ))}
                    {busqueda.trim().length >= 2 && resultados.length === 0 && (
                      <p className="text-sm text-muted-foreground">Sin resultados.</p>
                    )}
                  </div>
                )}

                <Button type="button" variant="outline" onClick={() => setNuevoCliente(true)}>
                  <UserPlus className="size-4" />
                  Registrar cliente nuevo
                </Button>
              </>
            )}

            {nuevoCliente && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="border-primary/40 text-primary">
                    Cliente nuevo
                  </Badge>
                  <Button type="button" variant="ghost" size="sm" onClick={() => setNuevoCliente(false)}>
                    Buscar existente
                  </Button>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="nombre">Nombre *</Label>
                    <Input
                      id="nombre"
                      required
                      maxLength={120}
                      value={cliente.nombre}
                      onChange={(e) => setCliente({ ...cliente, nombre: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="telefono">Teléfono (WhatsApp) *</Label>
                    <Input
                      id="telefono"
                      required
                      maxLength={20}
                      value={cliente.telefono}
                      onChange={(e) => setCliente({ ...cliente, telefono: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cemail">Correo</Label>
                    <Input
                      id="cemail"
                      type="email"
                      maxLength={255}
                      value={cliente.email}
                      onChange={(e) => setCliente({ ...cliente, email: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="empresa">Empresa</Label>
                    <Input
                      id="empresa"
                      maxLength={120}
                      value={cliente.empresa}
                      onChange={(e) => setCliente({ ...cliente, empresa: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="municipio">Municipio</Label>
                    <Input
                      id="municipio"
                      maxLength={120}
                      value={cliente.municipio}
                      onChange={(e) => setCliente({ ...cliente, municipio: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="direccion">Dirección</Label>
                    <Input
                      id="direccion"
                      maxLength={200}
                      value={cliente.direccion}
                      onChange={(e) => setCliente({ ...cliente, direccion: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="cobs">Observaciones del cliente</Label>
                    <Textarea
                      id="cobs"
                      maxLength={1000}
                      value={cliente.observaciones}
                      onChange={(e) => setCliente({ ...cliente, observaciones: e.target.value })}
                    />
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">2. Datos de la ECU</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="modelo">Modelo *</Label>
                <Input
                  id="modelo"
                  required
                  list="lista-modelos"
                  maxLength={120}
                  placeholder="Ej. Bosch EDC17"
                  value={ecu.modelo}
                  onChange={(e) => setEcu({ ...ecu, modelo: e.target.value })}
                />
                <datalist id="lista-modelos">
                  {modelos.map((m) => (
                    <option key={m} value={m} />
                  ))}
                </datalist>
              </div>
              <div className="space-y-2">
                <Label htmlFor="anio">Año</Label>
                <Input
                  id="anio"
                  inputMode="numeric"
                  maxLength={4}
                  value={ecu.anio}
                  onChange={(e) => setEcu({ ...ecu, anio: e.target.value.replace(/\D/g, "") })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="parte">Número de parte</Label>
                <Input
                  id="parte"
                  maxLength={80}
                  value={ecu.numero_parte}
                  onChange={(e) => setEcu({ ...ecu, numero_parte: e.target.value })}
                />
              </div>
              <div className="space-y-2 sm:col-span-2 pt-1">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Vehículo
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="marca-veh">Marca del vehículo</Label>
                <Input
                  id="marca-veh"
                  maxLength={80}
                  placeholder="Ej. Nissan"
                  value={ecu.marca_vehiculo}
                  onChange={(e) => setEcu({ ...ecu, marca_vehiculo: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="modelo-veh">Modelo del vehículo</Label>
                <Input
                  id="modelo-veh"
                  maxLength={80}
                  placeholder="Ej. Versa"
                  value={ecu.modelo_vehiculo}
                  onChange={(e) => setEcu({ ...ecu, modelo_vehiculo: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="anio-veh">Año del vehículo</Label>
                <Input
                  id="anio-veh"
                  inputMode="numeric"
                  maxLength={4}
                  placeholder="Ej. 2018"
                  value={ecu.anio_vehiculo}
                  onChange={(e) =>
                    setEcu({ ...ecu, anio_vehiculo: e.target.value.replace(/\D/g, "") })
                  }
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="motivo">Motivo de la visita</Label>
                <Input
                  id="motivo"
                  maxLength={300}
                  placeholder="Ej. Reparación, revisión, segunda opinión"
                  value={ecu.motivo_visita}
                  onChange={(e) => setEcu({ ...ecu, motivo_visita: e.target.value })}
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="falla">Falla reportada por el cliente</Label>
                <Textarea
                  id="falla"
                  maxLength={1000}
                  value={ecu.falla_reportada}
                  onChange={(e) => setEcu({ ...ecu, falla_reportada: e.target.value })}
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="obs">Observaciones adicionales</Label>
                <Textarea
                  id="obs"
                  maxLength={1000}
                  value={ecu.observaciones}
                  onChange={(e) => setEcu({ ...ecu, observaciones: e.target.value })}
                />
              </div>
            </div>

            <div className="flex items-center justify-between rounded-md border border-border p-3">
              <div>
                <p className="text-sm font-medium">Unidad para venta</p>
                <p className="text-xs text-muted-foreground">
                  Marca si la ECU se integrará al inventario de venta.
                </p>
              </div>
              <Switch checked={paraVenta} onCheckedChange={setParaVenta} />
            </div>

            <Button type="submit" className="w-full" disabled={registrar.isPending}>
              {registrar.isPending && <Loader2 className="size-4 animate-spin" />}
              Registrar ingreso y generar folio
            </Button>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
