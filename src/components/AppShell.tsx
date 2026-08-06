import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import {
  Boxes,
  CircuitBoard,
  ClipboardPlus,
  Cpu,
  LayoutDashboard,
  LogOut,
  Users,
} from "lucide-react";
import type { ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useSesion } from "@/hooks/useSesion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { ThemeToggle } from "@/components/ThemeToggle";

const NAV = [
  { to: "/panel", label: "Panel", icon: LayoutDashboard },
  { to: "/recepcion", label: "Recepción", icon: ClipboardPlus },
  { to: "/ecus", label: "ECUs", icon: Cpu },
  { to: "/inventario", label: "Inventario", icon: Boxes },
  { to: "/clientes", label: "Clientes", icon: Users },
];

const ETIQUETA_ROL: Record<string, string> = {
  administrador: "Administrador",
  recepcion: "Recepción",
  tecnico: "Técnico",
  ventas: "Ventas",
};

function TallerSidebar() {
  const { state } = useSidebar();
  const colapsada = state === "collapsed";
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { perfil, rol } = useSesion();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  async function salir() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/", replace: true });
  }

  return (
    <Sidebar collapsible="icon" className="border-r border-border">
      <SidebarHeader>
        <Link to="/panel" className="flex items-center gap-2 px-1 py-2">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-primary/15 text-primary ring-1 ring-primary/25">
            <CircuitBoard className="size-5" />
          </span>
          {!colapsada && (
            <span className="flex flex-col leading-tight">
              <span className="font-display text-base font-semibold tracking-tight">
                ECU<span className="text-primary">Tech</span>
              </span>
              <span className="text-[11px] text-muted-foreground">Control de taller</span>
            </span>
          )}
        </Link>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Operación</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {NAV.map((item) => {
                const activo = pathname.startsWith(item.to);
                return (
                  <SidebarMenuItem key={item.to}>
                    <SidebarMenuButton asChild isActive={activo} tooltip={item.label}>
                      <Link
                        to={item.to}
                        className={cn(
                          "flex items-center gap-2",
                          activo && "text-primary",
                        )}
                      >
                        <item.icon className="size-4" />
                        <span>{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <div
          className={cn(
            "rounded-md border border-border bg-secondary/40 p-3",
            colapsada && "border-0 bg-transparent p-0",
          )}
        >
          {!colapsada && (
            <>
              <p className="truncate text-sm font-medium leading-tight">{perfil?.nombre ?? "—"}</p>
              <p className="text-xs text-muted-foreground">{rol ? ETIQUETA_ROL[rol] : ""}</p>
            </>
          )}
          <Button
            variant="outline"
            size="sm"
            className={cn("mt-2 w-full", colapsada && "mt-0 px-0")}
            onClick={salir}
          >
            <LogOut className="size-4" />
            {!colapsada && "Salir"}
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const actual = NAV.find((n) => pathname.startsWith(n.to));

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        <TallerSidebar />
        <SidebarInset className="min-w-0">
          <header className="sticky top-0 z-20 flex h-14 items-center gap-3 border-b border-border bg-card/80 px-4 backdrop-blur">
            <SidebarTrigger />
            <span className="font-display text-sm font-medium text-muted-foreground">
              {actual?.label ?? "ECUTech"}
            </span>
            <div className="ml-auto flex items-center gap-2">
              <ThemeToggle />
            </div>
          </header>
          <main className="mx-auto w-full max-w-7xl px-4 py-6">{children}</main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
