import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    if (typeof window === "undefined") return "light";
    try {
      const stored = localStorage.getItem("theme");
      if (stored === "light" || stored === "dark") return stored;
      return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
    } catch {
      return "light";
    }
  });

  useEffect(() => {
    try {
      if (theme === "dark") document.documentElement.classList.add("dark");
      else document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", theme);
    } catch {}
  }, [theme]);

  return (
    <Button variant="ghost" size="sm" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
      {theme === "dark" ? "🌙" : "☀️"}
    </Button>
  );
}
