export const CATEGORIES = [
  {
    id: "all",
    label: "Усі",
  },
  {
    id: "books",
    label: "Книги",
  },
  {
    id: "pages",
    label: "Сторінки",
  },
  {
    id: "time",
    label: "Час",
  },
  {
    id: "streak",
    label: "Серія",
  },
];

export const getAchievementIcon = (achievement) => {
  const target = Number(achievement.target) || 0;

  if (achievement.category === "books") {
    if (target >= 25) {
      return "trophy";
    }

    if (target >= 10) {
      return "books-stack";
    }

    if (target >= 5) {
      return "book-single";
    }

    return "book";
  }

  if (achievement.category === "pages") {
    if (target >= 10000) {
      return "crown";
    }

    if (target >= 5000) {
      return "pages-stack";
    }

    return "pages-single";
  }

  if (achievement.category === "time") {
    if (target >= 100 * 60 * 60) {
      return "hourglass";
    }

    if (target >= 50 * 60 * 60) {
      return "clock";
    }

    return "stopwatch";
  }

  if (achievement.category === "streak") {
    if (target >= 30) {
      return "flame-strong";
    }

    return "flame";
  }

  return "medal";
};

export const formatNumber = (value) => {
  return new Intl.NumberFormat("uk-UA").format(Number(value) || 0);
};

export const formatSeconds = (seconds) => {
  const safeSeconds = Math.max(Number(seconds) || 0, 0);

  const totalMinutes = Math.floor(safeSeconds / 60);

  const hours = Math.floor(totalMinutes / 60);

  const minutes = totalMinutes % 60;

  if (hours === 0) {
    return `${minutes} хв`;
  }

  if (minutes === 0) {
    return `${hours} год`;
  }

  return `${hours} год ${minutes} хв`;
};

export const formatAchievementValue = (achievement, value) => {
  if (achievement.category === "time") {
    return formatSeconds(value);
  }

  if (achievement.category === "streak") {
    return `${formatNumber(value)} дн.`;
  }

  return formatNumber(value);
};
