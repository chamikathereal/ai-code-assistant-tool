"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Button } from "./button";

export function ThemeToggle() {
  const { theme, setTheme, systemTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const currentTheme = mounted ? (theme === "system" ? systemTheme : theme) : "light";
  const nextTheme = currentTheme === "dark" ? "light" : "dark";
  const label = mounted
    ? currentTheme === "dark"
      ? "Switch to Light"
      : "Switch to Dark"
    : "Loading theme...";

  return (
    <Button variant="outline" onClick={() => setTheme(nextTheme)} disabled={!mounted}>
      {label}
    </Button>
  );
}
