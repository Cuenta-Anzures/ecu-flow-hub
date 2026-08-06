import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/_authenticated/clientes")({
  head: () => ({
    meta: [
      { title: "Clientes · ECUTech" },
      {
        name: "description",
        content: "Directorio de clientes del taller con número de cliente, teléfono y empresa.",
      },
      { property: "og:title", content: "Clientes · ECUTech" },
      {
        property: "og:description",
        content: "Consulta y busca clientes registrados en el taller de ECUs.",
      },
    ],
  }),
  component: Clientes,
});

function Clientes() {
  const [texto, setTexto] = useState("");

  const { data: clientes = [] } = useQuery({
    queryKey: ["clientes"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("clientes")
        .select("id, numero_cliente, nombre, telefono, email, empresa, municipio")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const t = texto.trim().toLowerCase();
  const visibles = clientes.filter(
    (c) =>
      !t ||
      c.nombre.toLowerCase().includes(t) ||
      c.telefono.toLowerCase().includes(t) ||
      c.numero_cliente.toLowerCase().includes(t),
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold">Clientes</h1>
          <p className="text-sm text-muted-foreground">{clientes.length} clientes registrados.</p>
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Nombre, teléfono o número"
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-2">
        {visibles.length === 0 && (
          <Card>
            <CardContent className="p-6 text-center text-sm text-muted-foreground">
              Aún no hay clientes. Se crean desde la pantalla de Recepción.
            </CardContent>
          </Card>
        )}
        {visibles.map((c) => (
          <div key={c.id} className="rounded-lg border border-border bg-card p-4">
            <div className="flex flex-wrap items-center gap-3">
              <span className="font-mono text-sm text-primary">{c.numero_cliente}</span>
              <span className="font-display font-medium">{c.nombre}</span>
              <span className="ml-auto text-sm text-muted-foreground">{c.telefono}</span>
            </div>
            <div className="mt-1 flex flex-wrap gap-x-4 text-xs text-muted-foreground">
              {c.empresa && <span>{c.empresa}</span>}
              {c.municipio && <span>{c.municipio}</span>}
              {c.email && <span>{c.email}</span>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
