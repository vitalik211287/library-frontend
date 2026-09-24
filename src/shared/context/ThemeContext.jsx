import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  THEME_MODES,
  isThemeMode,
  resolveTheme,
} from "../theme/themes.js";

const ThemeContext =
  createContext(null);

const getInitialTheme = () => {
  const savedTheme =
    localStorage.getItem("theme");

  if (isThemeMode(savedTheme)) {
    return savedTheme;
  }

  return THEME_MODES.SYSTEM;
};

export const ThemeProvider = ({
  children,
}) => {
  const [
    themeMode,
    setThemeMode,
  ] = useState(
    getInitialTheme,
  );

  useEffect(() => {
    const mediaQuery =
      window.matchMedia(
        "(prefers-color-scheme: dark)",
      );

    const applyTheme = () => {
      const resolvedTheme =
        resolveTheme(
          themeMode,
          mediaQuery.matches,
        );

      document.documentElement.dataset.theme =
        resolvedTheme;

      localStorage.setItem(
        "theme",
        themeMode,
      );
    };

    applyTheme();

    const handleSystemChange =
      () => {
        if (
          themeMode === THEME_MODES.SYSTEM
        ) {
          applyTheme();
        }
      };

    mediaQuery.addEventListener(
      "change",
      handleSystemChange,
    );

    return () => {
      mediaQuery.removeEventListener(
        "change",
        handleSystemChange,
      );
    };
  }, [themeMode]);

  const value = useMemo(
    () => ({
      themeMode,
      setThemeMode,
    }),
    [themeMode],
  );

  return (
    <ThemeContext.Provider
      value={value}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context =
    useContext(
      ThemeContext,
    );

  if (!context) {
    throw new Error(
      "useTheme must be used inside ThemeProvider",
    );
  }

  return context;
};
