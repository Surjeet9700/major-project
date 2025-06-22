"use client";

import { useTheme } from "@/hooks/use-theme";
import { IconSun, IconMoon } from "@tabler/icons-react";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-md hover:bg-secondary transition-colors"
      aria-label="Toggle theme"
    >
      {theme === "light" ? (
        <IconMoon className="w-4 h-4" />
      ) : (
        <IconSun className="w-4 h-4" />
      )}
    </button>
  );
}
