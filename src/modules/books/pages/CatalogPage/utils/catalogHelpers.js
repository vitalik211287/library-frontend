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
    return { rank: 0, extraLength: 0 };
  }

  const prefixLengths = tokens
    .filter((token) => token.startsWith(word))
    .map((token) => token.length - word.length);

  if (prefixLengths.length) {
    return {
      rank: 1,
      extraLength: Math.min(...prefixLengths),
    };
  }

  return value.includes(word)
    ? { rank: 2, extraLength: 0 }
    : null;
};

export const filterCatalogBooks = ({ books, search, searchBy }) => {
  const words = normalizeSearchText(search).split(" ").filter(Boolean);

  if (!words.length) {
    return books;
  }

  return books
    .map((book, index) => {
      const values =
        searchBy === "all"
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

      const matches = words.map((word) => {
        const candidates = normalizedValues
          .map((value) => getSearchWordRank(value, word))
          .filter(Boolean);

        candidates.sort(
          (a, b) =>
            a.rank - b.rank || a.extraLength - b.extraLength,
        );

        return candidates[0] ?? null;
      });

      if (matches.some((match) => match === null)) {
        return null;
      }

      return {
        book,
        index,
        worstRank: Math.max(...matches.map((match) => match.rank)),
        totalRank: matches.reduce((sum, match) => sum + match.rank, 0),
        extraLength: matches.reduce(
          (sum, match) => sum + match.extraLength,
          0,
        ),
      };
    })
    .filter(Boolean)
    .sort(
      (a, b) =>
        a.worstRank - b.worstRank ||
        a.totalRank - b.totalRank ||
        a.extraLength - b.extraLength ||
        a.index - b.index,
    )
    .map(({ book }) => book);
};
