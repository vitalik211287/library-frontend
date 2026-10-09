export const getStatusLabel = (status) => {
  switch (status) {
    case "READING":
      return "Читаю";

    case "FINISHED":
      return "Прочитано";

    case "PAUSED":
      return "Пауза";

    case "NOT_STARTED":
    default:
      return "Не розпочато";
  }
};

export const getDefaultUserBookData = () => ({
  currentPage: 0,
  status: "NOT_STARTED",
  rating: null,
  isWishlist: false,
});

const normalizeSearchText = (value) =>
  String(value ?? "")
    .normalize("NFC")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();

const getSearchWordRank = (value, word) => {
  const tokens = value.match(/[\p{L}\p{N}]+/gu) ?? [];

  if (tokens.includes(word)) {
    return 0;
  }

  if (tokens.some((token) => token.startsWith(word))) {
    return 1;
  }

  return value.includes(word) ? 2 : null;
};

export const filterCatalogBooks = ({ books, search, searchBy }) => {
  const words = normalizeSearchText(search).split(" ").filter(Boolean);

  if (!words.length) {
    return books;
  }

  return books
    .map((book, index) => {
      const values = searchBy === "all"
        ? [
            book.title,
            book.author,
            book.year,
            book.genre,
            book.isbn,
            book.publisher,
          ]
        : [book[searchBy]];

      const normalizedValues = values.map(normalizeSearchText);

      const ranks = words.map((word) => {
        const matches = normalizedValues
          .map((value) => getSearchWordRank(value, word))
          .filter((rank) => rank !== null);

        return matches.length ? Math.min(...matches) : null;
      });

      if (ranks.some((rank) => rank === null)) {
        return null;
      }

      return {
        book,
        index,
        worstRank: Math.max(...ranks),
        totalRank: ranks.reduce((sum, rank) => sum + rank, 0),
      };
    })
    .filter(Boolean)
    .sort(
      (a, b) =>
        a.worstRank - b.worstRank ||
        a.totalRank - b.totalRank ||
        a.index - b.index,
    )
    .map(({ book }) => book);
};
