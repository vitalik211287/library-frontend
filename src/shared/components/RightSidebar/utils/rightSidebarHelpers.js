export const getProgress = (book) => {
  if (!book) {
    return 0;
  }

  if (book.progressMode === "PERCENT") {
    return Math.min(
      Math.max(Number(book.currentPercent ?? 0), 0),
      100,
    );
  }

  const currentPage = Number(book.currentPage ?? 0);
  const totalPages = Number(book.pages ?? 0);

  if (!totalPages || totalPages <= 0) {
    return 0;
  }

  return Math.min(
    Math.max(Math.round((currentPage / totalPages) * 100), 0),
    100,
  );
};

export const getProgressLabel = (book) => {
  if (!book) {
    return "";
  }

  if (book.progressMode === "PERCENT") {
    return `${book.currentPercent ?? 0}%`;
  }

  if (book.pages) {
    return `Сторінка ${book.currentPage ?? 0} з ${book.pages}`;
  }

  return `Сторінка ${book.currentPage ?? 0}`;
};
