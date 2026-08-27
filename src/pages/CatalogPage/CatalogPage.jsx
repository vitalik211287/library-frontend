import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  useNavigate,
  useSearchParams,
} from "react-router-dom";

import "./CatalogPage.css";

import EditBookModal from "../../components/EditBookModal/EditBookModal";
import ReadingModal from "../../components/ReadingModal/ReadingModal";
import BarcodeScanner from "../../components/BarcodeScanner/BarcodeScanner";
import { useAuth } from "../../context/AuthContext.jsx";

const API_URL =
  "https://library-backend-production-5d60.up.railway.app";

function CatalogPage() {
  const [books, setBooks] = useState([]);
  const [message, setMessage] = useState("");
  const [search, setSearch] = useState("");
  const [searchBy, setSearchBy] = useState("title");

  const [editingBook, setEditingBook] = useState(null);
  const [scannerOpen, setScannerOpen] = useState(false);

  const [searchParams, setSearchParams] =
    useSearchParams();

  const navigate = useNavigate();

  const {
    isAuthenticated,
    isAuthLoading,
  } = useAuth();

  const readingBookId =
    searchParams.get("reading");

  const readingBook =
    books.find(
      (book) => book.id === readingBookId,
    ) ?? null;

  /* =========================
     ЗАВАНТАЖЕННЯ КНИГ
  ========================= */

  const fetchBooks = useCallback(async () => {
    try {
      const response = await fetch(
        `${API_URL}/api/books`,
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(
          "Не вдалося завантажити книги",
        );

        return;
      }

      /*
       * Неавторизований користувач:
       * показуємо тільки загальні дані книг.
       */
      if (!isAuthenticated) {
        setBooks(data);
        return;
      }

      /*
       * Авторизований користувач:
       * до кожної книги підтягуємо
       * персональний UserBook.
       */

      const token =
        localStorage.getItem("token");

      const booksWithReadingData =
        await Promise.all(
          data.map(async (book) => {
            try {
              const userBookResponse =
                await fetch(
                  `${API_URL}/api/user-books/${book.id}`,
                  {
                    headers: {
                      Authorization:
                        `Bearer ${token}`,
                    },
                  },
                );


              /*
               * Якщо UserBook для книги
               * ще не існує.
               */
              if (!userBookResponse.ok) {
                return {
                  ...book,
                  currentPage: 0,
                  status: "NOT_STARTED",
                  rating: null,
                };
              }

              const userBook =
                await userBookResponse.json();

              return {
                ...book,

                currentPage:
                  userBook.currentPage ?? 0,

                status:
                  userBook.status ??
                  "NOT_STARTED",

                rating:
                  userBook.rating ?? null,
              };
            } catch (error) {
              console.error(
                `Помилка отримання даних читання для ${book.id}:`,
                error,
              );

              return {
                ...book,
                currentPage: 0,
                status: "NOT_STARTED",
                rating: null,
              };
            }
          }),
        );

      setBooks(booksWithReadingData);
    } catch (error) {
      console.error(
        "Помилка завантаження книг:",
        error,
      );

      setMessage(
        "Помилка завантаження бібліотеки",
      );
    }
  }, [isAuthenticated]);

  /* =========================
     ПЕРШЕ ЗАВАНТАЖЕННЯ
     ТА ЗМІНА AUTH
  ========================= */

  useEffect(() => {
    if (isAuthLoading) {
      return;
    }

    fetchBooks();
  }, [
    isAuthLoading,
    fetchBooks,
  ]);

  /* =========================
     ЗАХИСТ READING URL
  ========================= */

  useEffect(() => {
    if (
      isAuthLoading ||
      !readingBookId ||
      isAuthenticated
    ) {
      return;
    }

    const params =
      new URLSearchParams(searchParams);

    params.delete("reading");

    setSearchParams(params, {
      replace: true,
    });

    navigate("/login", {
      state: {
        from: `/?reading=${readingBookId}`,
      },
    });
  }, [
    isAuthenticated,
    isAuthLoading,
    readingBookId,
    searchParams,
    setSearchParams,
    navigate,
  ]);

  /* =========================
     ПОШУК
  ========================= */

  const filteredBooks =
    books.filter((book) => {
      const query =
        search.trim().toLowerCase();

      if (!query) {
        return true;
      }

      const value =
        book[searchBy];

      if (
        value === null ||
        value === undefined
      ) {
        return false;
      }

      return String(value)
        .toLowerCase()
        .includes(query);
    });

  /* =========================
     СКАНЕР
  ========================= */

  const handleScan = (isbn) => {
    setSearchBy("isbn");
    setSearch(isbn);
    setScannerOpen(false);
  };

  /* =========================
     РЕДАГУВАННЯ КНИГИ
  ========================= */

  const handleBookUpdated =
    (updatedBook) => {
      setBooks((currentBooks) =>
        currentBooks.map((book) =>
          book.id === updatedBook.id
            ? {
                ...book,
                ...updatedBook,
              }
            : book,
        ),
      );

      setEditingBook(null);
    };

  /* =========================
     ВІДКРИТТЯ READING MODAL
  ========================= */

  const handleOpenReading = (book) => {
    if (isAuthLoading) {
      return;
    }

    if (!isAuthenticated) {
      navigate("/login", {
        state: {
          from: `/?reading=${book.id}`,
        },
      });

      return;
    }

    const params =
      new URLSearchParams(searchParams);

    params.set(
      "reading",
      book.id,
    );

    setSearchParams(params);
  };

  /* =========================
     ЗАКРИТТЯ READING MODAL
  ========================= */

  const handleCloseReading =
    async () => {
      const params =
        new URLSearchParams(
          searchParams,
        );

      params.delete("reading");

      setSearchParams(params);

      /*
       * Після закриття модалки
       * заново отримуємо UserBook,
       * щоб рейтинг / статус
       * одразу оновилися.
       */
      await fetchBooks();
    };

  /* =========================
     НАЗВА СТАТУСУ
  ========================= */

  const getStatusLabel = (status) => {
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

  return (
    <div className="catalog-page">
      <h1>
        Каталог бібліотеки
      </h1>

      <p className="books-count">
        Книг у бібліотеці:{" "}
        {books.length}
      </p>

      {message && (
        <p className="catalog-message">
          {message}
        </p>
      )}

      {/* =====================
          ПОШУК
      ===================== */}

      <div className="catalog-search">
        <div className="catalog-search__field">
          <div className="catalog-search__input">
            <input
              type="text"
              placeholder="Пошук..."
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value,
                )
              }
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
            onClick={() =>
              setScannerOpen(true)
            }
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
          onChange={(event) =>
            setSearchBy(
              event.target.value,
            )
          }
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

      {/* =====================
          КНИГИ
      ===================== */}

      <div className="books-grid">
        {filteredBooks.map(
          (book) => (
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

                <p className="book-card__author">
                  {book.author}
                </p>

                {/* =================
                    МОБІЛЬНА
                    READING INFO
                ================= */}

                {isAuthenticated && (
                  <div className="book-card__reading-info">
                    <p>
                      Статус:{" "}
                      <strong>
                        {getStatusLabel(
                          book.status,
                        )}
                      </strong>
                    </p>

                    <div className="book-card__rating-row">
                      <span>
                        Рейтинг:
                      </span>

                      <div
                        className="book-card__stars"
                        aria-label={`Рейтинг ${
                          book.rating ??
                          0
                        } з 5`}
                      >
                        {[
                          1,
                          2,
                          3,
                          4,
                          5,
                        ].map(
                          (value) => (
                            <span
                              key={
                                value
                              }
                              className="book-card__star"
                            >
                              {value <=
                              (book.rating ??
                                0)
                                ? "★"
                                : "☆"}
                            </span>
                          ),
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* =================
                    TABLET /
                    DESKTOP INFO
                ================= */}

                <div className="book-card__extra-info">
                  {book.publisher && (
                    <p>
                      Видавництво:{" "}
                      {book.publisher}
                    </p>
                  )}

                  {book.year && (
                    <p>
                      Рік:{" "}
                      {book.year}
                    </p>
                  )}

                  {book.genre && (
                    <p>
                      Жанр:{" "}
                      {book.genre}
                    </p>
                  )}
                </div>
              </div>

              {/* =================
                  ACTIONS
              ================= */}

              <div className="book-card__actions">
                <button
                  type="button"
                  className="book-card__button book-card__button--edit"
                  onClick={() =>
                    setEditingBook(
                      book,
                    )
                  }
                >
                  Редагувати
                </button>

                <button
                  type="button"
                  className="book-card__button book-card__button--read"
                  onClick={() =>
                    handleOpenReading(
                      book,
                    )
                  }
                  disabled={
                    isAuthLoading
                  }
                >
                  Читати
                </button>
              </div>
            </article>
          ),
        )}
      </div>

      {/* =====================
          EDIT MODAL
      ===================== */}

      {editingBook && (
        <EditBookModal
          book={editingBook}
          onClose={() =>
            setEditingBook(null)
          }
          onUpdated={
            handleBookUpdated
          }
        />
      )}

      {/* =====================
          READING MODAL
      ===================== */}

      {readingBook &&
        isAuthenticated &&
        !isAuthLoading && (
          <ReadingModal
            book={readingBook}
            apiUrl={API_URL}
            onClose={
              handleCloseReading
            }
          />
        )}

      {/* =====================
          SCANNER
      ===================== */}

      {scannerOpen && (
        <BarcodeScanner
          onScan={handleScan}
          onClose={() =>
            setScannerOpen(false)
          }
        />
      )}
    </div>
  );
}

export default CatalogPage;