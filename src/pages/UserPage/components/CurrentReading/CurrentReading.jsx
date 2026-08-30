import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

import "./CurrentReading.css";

const API_URL = "https://library-backend-production-5d60.up.railway.app";

const ChevronIcon = ({ isOpen }) => (
  <svg
    className={`current-books-toggle__icon ${
      isOpen ? "current-books-toggle__icon--open" : ""
    }`}
    viewBox="0 0 24 24"
    aria-hidden="true"
  >
    <path d="m6 9 6 6 6-6" />
  </svg>
);

const getProgress = (currentPage, totalPages) => {
  if (!totalPages || totalPages <= 0) {
    return 0;
  }

  return Math.min(
    Math.round((currentPage / totalPages) * 100),
    100,
  );
};

const CurrentReading = ({
  readingBookId,
  onBooksChange,
}) => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [currentBooks, setCurrentBooks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isCurrentBooksOpen, setIsCurrentBooksOpen] =
    useState(false);

  useEffect(() => {
    const loadCurrentBooks = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        setIsLoading(false);
        onBooksChange?.(0);
        return;
      }

      try {
        setIsLoading(true);
        setError("");

        const response = await fetch(
          `${API_URL}/api/user-books/current`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        if (!response.ok) {
          throw new Error();
        }

        const data = await response.json();

        const books = Array.isArray(data.books)
          ? data.books
          : [];

        setCurrentBooks(books);
        onBooksChange?.(books.length);
      } catch (loadError) {
        console.error(
          "Load current reading error:",
          loadError,
        );

        setError(
          "Не вдалося завантажити поточне читання",
        );

        onBooksChange?.(0);
      } finally {
        setIsLoading(false);
      }
    };

    loadCurrentBooks();
  }, [readingBookId, onBooksChange]);

  const handleOpenReading = (bookId) => {
    if (!bookId) {
      return;
    }

    const params = new URLSearchParams(searchParams);

    params.set("reading", bookId);

    setSearchParams(params);
  };

  const mainCurrentBook = currentBooks[0] ?? null;
  const otherCurrentBooks = currentBooks.slice(1);

  return (
    <section className="profile-section">
      <div className="profile-section__header">
        <h2>Зараз читаю</h2>

        {otherCurrentBooks.length > 0 && (
          <button
            type="button"
            className="current-books-toggle"
            onClick={() =>
              setIsCurrentBooksOpen(
                (isOpen) => !isOpen,
              )
            }
          >
            {isCurrentBooksOpen
              ? "Згорнути"
              : `Ще ${otherCurrentBooks.length}`}

            <ChevronIcon
              isOpen={isCurrentBooksOpen}
            />
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="profile-empty">
          Завантаження...
        </div>
      ) : error ? (
        <div className="profile-empty">
          {error}
        </div>
      ) : !mainCurrentBook ? (
        <div className="profile-empty">
          Немає активних книг
        </div>
      ) : (
        <>
          <article className="current-book">
            <div className="current-book__cover">
              {mainCurrentBook.book?.coverUrl ? (
                <img
                  src={
                    mainCurrentBook.book.coverUrl
                  }
                  alt={
                    mainCurrentBook.book.title
                  }
                />
              ) : (
                <div className="book-no-cover">
                  Немає
                  <br />
                  обкладинки
                </div>
              )}
            </div>

            <div className="current-book__content">
              <h3>
                {mainCurrentBook.book?.title}
              </h3>

              <p className="current-book__author">
                {mainCurrentBook.book?.author}
              </p>

              {(() => {
                const currentPage =
                  mainCurrentBook.userBook
                    ?.currentPage ?? 0;

                const totalPages =
                  mainCurrentBook.book?.pages ?? 0;

                const progress = getProgress(
                  currentPage,
                  totalPages,
                );

                return (
                  <>
                    <div className="current-book__progress">
                      <span
                        style={{
                          width: `${progress}%`,
                        }}
                      />
                    </div>

                    <div className="current-book__progress-info">
                      <span>
                        Сторінка {currentPage}
                        {totalPages
                          ? ` з ${totalPages}`
                          : ""}
                      </span>

                      <strong>
                        {progress}%
                      </strong>
                    </div>
                  </>
                );
              })()}

              <button
                type="button"
                className="current-book__button"
                onClick={() =>
                  handleOpenReading(
                    mainCurrentBook.book.id,
                  )
                }
              >
                Продовжити читання
              </button>
            </div>
          </article>

          {otherCurrentBooks.length > 0 && (
            <div
              className={`current-books-dropdown ${
                isCurrentBooksOpen
                  ? "current-books-dropdown--open"
                  : ""
              }`}
            >
              <div className="current-books-dropdown__inner">
                {otherCurrentBooks.map(
                  ({ book, userBook }) => {
                    const currentPage =
                      userBook?.currentPage ?? 0;

                    const totalPages =
                      book?.pages ?? 0;

                    const progress =
                      getProgress(
                        currentPage,
                        totalPages,
                      );

                    return (
                      <article
                        className="current-books-dropdown__book"
                        key={userBook.id}
                      >
                        <div className="current-books-dropdown__cover">
                          {book.coverUrl ? (
                            <img
                              src={book.coverUrl}
                              alt={book.title}
                            />
                          ) : (
                            <div className="book-no-cover">
                              Немає
                              <br />
                              обкладинки
                            </div>
                          )}
                        </div>

                        <div className="current-books-dropdown__content">
                          <h3>{book.title}</h3>

                          <p>{book.author}</p>

                          <div className="current-books-dropdown__progress-row">
                            <div className="current-books-dropdown__progress">
                              <span
                                style={{
                                  width: `${progress}%`,
                                }}
                              />
                            </div>

                            <strong>
                              {progress}%
                            </strong>
                          </div>

                          <span className="current-books-dropdown__page">
                            Сторінка{" "}
                            {currentPage}
                            {totalPages
                              ? ` з ${totalPages}`
                              : ""}
                          </span>

                          <button
                            type="button"
                            className="current-books-dropdown__button"
                            onClick={() =>
                              handleOpenReading(
                                book.id,
                              )
                            }
                          >
                            Продовжити
                          </button>
                        </div>
                      </article>
                    );
                  },
                )}
              </div>
            </div>
          )}
        </>
      )}
    </section>
  );
};

export default CurrentReading;
