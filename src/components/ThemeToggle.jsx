import { Moon, Sun } from "lucide-react";

import { useTheme } from "../context/ThemeContext";

function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="
        w-12
        h-12
        rounded-2xl
        bg-zinc-100
        text-zinc-900
        border
        border-zinc-200
        flex
        items-center
        justify-center
        hover:scale-105
        transition

        dark:bg-white/5
        dark:text-white
        dark:border-white/10
        dark:hover:border-purple-500
      "
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
    >
      {isDark ? <Sun size={20} /> : <Moon size={20} />}
    </button>
  );
}

export default ThemeToggle;