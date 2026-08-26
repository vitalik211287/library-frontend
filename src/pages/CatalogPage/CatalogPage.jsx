import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

import "./CatalogPage.css";

import EditBookModal from "../../components/EditBookModal/EditBookModal";
import ReadingModal from "../../components/ReadingModal/ReadingModal";
import BarcodeScanner from "../../components/BarcodeScanner/BarcodeScanner";

const API_URL = "https://library-backend-production-5d60.up.railway.app";

function CatalogPage() {
  const [books, setBooks] = useState([]);
  const [message, setMessage] = useState("");
  const [search, setSearch] = useState("");
  const [searchBy, setSearchBy] = useState("title");

  const [editingBook, setEditingBook] = useState(null);

  const [scannerOpen, setScannerOpen] = useState(false);

  const [searchParams, setSearchParams] = useSearchParams();

  const readingBookId = searchParams.get("reading");

  const readingBook =
    books.find((book) => book.id === readingBookId) ?? null;

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const response = await fetch(`${API_URL}/api/books`);

        const data = await response.json();

        if (!response.ok) {
          setMessage("Не вдалося завантажити книги");
          return;
        }

        setBooks(data);
      } catch (error) {
        console.error("Помилка завантаження книг:", error);

        setMessage("Помилка завантаження бібліотеки");
      }
    };

    fetchBooks();
  }, []);

  const filteredBooks = books.filter((book) => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return true;
    }

    const value = book[searchBy];

    if (value === null || value === undefined) {
      return false;
    }

    return String(value).toLowerCase().includes(query);
  });

  const handleScan = (isbn) => {
    setSearchBy("isbn");
    setSearch(isbn);
    setScannerOpen(false);
  };

  const handleBookUpdated = (updatedBook) => {
    setBooks((currentBooks) =>
      currentBooks.map((book) =>
        book.id === updatedBook.id ? updatedBook : book,
      ),
    );

    setEditingBook(null);
  };

  const handleOpenReading = (book) => {
    const params = new URLSearchParams(searchParams);

    params.set("reading", book.id);

    setSearchParams(params);
  };

  const handleCloseReading = () => {
    const params = new URLSearchParams(searchParams);

    params.delete("reading");

    setSearchParams(params);
  };

  return (
    <div className="catalog-page">
      <h1>Каталог бібліотеки</h1>

      <p className="books-count">
        Книг у бібліотеці: {books.length}
      </p>

      {message && (
        <p className="catalog-message">
          {message}
        </p>
      )}

      <div className="catalog-search">
        <div className="catalog-search__field">
          <div className="catalog-search__input">
            <input
              type="text"
              placeholder="Пошук..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />

            <svg
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <circle
                cx="11"
                cy="11"
                r="7"
              />

              <path d="M20 20L16.5 16.5" />
            </svg>
          </div>

          <button
            type="button"
            className="catalog-scan__button"
            onClick={() => setScannerOpen(true)}
            aria-label="Сканувати ISBN"
            title="Сканувати ISBN"
          >
            <svg
              viewBox="0 0 24 24"
              width="24"
              height="24"
              aria-hidden="true"
            >
              <path
                d="M4 7V5a1 1 0 0 1 1-1h2M17 4h2a1 1 0 0 1 1 1v2M20 17v2a1 1 0 0 1-1 1h-2M7 20H5a1 1 0 0 1-1-1v-2"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />

              <rect
                x="7"
                y="8"
                width="10"
                height="8"
                rx="1"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              />

              <path
                d="M9 10v4M11 10v4M13 10v4M15 10v4"
                stroke="currentColor"
                strokeWidth="1.5"
              />
            </svg>
          </button>
        </div>

        <select
          value={searchBy}
          onChange={(event) => setSearchBy(event.target.value)}
        >
          <option value="title">
            За назвою
          </option>

          <option value="author">
            За автором
          </option>

          <option value="year">
            За роком
          </option>

          <option value="genre">
            За жанром
          </option>

          <option value="isbn">
            За ISBN
          </option>
        </select>
      </div>

      <div className="books-grid">
        {filteredBooks.map((book) => (
          <article
            className="book-card"
            key={book.id}
          >
            {book.coverUrl && (
              <img
                className="book-cover"
                src={book.coverUrl}
                alt={book.title}
              />
            )}

            <div className="book-card__content">
              <h2>
                {book.title}
              </h2>

              <p>
                {book.author}
              </p>

              {book.publisher && (
                <p>
                  Видавництво: {book.publisher}
                </p>
              )}

              {book.year && (
                <p>
                  Рік: {book.year}
                </p>
              )}

              {book.genre && (
                <p>
                  Жанр: {book.genre}
                </p>
              )}
            </div>

            <div className="book-card__actions">
              <button
                type="button"
                className="book-card__button book-card__button--edit"
                onClick={() => setEditingBook(book)}
              >
                Редагувати
              </button>

              <button
                type="button"
                className="book-card__button book-card__button--read"
                onClick={() => handleOpenReading(book)}
              >
                Читати
              </button>
            </div>
          </article>
        ))}
      </div>

      {editingBook && (
        <EditBookModal
          book={editingBook}
          onClose={() => setEditingBook(null)}
          onUpdated={handleBookUpdated}
        />
      )}

      {readingBook && (
        <ReadingModal
          book={readingBook}
          apiUrl={API_URL}
          onClose={handleCloseReading}
        />
      )}

      {scannerOpen && (
        <BarcodeScanner
          onScan={handleScan}
          onClose={() => setScannerOpen(false)}
        />
      )}
    </div>
  );
}

export default CatalogPage;