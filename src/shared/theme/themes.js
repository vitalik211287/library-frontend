export const THEME_MODES = {
  SYSTEM: "system",
  LIGHT: "light",
  DARK: "dark",
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
];

export const GLOBAL_THEME_MODES = {
  DEFAULT: "default",
  HALLOWEEN: "halloween",
  CYBERPUNK: "cyberpunk",
};

export const GLOBAL_THEME_OPTIONS = [
  {
    id: GLOBAL_THEME_MODES.DEFAULT,
    label: "Звичайна",
  },
  {
    id: GLOBAL_THEME_MODES.HALLOWEEN,
    label: "Halloween",
  },
  {
    id: GLOBAL_THEME_MODES.CYBERPUNK,
    label: "Cyberpunk",
  },
];

export const isThemeMode = (value) =>
  THEME_OPTIONS.some((theme) => theme.id === value);

export const isGlobalThemeMode = (value) =>
  GLOBAL_THEME_OPTIONS.some((theme) => theme.id === value);

export const resolveTheme = (themeMode, prefersDark = false) => {
  if (themeMode === THEME_MODES.SYSTEM) {
    return prefersDark ? THEME_MODES.DARK : THEME_MODES.LIGHT;
  }

  return themeMode;
};
