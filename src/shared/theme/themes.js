export const THEME_MODES = {
  SYSTEM: "system",
  LIGHT: "light",
  DARK: "dark",
  HALLOWEEN: "halloween",
};

export const THEME_OPTIONS = [
  {
    id: THEME_MODES.SYSTEM,
    label: "Системна",
    icon: "system",
  },
  {
    id: THEME_MODES.LIGHT,
    label: "Світла",
    icon: "sun",
  },
  {
    id: THEME_MODES.DARK,
    label: "Темна",
    icon: "moon",
  },
  {
    id: THEME_MODES.HALLOWEEN,
    label: "Halloween",
    icon: "moon",
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
