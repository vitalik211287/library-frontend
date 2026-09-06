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
    id: "psychology",
    title: "Психологія",
    keywords: [
      "психологія",
      "психологічна",
      "психологічний",
      "psychology",
      "саморозвиток",
      "самодопомога",
      "self help",
      "self-help",
    ],
  },
  {
    id: "science",
    title: "Наука",
    keywords: [
      "наука",
      "наукова література",
      "науково-популярна",
      "науково-популярні",
      "науково-популярні книги",
      "науково-популярна література",
      "науково-популярний",
      "науково популярна",
      "science",
      "popular science",
      "фізика",
      "біологія",
      "астрономія",
      "математика",
      "хімія",
      "географія",
    ],
  },
  {
    id: "philosophy",
    title: "Філософія",
    keywords: [
      "філософія",
      "філософська",
      "філософський",
      "philosophy",
      "етика",
      "метафізика",
      "стоїцизм",
      "екзистенціалізм",
    ],
  },
  {
    id: "classic",
    title: "Класика",
    keywords: [
      "класика",
      "класична",
      "класичний",
      "класичні",
      "класична зарубіжна проза",
      "класична українська проза",
      "classic",
      "classics",
    ],
  },
  {
    id: "magical-realism",
    title: "Містичний реалізм",
    keywords: [
      "містичний реалізм",
      "містичний",
      "магічний реалізм",
      "magical realism",
    ],
  },
  {
    id: "hobby",
    title: "Хобі",
    keywords: [
      "хобі",
      "hobby",
      "малювання",
      "живопис",
      "акварель",
      "акваріум",
      "акваріумістика",
      "бар",
      "барна справа",
      "бармен",
      "барменство",
      "коктейлі",
      "міксологія",
      "рукоділля",
      "в'язання",
      "вишивання",
      "моделювання",
      "колекціонування",
      "кулінарія",
      "кулінарна",
      "кулінарний",
      "рецепти",
      "кухня",
      "готування",
      "cooking",
      "cookbook",
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