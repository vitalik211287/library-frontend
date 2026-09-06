export const GENRE_GROUPS = [
  {
    id: "children",
    title: "Дитяча література",
    keywords: [
      "дитяча",
      "дитячі",
      "для дітей",
      "казка",
      "казки",
      "children",
      "kids",
    ],
  },
  {
    id: "educational",
    title: "Навчальна література",
    keywords: [
      "учбова",
      "учбовий",
      "навчальна",
      "навчальний",
      "підручник",
      "посібник",
      "textbook",
      "educational",
    ],
  },
  {
    id: "fantasy",
    title: "Фентезі",
    keywords: [
      "фентезі",
      "фетезі",
      "fantasy",
    ],
  },
  {
    id: "science-fiction",
    title: "Фантастика",
    keywords: [
      "фантастика",
      "science fiction",
      "science-fiction",
      "sci fi",
      "sci-fi",
    ],
  },
  {
    id: "detective",
    title: "Детективи",
    keywords: [
      "детектив",
      "детективи",
      "detective",
    ],
  },
  {
    id: "thriller",
    title: "Трилери",
    keywords: [
      "трилер",
      "трилери",
      "thriller",
    ],
  },
  {
    id: "historical",
    title: "Історична література",
    keywords: [
      "історична",
      "історичний",
      "історичні",
      "history",
      "historical",
    ],
  },
  {
    id: "biography",
    title: "Біографії",
    keywords: [
      "біографія",
      "біографії",
      "автобіографія",
      "мемуари",
      "biography",
      "memoir",
    ],
  },
  {
    id: "prose",
    title: "Художня проза",
    keywords: [
      "проза",
      "роман",
      "реалізм",
      "сучасна література",
      "класична література",
    ],
  },
];

const normalizeText = (value = "") =>
  String(value)
    .toLowerCase()
    .trim()
    .replace(/[.,;:/\\|_()-]+/g, " ")
    .replace(/\s+/g, " ");

export const getNormalizedGenre = (genre) => {
  if (!genre || !String(genre).trim()) {
    return {
      id: "other",
      title: "Інше",
    };
  }

  const normalizedGenre = normalizeText(genre);

  const group = GENRE_GROUPS.find(({ keywords }) =>
    keywords.some((keyword) =>
      normalizedGenre.includes(normalizeText(keyword)),
    ),
  );

  return (
    group ?? {
      id: "other",
      title: "Інше",
    }
  );
};

export const groupBooksByGenre = (books) => {
  const groups = new Map();

  books.forEach((book) => {
    const genre = getNormalizedGenre(book.genre);

    if (!groups.has(genre.id)) {
      groups.set(genre.id, {
        id: genre.id,
        title: genre.title,
        books: [],
      });
    }

    groups.get(genre.id).books.push(book);
  });

  return Array.from(groups.values()).sort(
    (a, b) => b.books.length - a.books.length,
  );
};