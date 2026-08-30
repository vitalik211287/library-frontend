export const normalizeIsbn = (value) =>
  String(value ?? "")
    .replace(/[^0-9Xx]/g, "")
    .trim();

export const isValidIsbnLength = (value) =>
  value.length === 10 || value.length === 13;

export const createBookData = (book) => ({
  isbn: book.isbn,
  title: book.title,
  author: book.author,

  ...(book.publisher && {
    publisher: book.publisher,
  }),

  ...(book.year && {
    year: Number(book.year),
  }),

  ...(book.pages && {
    pages: Number(book.pages),
  }),

  ...(book.language && {
    language: book.language,
  }),

  ...(book.genre && {
    genre: book.genre,
  }),

  ...(book.description && {
    description: book.description,
  }),

  ...(book.coverUrl && {
    coverUrl: book.coverUrl,
  }),
});
