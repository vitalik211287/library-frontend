export const mainNavigationItems = [
  {
    key: "catalog",
    to: "/catalog",
    label: "Каталог",
  },
  {
    key: "add",
    to: "/add",
    label: "Додати книгу",
  },
  {
    key: "calendar",
    to: "/calendar",
    label: "Календар",
  },
  {
    key: "reader",
    label: "Читалка",
    action: "reader",
  },
  {
    key: "stats",
    to: "/stats",
    label: "Статистика",
  },
  {
    key: "achievements",
    to: "/achievements",
    label: "Досягнення",
  },
];

export const swipeNavigationPaths = [
  "/home",
  ...mainNavigationItems
    .filter((item) => item.to)
    .map((item) => item.to),
  "/account",
  "/settings",
];