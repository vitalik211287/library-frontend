export const MONTH_NAMES = [
  "Січ",
  "Лют",
  "Бер",
  "Кві",
  "Тра",
  "Чер",
  "Лип",
  "Сер",
  "Вер",
  "Жов",
  "Лис",
  "Гру",
];

export const formatReadingTime = (seconds = 0) => {
  if (!seconds) {
    return "0 сек";
  }

  const totalSeconds = Math.max(Math.floor(seconds), 0);

  const hours = Math.floor(totalSeconds / 3600);

  const minutes = Math.floor((totalSeconds % 3600) / 60);

  const remainingSeconds = totalSeconds % 60;

  if (hours > 0) {
    if (minutes === 0) {
      return `${hours} год`;
    }

    return `${hours} год ${minutes} хв`;
  }

  if (minutes > 0) {
    if (remainingSeconds === 0) {
      return `${minutes} хв`;
    }

    return `${minutes} хв ${remainingSeconds} сек`;
  }

  return `${remainingSeconds} сек`;
};

export const formatGoalMinutes = (minutes = 0) => {
  if (!minutes) {
    return "0 хв";
  }

  const hours = Math.floor(minutes / 60);

  const remainingMinutes = minutes % 60;

  if (hours === 0) {
    return `${remainingMinutes} хв`;
  }

  if (remainingMinutes === 0) {
    return `${hours} год`;
  }

  return `${hours} год ${remainingMinutes} хв`;
};

