const getReadingProgress = (currentPage, totalPages) => {
  if (!totalPages || totalPages <= 0) {
    return 0;
  }

  return Math.round(((currentPage ?? 0) / totalPages) * 1000) / 10;
};

const getReadingStatusLabel = (status, activeSession) => {
  if (activeSession) {
    return activeSession.pausedAt ? "PAUSED" : "READING";
  }

  return status;
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

  const hours = Math.floor(totalSeconds / 3600);

  const minutes = Math.floor((totalSeconds % 3600) / 60);

  if (hours > 0) {
    return `${hours} год ${minutes} хв`;
  }

  return `${minutes} хв`;
};

export {
  formatDuration,
  formatTime,
  getReadingProgress,
  getReadingStatusLabel,
};
