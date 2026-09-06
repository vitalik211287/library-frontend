export const validateStartProgress = ({
  startProgress,
  progressMode,
  currentBook,
}) => {
  if (startProgress.trim() === "") {
    return progressMode === "PERCENT"
      ? "Вкажи початковий відсоток"
      : "Вкажи початкову сторінку";
  }

  const value = Number(startProgress);

  if (!Number.isInteger(value)) {
    return progressMode === "PERCENT"
      ? "Вкажи цілий відсоток"
      : "Вкажи коректний номер сторінки";
  }

  if (value < 0) {
    return "Прогрес не може бути меншим за 0";
  }

  if (progressMode === "PERCENT" && value > 100) {
    return "Відсоток має бути від 0 до 100";
  }

  if (
    progressMode === "PAGES" &&
    currentBook.pages &&
    value > currentBook.pages
  ) {
    return `У книзі всього ${currentBook.pages} сторінок`;
  }

  return "";
};

export const validateEndProgress = ({
  endProgress,
  isPercentMode,
  activeSession,
  currentBook,
}) => {
  if (endProgress.trim() === "") {
    return isPercentMode
      ? "Вкажи кінцевий відсоток"
      : "Вкажи сторінку, на якій зупинилися";
  }

  const value = Number(endProgress);

  if (!Number.isInteger(value)) {
    return isPercentMode
      ? "Вкажи цілий відсоток"
      : "Вкажи коректний номер сторінки";
  }

  if (value < 0) {
    return "Прогрес не може бути меншим за 0";
  }

  if (isPercentMode) {
    const sessionStartPercent = activeSession?.startPercent ?? 0;

    if (value > 100) {
      return "Відсоток має бути від 0 до 100";
    }

    if (value < sessionStartPercent) {
      return `Відсоток не може бути меншим за ${sessionStartPercent}%`;
    }

    return "";
  }

  const sessionStartPage = activeSession?.startPage ?? 0;

  if (value < sessionStartPage) {
    return `Сторінка не може бути меншою за ${sessionStartPage}`;
  }

  if (currentBook.pages && value > currentBook.pages) {
    return `У книзі всього ${currentBook.pages} сторінок`;
  }

  return "";
};
