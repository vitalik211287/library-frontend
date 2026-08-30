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
  if (achievement.category === "books") {
    if (achievement.target >= 25) {
      return "🏆";
    }

    if (achievement.target >= 10) {
      return "📚";
    }

    return "📖";
  }

  if (achievement.category === "pages") {
    if (achievement.target >= 10000) {
      return "👑";
    }

    return "📜";
  }

  if (achievement.category === "time") {
    if (achievement.target >= 100 * 60 * 60) {
      return "⌛";
    }

    return "⏱️";
  }

  if (achievement.category === "streak") {
    return "🔥";
  }

  return "🏅";
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
