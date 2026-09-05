import { getProgress } from "../utils/homeHelpers.js";

const useCurrentBook = (currentBooks) => {
  const book = currentBooks[0] ?? null;

  const currentPage = book?.currentPage ?? 0;
  const totalPages = book?.pages ?? 0;

  const progress =
    book?.progressMode === "PERCENT"
      ? (book?.currentPercent ?? 0)
      : getProgress(currentPage, totalPages);

  return {
    book,
    currentPage,
    totalPages,
    progress,
  };
};

export default useCurrentBook;
