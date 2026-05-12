import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState("dark");

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");

    if (savedTheme) {
      setTheme(savedTheme);
      applyTheme(savedTheme);
      return;
    }

    applyTheme("dark");
  }, []);

  function applyTheme(selectedTheme) {
    const root = document.documentElement;

    if (selectedTheme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }

    localStorage.setItem("theme", selectedTheme);
  }

  function toggleTheme() {
    const newTheme = theme === "dark" ? "light" : "dark";

    setTheme(newTheme);
    applyTheme(newTheme);
  }

  return (
    <ThemeContext.Provider
      value={{
        theme,
        toggleTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}