import { createContext, useContext, useEffect, useMemo, useState } from "react";

import { apiFetch } from "../api/apiClient.js";
import {
  GLOBAL_THEME_MODES,
  isGlobalThemeMode,
  THEME_MODES,
  isThemeMode,
  resolveTheme,
} from "../theme/themes.js";

const ThemeContext = createContext(null);

const getInitialTheme = () => {
  const savedTheme = localStorage.getItem("theme");

  if (isThemeMode(savedTheme)) {
    return savedTheme;
  }

  return THEME_MODES.SYSTEM;
};

export const ThemeProvider = ({ children }) => {
  const [themeMode, setThemeMode] = useState(getInitialTheme);
  const [globalTheme, setGlobalTheme] = useState(GLOBAL_THEME_MODES.DEFAULT);

  useEffect(() => {
    let isActive = true;

    const loadGlobalTheme = async () => {
      try {
        const data = await apiFetch("/api/settings/theme", {
          auth: false,
        });

        const nextGlobalTheme = data?.globalTheme?.toLowerCase();

        if (isActive && isGlobalThemeMode(nextGlobalTheme)) {
          setGlobalTheme(nextGlobalTheme);
        }
      } catch (error) {
        console.error("Failed to load global theme:", error);
      }
    };

    loadGlobalTheme();

    return () => {
      isActive = false;
    };
  }, []);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    const applyTheme = () => {
      const personalTheme = resolveTheme(themeMode, mediaQuery.matches);

      const resolvedTheme =
        globalTheme === GLOBAL_THEME_MODES.DEFAULT
          ? personalTheme
          : globalTheme;

      document.documentElement.dataset.theme = resolvedTheme;

      localStorage.setItem("theme", themeMode);
    };

    applyTheme();

    const handleSystemChange = () => {
      if (
        themeMode === THEME_MODES.SYSTEM &&
        globalTheme === GLOBAL_THEME_MODES.DEFAULT
      ) {
        applyTheme();
      }
    };

    mediaQuery.addEventListener("change", handleSystemChange);

    return () => {
      mediaQuery.removeEventListener("change", handleSystemChange);
    };
  }, [themeMode, globalTheme]);

  const value = useMemo(
    () => ({
      themeMode,
      setThemeMode,
      globalTheme,
      setGlobalTheme,
    }),
    [themeMode, globalTheme],
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error("useTheme must be used inside ThemeProvider");
  }

  return context;
};
