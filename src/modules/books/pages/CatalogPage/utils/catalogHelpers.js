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

export const filterCatalogBooks = ({
  books,
  search,
  searchBy,
}) => {
  const words = search
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean);

  if (!words.length) {
    return books;
  }

  return books.filter((book) => {
    let searchableValue;

    if (searchBy === "all") {
      searchableValue = [
        book.title,
        book.author,
        book.year,
        book.genre,
        book.isbn,
        book.publisher,
      ]
        .filter(Boolean)
        .join(" ");
    } else {
      searchableValue = book[searchBy];
    }

    if (
      searchableValue === null ||
      searchableValue === undefined
    ) {
      return false;
    }

    const normalizedValue = String(searchableValue)
      .toLowerCase()
      .replace(/\s+/g, " ");

    return words.every((word) =>
      normalizedValue.includes(word),
    );
  });
};
