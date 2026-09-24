import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

const ThemeContext =
  createContext(null);

const getInitialTheme = () => {
  const savedTheme =
    localStorage.getItem("theme");

  if (
    savedTheme === "light" ||
    savedTheme === "dark" ||
    savedTheme === "system"
  ) {
    return savedTheme;
  }

  return "system";
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
      const isDark =
        themeMode === "dark" ||
        (
          themeMode ===
            "system" &&
          mediaQuery.matches
        );

      document.documentElement.dataset.theme = isDark ? "dark" : "light";

      localStorage.setItem(
        "theme",
        themeMode,
      );
    };

    applyTheme();

    const handleSystemChange =
      () => {
        if (
          themeMode ===
          "system"
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
