import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export type Rol = "administrador" | "recepcion" | "tecnico" | "ventas";

export type Perfil = {
  id: string;
  nombre: string;
  email: string | null;
};

export function useSesion() {
  const [session, setSession] = useState<Session | null>(null);
  const [perfil, setPerfil] = useState<Perfil | null>(null);
  const [rol, setRol] = useState<Rol | null>(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    let activo = true;

    async function cargar(s: Session | null) {
      if (!activo) return;
      setSession(s);
      if (!s?.user) {
        setPerfil(null);
        setRol(null);
        setCargando(false);
        return;
      }
      const [{ data: p }, { data: r }] = await Promise.all([
        supabase.from("perfiles").select("id, nombre, email").eq("id", s.user.id).maybeSingle(),
        supabase.from("roles_usuario").select("rol").eq("user_id", s.user.id).limit(1).maybeSingle(),
      ]);
      if (!activo) return;
      setPerfil(p ?? { id: s.user.id, nombre: s.user.email ?? "Usuario", email: s.user.email ?? null });
      setRol((r?.rol as Rol) ?? null);
      setCargando(false);
    }

    supabase.auth.getSession().then(({ data }) => cargar(data.session));

    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
      void cargar(s);
    });

    return () => {
      activo = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  return { session, perfil, rol, cargando, usuarioId: session?.user.id ?? null };
}
