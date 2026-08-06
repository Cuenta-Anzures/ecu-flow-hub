import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Item = {
  fecha_ingreso: string;
  fecha_entrega: string | null;
  estado: string;
};

const MESES = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];

const REPARADAS = ["reparada", "pendiente_entrega", "completada"];

/** Fecha de cierre de la unidad: entrega real o, si aún no se entrega, su ingreso. */
export function fechaCierre(r: Item) {
  return r.fecha_entrega ?? r.fecha_ingreso;
}

/** Ingresos vs. reparaciones de los últimos 6 meses. */
export function BarrasMensuales({ registros }: { registros: Item[] }) {
  const hoy = new Date();
  const meses = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(hoy.getFullYear(), hoy.getMonth() - (5 - i), 1);
    return { anio: d.getFullYear(), mes: d.getMonth() };
  });

  const datos = meses.map(({ anio, mes }) => {
    const enMes = (valor: string) => {
      const d = new Date(valor);
      return d.getFullYear() === anio && d.getMonth() === mes;
    };
    return {
      label: MESES[mes],
      ingresos: registros.filter((r) => enMes(r.fecha_ingreso)).length,
      reparadas: registros.filter((r) => REPARADAS.includes(r.estado) && enMes(fechaCierre(r)))
        .length,
    };
  });

  const max = Math.max(1, ...datos.map((d) => Math.max(d.ingresos, d.reparadas)));

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between gap-2">
        <CardTitle className="text-base">Actividad de los últimos 6 meses</CardTitle>
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <span className="size-2.5 rounded-sm bg-primary" /> Ingresos
          </span>
          <span className="flex items-center gap-1.5">
            <span className="size-2.5 rounded-sm bg-accent" /> Reparadas
          </span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-end gap-3">
          {datos.map((d) => (
            <div key={d.label} className="flex flex-1 flex-col items-center gap-2">
              <div className="flex h-40 w-full items-end justify-center gap-1">
                <div
                  className="w-1/2 max-w-8 rounded-t-sm bg-primary/80"
                  style={{ height: `${Math.max((d.ingresos / max) * 100, d.ingresos ? 4 : 0)}%` }}
                  title={`${d.ingresos} ingresos`}
                />
                <div
                  className="w-1/2 max-w-8 rounded-t-sm bg-accent/80"
                  style={{ height: `${Math.max((d.reparadas / max) * 100, d.reparadas ? 4 : 0)}%` }}
                  title={`${d.reparadas} reparadas`}
                />
              </div>
              <span className="text-xs text-muted-foreground">{d.label}</span>
              <span className="text-[11px] text-muted-foreground/70">
                {d.ingresos} / {d.reparadas}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
