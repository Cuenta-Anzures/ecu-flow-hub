import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { CircuitBoard, Loader2, Lock, Mail } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ECUTech · Acceso al taller" },
      {
        name: "description",
        content:
          "Acceso al sistema de recepción, diagnóstico y reparación de ECUs del taller ECUTech.",
      },
      { property: "og:title", content: "ECUTech · Acceso al taller" },
      {
        property: "og:description",
        content: "Sistema de control de recepción, reparación e inventario de ECUs.",
      },
    ],
  }),
  component: Login,
});

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/panel", replace: true });
    });
  }, [navigate]);

  async function ingresar(e: React.FormEvent) {
    e.preventDefault();
    setEnviando(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    setEnviando(false);
    if (error) {
      toast.error("Credenciales incorrectas", {
        description: "Verifica el correo y la contraseña.",
      });
      return;
    }
    navigate({ to: "/panel", replace: true });
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4 py-10">
      <div className="circuit-grid absolute inset-0 opacity-60" aria-hidden />
      <div
        className="absolute -left-24 top-1/4 size-[420px] rounded-full blur-3xl"
        style={{ background: "oklch(0.79 0.155 72 / 0.12)" }}
        aria-hidden
      />
      <div
        className="absolute -right-24 bottom-0 size-[380px] rounded-full blur-3xl"
        style={{ background: "oklch(0.72 0.115 210 / 0.12)" }}
        aria-hidden
      />

      <div className="relative w-full max-w-md">
        <div className="mb-8 text-center">
          <span className="mx-auto mb-4 flex size-14 items-center justify-center rounded-xl bg-primary/15 text-primary ring-1 ring-primary/30">
            <CircuitBoard className="size-7" />
          </span>
          <h1 className="font-display text-3xl font-semibold">
            ECU<span className="text-primary">Tech</span>
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Taller de cómputo y electrónica automotriz · Control de reparaciones
          </p>
        </div>

        <div className="panel-tech rounded-xl border border-border p-6 sm:p-8">
          <h2 className="font-display text-lg font-semibold">Acceso al sistema</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Ingresa con tu cuenta del taller para continuar.
          </p>

          <form onSubmit={ingresar} className="mt-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Correo electrónico</Label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  required
                  maxLength={255}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="usuario@ecutech.mx"
                  className="pl-9"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  maxLength={72}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="pl-9"
                />
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={enviando}>
              {enviando && <Loader2 className="size-4 animate-spin" />}
              Entrar
            </Button>
          </form>

          <div className="mt-6 rounded-lg border border-dashed border-border bg-secondary/40 p-4 text-xs">
            <p className="mb-2 font-medium text-foreground">Cuentas de demostración</p>
            <ul className="space-y-1 font-mono text-muted-foreground">
              <li>admin@ecutech.mx · EcuTaller2026!</li>
              <li>recepcion@ecutech.mx · Mostrador2026!</li>
              <li>tecnico@ecutech.mx · Taller2026!</li>
            </ul>
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          Las cuentas las crea el administrador del taller. No hay registro público.
        </p>
      </div>
    </div>
  );
}
