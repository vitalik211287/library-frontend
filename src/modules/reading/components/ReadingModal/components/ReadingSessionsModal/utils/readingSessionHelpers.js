export const formatDate = (value) => {
  if (!value) {
    return "";
  }

  return new Intl.DateTimeFormat("uk-UA", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(value));
};

export const formatClockTime = (value) => {
  if (!value) {
    return "—";
  }

  return new Intl.DateTimeFormat("uk-UA", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
};

export const formatDuration = (seconds = 0) => {
  const totalSeconds = Math.max(
    Math.floor(seconds),
    0,
  );

  const hours = Math.floor(
    totalSeconds / 3600,
  );

  const minutes = Math.floor(
    (totalSeconds % 3600) / 60,
  );

  const remainingSeconds =
    totalSeconds % 60;

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
