export const getProgress = (
  currentPage,
  totalPages,
) => {
  const safeCurrentPage = Number(currentPage) || 0;
  const safeTotalPages = Number(totalPages) || 0;

  if (safeTotalPages <= 0) {
    return 0;
  }

  return Math.min(
    Math.max(
      Math.round(
        (safeCurrentPage / safeTotalPages) * 100,
      ),
      0,
    ),
    100,
  );
};
