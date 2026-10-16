import { createContext, useContext, useEffect, useLayoutEffect, useMemo, useState } from "react";

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

const GLOBAL_THEME_CACHE_KEY = "library-global-theme";

const getInitialGlobalTheme = () => {
  try {
    const cachedTheme = localStorage.getItem(GLOBAL_THEME_CACHE_KEY);
    return isGlobalThemeMode(cachedTheme)
      ? cachedTheme
      : GLOBAL_THEME_MODES.DEFAULT;
  } catch {
    return GLOBAL_THEME_MODES.DEFAULT;
  }
};

export const ThemeProvider = ({ children }) => {
  const [themeMode, setThemeMode] = useState(getInitialTheme);
  const [globalTheme, setGlobalTheme] = useState(getInitialGlobalTheme);

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

  useLayoutEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    const applyTheme = () => {
      const colorScheme = resolveTheme(themeMode, mediaQuery.matches);

      const activeTheme =
        globalTheme === GLOBAL_THEME_MODES.DEFAULT
          ? GLOBAL_THEME_MODES.DEFAULT
          : globalTheme;

      document.documentElement.dataset.theme = activeTheme;
      document.documentElement.dataset.colorScheme = colorScheme;

      localStorage.setItem("theme", themeMode);
      try {
        localStorage.setItem(GLOBAL_THEME_CACHE_KEY, globalTheme);
      } catch {
        // Private mode or storage quota: theme still works in memory.
      }
    };

    applyTheme();

    const handleSystemChange = () => {
      if (themeMode === THEME_MODES.SYSTEM) {
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
