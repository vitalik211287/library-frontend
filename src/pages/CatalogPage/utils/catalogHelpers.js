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

export const filterCatalogBooks = ({ books, search, searchBy }) => {
  const query = search.trim().toLowerCase();

  if (!query) {
    return books;
  }

  return books.filter((book) => {
    const value = book[searchBy];

    if (value === null || value === undefined) {
      return false;
    }

    return String(value).toLowerCase().includes(query);
  });
};
