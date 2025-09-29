"use client";

import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    const stored = (typeof window !== "undefined" && localStorage.getItem("theme")) as
      | "light"
      | "dark"
      | null;
    const initial = stored ?? (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    setTheme(initial);
  }, []);

  useEffect(() => {
    if (typeof document === "undefined") return;
    const root = document.documentElement;
    if (theme === "dark") root.classList.add("dark");
    else root.classList.remove("dark");
    try {
      localStorage.setItem("theme", theme);
    } catch {
      // ignore
    }
  }, [theme]);

  return (
    <button
      type="button"
      aria-label="Temayı değiştir"
      className="inline-flex items-center gap-2 rounded-md border px-2.5 py-1.5 text-xs font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
      onClick={() => setTheme((t) => (t === "dark" ? "light" : "dark"))}
   >
      {theme === "dark" ? (
        <span>☀️ Açık</span>
      ) : (
        <span>🌙 Koyu</span>
      )}
    </button>
  );
}


