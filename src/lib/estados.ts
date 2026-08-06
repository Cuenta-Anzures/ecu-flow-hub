export const ESTADOS = [
  "recibida",
  "en_prueba_simulador",
  "pendiente_asignacion",
  "asignada_tecnico",
  "en_revision",
  "reparada",
  "no_reparada",
  "no_reparable",
  "pendiente_entrega",
  "completada",
] as const;

export type Estado = (typeof ESTADOS)[number];

export const ETIQUETA_ESTADO: Record<Estado, string> = {
  recibida: "Recibida",
  en_prueba_simulador: "En prueba de simulador",
  pendiente_asignacion: "Pendiente de asignación",
  asignada_tecnico: "Asignada a técnico",
  en_revision: "En revisión",
  reparada: "Reparada",
  no_reparada: "No reparada",
  no_reparable: "No reparable",
  pendiente_entrega: "Pendiente de entrega",
  completada: "Completada",
};

export const CLASE_ESTADO: Record<Estado, string> = {
  recibida: "bg-muted text-foreground border-border",
  en_prueba_simulador: "bg-accent/15 text-accent border-accent/40",
  pendiente_asignacion: "bg-warning/15 text-warning border-warning/40",
  asignada_tecnico: "bg-accent/15 text-accent border-accent/40",
  en_revision: "bg-primary/15 text-primary border-primary/40",
  reparada: "bg-success/15 text-success border-success/40",
  no_reparada: "bg-destructive/15 text-destructive border-destructive/40",
  no_reparable: "bg-destructive/15 text-destructive border-destructive/40",
  pendiente_entrega: "bg-warning/15 text-warning border-warning/40",
  completada: "bg-success/20 text-success border-success/50",
};

/** Estados en los que la unidad está cerrada (no admite más avance de flujo). */
export const ESTADOS_CERRADOS: Estado[] = ["completada"];

export const ESTADOS_EN_PROCESO: Estado[] = [
  "recibida",
  "en_prueba_simulador",
  "pendiente_asignacion",
  "asignada_tecnico",
  "en_revision",
];

export const ESTADOS_PENDIENTE_ENTREGA: Estado[] = [
  "reparada",
  "no_reparada",
  "no_reparable",
  "pendiente_entrega",
];

export function formatoFecha(valor?: string | null) {
  if (!valor) return "—";
  return new Date(valor).toLocaleString("es-MX", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
