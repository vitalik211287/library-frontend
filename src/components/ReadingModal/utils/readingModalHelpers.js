const getReadingProgress = (currentPage, totalPages) => {
  if (!totalPages || totalPages <= 0) {
    return 0;
  }

  return Math.round(((currentPage ?? 0) / totalPages) * 1000) / 10;
};

const READING_STATUS_LABELS = {
  NOT_STARTED: "Не почато",
  READING: "Читаю",
  PAUSED: "Пауза",
  FINISHED: "Прочитано",
};

const getReadingStatusLabel = (status, activeSession) => {
  if (activeSession) {
    return activeSession.pausedAt
      ? READING_STATUS_LABELS.PAUSED
      : READING_STATUS_LABELS.READING;
  }

  return READING_STATUS_LABELS[status] ?? "Не почато";
};

const formatTime = (totalSeconds) => {
  const hours = Math.floor(totalSeconds / 3600);

  const minutes = Math.floor((totalSeconds % 3600) / 60);

  const seconds = totalSeconds % 60;

  return [hours, minutes, seconds]
    .map((value) => String(value).padStart(2, "0"))
    .join(":");
};

const formatDuration = (totalSeconds) => {
  if (totalSeconds === null || totalSeconds === undefined) {
    return "";
  }

  const safeSeconds = Math.max(Math.floor(totalSeconds), 0);

  const hours = Math.floor(safeSeconds / 3600);

  const minutes = Math.floor((safeSeconds % 3600) / 60);

  const seconds = safeSeconds % 60;

  if (hours > 0) {
    if (minutes === 0) {
      return `${hours} год`;
    }

    return `${hours} год ${minutes} хв`;
  }

  if (minutes > 0) {
    if (seconds === 0) {
      return `${minutes} хв`;
    }

    return `${minutes} хв ${seconds} сек`;
  }

  return `${seconds} сек`;
};

export {
  formatDuration,
  formatTime,
  getReadingProgress,
  getReadingStatusLabel,
  READING_STATUS_LABELS,
};
