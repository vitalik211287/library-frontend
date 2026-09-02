import { useMemo, useState } from "react";

import Modal from "../Modal/Modal.jsx";

import "./ReadingBookPicker.css";

const STATUS_LABELS = {
  NOT_STARTED: "Не розпочато",
  READING: "Читаю",
  PAUSED: "Пауза",
  FINISHED: "Прочитано",
};

const STATUS_PRIORITY = {
  READING: 0,
  PAUSED: 1,
  NOT_STARTED: 2,
  FINISHED: 3,
};

const ReadingBookPicker = ({
  books = [],
  isLoading = false,
  onSelect,
  onClose,
}) => {
  const [search, setSearch] = useState("");

  const visibleBooks = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return [...books]
      .filter((book) => {
        if (!normalizedSearch) {
          return true;
        }

        const title = book.title?.toLowerCase() ?? "";
        const author = book.author?.toLowerCase() ?? "";

        return (
          title.includes(normalizedSearch) || author.includes(normalizedSearch)
        );
      })
      .sort((firstBook, secondBook) => {
        const firstStatus = STATUS_PRIORITY[firstBook.status] ?? 4;

        const secondStatus = STATUS_PRIORITY[secondBook.status] ?? 4;

        if (firstStatus !== secondStatus) {
          return firstStatus - secondStatus;
        }

        if (firstBook.status === "READING" || firstBook.status === "PAUSED") {
          const firstOrder = firstBook.readingOrder;
          const secondOrder = secondBook.readingOrder;

          const hasFirstOrder = firstOrder !== null && firstOrder !== undefined;

          const hasSecondOrder =
            secondOrder !== null && secondOrder !== undefined;

          if (hasFirstOrder && hasSecondOrder) {
            return firstOrder - secondOrder;
          }

          if (hasFirstOrder) {
            return -1;
          }

          if (hasSecondOrder) {
            return 1;
          }
        }

        return (firstBook.title ?? "").localeCompare(
          secondBook.title ?? "",
          "uk",
        );
      });
  }, [books, search]);

  const getProgressLabel = (book) => {
    if (book.progressMode === "PERCENT") {
      return `${Math.round(book.currentPercent ?? 0)}%`;
    }

    if (book.pages) {
      return `${book.currentPage ?? 0} / ${book.pages} стор.`;
    }

    return `${book.currentPage ?? 0} стор.`;
  };

  const getProgressPercent = (book) => {
    if (book.progressMode === "PERCENT") {
      return Math.min(100, Math.max(0, book.currentPercent ?? 0));
    }

    if (!book.pages) {
      return 0;
    }

    return Math.min(
      100,
      Math.max(0, ((book.currentPage ?? 0) / book.pages) * 100),
    );
  };

  return (
    <Modal
      isOpen
      onClose={onClose}
      eyebrow="Читалка"
      title="Оберіть книгу"
      subtitle="Яку книгу хочете відкрити для читання?"
      className="reading-book-picker-modal"
    >
      {!isLoading && books.length > 0 && (
        <label className="reading-book-picker__search">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-4-4" />
          </svg>

          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Пошук книги..."
            autoComplete="off"
          />
        </label>
      )}

      <div className="reading-book-picker__content">
        {isLoading ? (
          <div className="reading-book-picker__message">
            Завантаження книг...
          </div>
        ) : books.length === 0 ? (
          <div className="reading-book-picker__empty">
            <span className="reading-book-picker__empty-icon">📖</span>

            <strong>У цій бібліотеці немає книг</strong>

            <p>Додайте книгу до бібліотеки, щоб відкрити її у читалці.</p>
          </div>
        ) : visibleBooks.length === 0 ? (
          <div className="reading-book-picker__message">Нічого не знайдено</div>
        ) : (
          <div className="reading-book-picker__list">
            {visibleBooks.map((book) => {
              const progressLabel = getProgressLabel(book);

              const progressPercent = getProgressPercent(book);

              const isReading = book.status === "READING";

              return (
                <button
                  key={book.id}
                  type="button"
                  className={`reading-book-picker__book ${
                    isReading ? "reading-book-picker__book--reading" : ""
                  }`}
                  onClick={() => onSelect(book)}
                >
                  <div className="reading-book-picker__cover">
                    {book.coverUrl ? (
                      <img src={book.coverUrl} alt={book.title} />
                    ) : (
                      <div className="reading-book-picker__cover-placeholder">
                        📚
                      </div>
                    )}

                    {isReading && (
                      <span className="reading-book-picker__reading-badge">
                        Читаю
                      </span>
                    )}
                  </div>

                  <div className="reading-book-picker__book-info">
                    <strong className="reading-book-picker__book-title">
                      {book.title}
                    </strong>

                    {book.author && (
                      <span className="reading-book-picker__author">
                        {book.author}
                      </span>
                    )}

                    <div className="reading-book-picker__meta">
                      <span>
                        {STATUS_LABELS[book.status] ?? "Не розпочато"}
                      </span>

                      <span>{progressLabel}</span>
                    </div>

                    {isReading && (
                      <div className="reading-book-picker__progress">
                        <span
                          style={{
                            width: `${progressPercent}%`,
                          }}
                        />
                      </div>
                    )}
                  </div>

                  <span
                    className="reading-book-picker__arrow"
                    aria-hidden="true"
                  >
                    ›
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </Modal>
  );
};

export default ReadingBookPicker;
