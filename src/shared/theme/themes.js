export const THEME_MODES = {
  SYSTEM: "system",
  LIGHT: "light",
  DARK: "dark",
};

export const THEME_OPTIONS = [
  {
    id: THEME_MODES.SYSTEM,
    label: "Системна",
  },
  {
    id: THEME_MODES.LIGHT,
    label: "Світла",
  },
  {
    id: THEME_MODES.DARK,
    label: "Темна",
  },
];

export const isThemeMode = (value) =>
  THEME_OPTIONS.some((theme) => theme.id === value);

export const resolveTheme = (themeMode, prefersDark = false) => {
  if (themeMode === THEME_MODES.SYSTEM) {
    return prefersDark ? THEME_MODES.DARK : THEME_MODES.LIGHT;
  }

  return themeMode;
};
