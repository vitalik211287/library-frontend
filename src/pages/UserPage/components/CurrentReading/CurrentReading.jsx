import { useState } from "react";

import { useSearchParams } from "react-router-dom";

import useCurrentBooks from "../../hooks/useCurrentBooks.js";

import { getProgress } from "../../utils/readingHelpers.js";

import "./CurrentReading.css";

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

const CurrentReading = ({ readingBookId, onBooksChange }) => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [isCurrentBooksOpen, setIsCurrentBooksOpen] = useState(false);

  const { currentBooks, isLoading, error } = useCurrentBooks({
    readingBookId,
    onBooksChange,
  });

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

  const getBookProgress = (book) => {
    if (!book) {
      return 0;
    }

    if (book.progressMode === "PERCENT") {
      return Math.min(100, Math.max(0, book.currentPercent ?? 0));
    }

    return getProgress(book.currentPage ?? 0, book.pages ?? 0);
  };

  return (
    <section className="profile-section">
      <div className="profile-section__header">
        <h2>Зараз читаю</h2>

        {otherCurrentBooks.length > 0 && (
          <button
            type="button"
            className="current-books-toggle"
            onClick={() => setIsCurrentBooksOpen((isOpen) => !isOpen)}
          >
            {isCurrentBooksOpen ? "Згорнути" : `Ще ${otherCurrentBooks.length}`}

            <ChevronIcon isOpen={isCurrentBooksOpen} />
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="profile-empty">Завантаження...</div>
      ) : error ? (
        <div className="profile-empty">{error}</div>
      ) : !mainCurrentBook ? (
        <div className="profile-empty">Немає активних книг</div>
      ) : (
        <>
          <article className="current-book">
            <div className="current-book__cover">
              {mainCurrentBook.coverUrl ? (
                <img
                  src={mainCurrentBook.coverUrl}
                  alt={mainCurrentBook.title}
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
              <h3>{mainCurrentBook.title}</h3>

              <p className="current-book__author">{mainCurrentBook.author}</p>

              {(() => {
                const currentPage = mainCurrentBook.currentPage ?? 0;

                const totalPages = mainCurrentBook.pages ?? 0;

                const progress = getBookProgress(mainCurrentBook);

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
                        {totalPages ? ` з ${totalPages}` : ""}
                      </span>

                      <strong>{progress}%</strong>
                    </div>
                  </>
                );
              })()}

              <button
                type="button"
                className="current-book__button"
                onClick={() => handleOpenReading(mainCurrentBook.id)}
              >
                Продовжити читання
              </button>
            </div>
          </article>

          {otherCurrentBooks.length > 0 && (
            <div
              className={`current-books-dropdown ${
                isCurrentBooksOpen ? "current-books-dropdown--open" : ""
              }`}
            >
              <div className="current-books-dropdown__inner">
                {otherCurrentBooks.map((book) => {
                  const currentPage = book.currentPage ?? 0;

                  const totalPages = book.pages ?? 0;

                  const progress = getBookProgress(book);

                  return (
                    <article
                      className="current-books-dropdown__book"
                      key={book.id}
                    >
                      <div className="current-books-dropdown__cover">
                        {book.coverUrl ? (
                          <img src={book.coverUrl} alt={book.title} />
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

                          <strong>{progress}%</strong>
                        </div>

                        <span className="current-books-dropdown__page">
                          Сторінка {currentPage}
                          {totalPages ? ` з ${totalPages}` : ""}
                        </span>

                        <button
                          type="button"
                          className="current-books-dropdown__button"
                          onClick={() => handleOpenReading(book.id)}
                        >
                          Продовжити
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}
    </section>
  );
};

export default CurrentReading;
