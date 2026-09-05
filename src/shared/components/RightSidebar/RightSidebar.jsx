import { useMemo } from "react";

import { useSearchParams } from "react-router-dom";

import useRightSidebarData from "./hooks/useRightSidebarData.js";

import "./RightSidebar.css";

/* =========================
   ICONS
========================= */

const BookIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H11a2 2 0 0 1 2 2v16a2 2 0 0 0-2-2H6.5A2.5 2.5 0 0 0 4 21.5v-16Z" />

    <path d="M20 5.5A2.5 2.5 0 0 0 17.5 3H13v18a2 2 0 0 1 2-2h2.5a2.5 2.5 0 0 1 2.5 2.5v-16Z" />
  </svg>
);

const BookmarkIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M6 4.5A1.5 1.5 0 0 1 7.5 3h9A1.5 1.5 0 0 1 18 4.5V21l-6-4-6 4V4.5Z" />
  </svg>
);

const CheckIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <circle cx="12" cy="12" r="9" />

    <path d="m8 12 2.5 2.5L16 9" />
  </svg>
);

const ReadingIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M3.5 5.5A2.5 2.5 0 0 1 6 3h4a2 2 0 0 1 2 2v15a2 2 0 0 0-2-2H6a2.5 2.5 0 0 0-2.5 2.5v-15Z" />

    <path d="M20.5 5.5A2.5 2.5 0 0 0 18 3h-4a2 2 0 0 0-2 2v15a2 2 0 0 1 2-2h4a2.5 2.5 0 0 1 2.5 2.5v-15Z" />
  </svg>
);

const ClockIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <circle cx="12" cy="12" r="9" />

    <path d="M12 7v5l3 2" />
  </svg>
);

const ArrowIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="m9 6 6 6-6 6" />
  </svg>
);

/* =========================
   HELPERS
========================= */

const getProgress = (book) => {
  if (!book) {
    return 0;
  }

  if (book.progressMode === "PERCENT") {
    return Math.min(Math.max(Number(book.currentPercent ?? 0), 0), 100);
  }

  const currentPage = Number(book.currentPage ?? 0);

  const totalPages = Number(book.pages ?? 0);

  if (!totalPages || totalPages <= 0) {
    return 0;
  }

  return Math.min(
    Math.max(Math.round((currentPage / totalPages) * 100), 0),
    100,
  );
};

const getProgressLabel = (book) => {
  if (!book) {
    return "";
  }

  if (book.progressMode === "PERCENT") {
    return `${book.currentPercent ?? 0}%`;
  }

  if (book.pages) {
    return `Сторінка ${book.currentPage ?? 0} з ${book.pages}`;
  }

  return `Сторінка ${book.currentPage ?? 0}`;
};

/* =========================
   COMPONENT
========================= */

const RightSidebar = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const { currentBooks, wishlistCount, finishedCount, isLoading } =
    useRightSidebarData();

  const mainCurrentBook = currentBooks[0] ?? null;

  const currentProgress = useMemo(
    () => getProgress(mainCurrentBook),
    [mainCurrentBook],
  );

  const handleOpenReading = (bookId) => {
    if (!bookId) {
      return;
    }

    const params = new URLSearchParams(searchParams);

    params.set("reading", bookId);

    setSearchParams(params);
  };

  return (
    <aside className="right-sidebar">
      {/* =====================
          CURRENT READING
      ===================== */}

      <section className="right-widget">
        <div className="right-widget__header">
          <div className="right-widget__title">
            <ReadingIcon />

            <h2>Зараз читаю</h2>
          </div>

          {currentBooks.length > 1 && (
            <span className="right-widget__count">{currentBooks.length}</span>
          )}
        </div>

        {isLoading ? (
          <div className="right-sidebar__empty">Завантаження...</div>
        ) : !mainCurrentBook ? (
          <div className="right-sidebar__empty">Немає активного читання</div>
        ) : (
          <div className="right-current">
            <div className="right-current__cover">
              {mainCurrentBook.coverUrl ? (
                <img
                  src={mainCurrentBook.coverUrl}
                  alt={mainCurrentBook.title}
                />
              ) : (
                <div className="right-no-cover">
                  Немає
                  <br />
                  обкладинки
                </div>
              )}
            </div>

            <div className="right-current__content">
              <h3>{mainCurrentBook.title}</h3>

              <p>{mainCurrentBook.author}</p>

              <div className="right-current__progress-row">
                <div className="right-current__progress">
                  <span
                    style={{
                      width: `${currentProgress}%`,
                    }}
                  />
                </div>

                <strong>{currentProgress}%</strong>
              </div>

              <span className="right-current__page">
                {getProgressLabel(mainCurrentBook)}
              </span>

              <button
                type="button"
                className="right-current__button"
                onClick={() => handleOpenReading(mainCurrentBook.id)}
              >
                Продовжити
                <ArrowIcon />
              </button>
            </div>
          </div>
        )}

        {currentBooks.length > 1 && (
          <div className="right-current-list">
            {currentBooks.slice(1, 4).map((book) => {
              const progress = getProgress(book);

              return (
                <button
                  type="button"
                  className="right-current-mini"
                  key={book.id}
                  onClick={() => handleOpenReading(book.id)}
                >
                  <div className="right-current-mini__cover">
                    {book.coverUrl ? (
                      <img src={book.coverUrl} alt={book.title} />
                    ) : (
                      <div className="right-no-cover">—</div>
                    )}
                  </div>

                  <div className="right-current-mini__content">
                    <strong>{book.title}</strong>

                    <div className="right-current-mini__progress">
                      <span
                        style={{
                          width: `${progress}%`,
                        }}
                      />
                    </div>
                  </div>

                  <span className="right-current-mini__percent">
                    {progress}%
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </section>

      {/* =====================
          SHELVES
      ===================== */}

      <section className="right-widget">
        <div className="right-widget__header">
          <div className="right-widget__title">
            <BookIcon />

            <h2>Мої полиці</h2>
          </div>
        </div>

        <div className="right-shelves">
          <div className="right-shelf">
            <div className="right-shelf__icon">
              <ReadingIcon />
            </div>

            <div className="right-shelf__content">
              <span>Читаю зараз</span>

              <strong>{isLoading ? "..." : currentBooks.length}</strong>
            </div>
          </div>

          <div className="right-shelf">
            <div className="right-shelf__icon">
              <BookmarkIcon />
            </div>

            <div className="right-shelf__content">
              <span>Хочу прочитати</span>

              <strong>{isLoading ? "..." : wishlistCount}</strong>
            </div>
          </div>

          <div className="right-shelf">
            <div className="right-shelf__icon">
              <CheckIcon />
            </div>

            <div className="right-shelf__content">
              <span>Прочитано</span>

              <strong>{isLoading ? "..." : finishedCount}</strong>
            </div>
          </div>
        </div>
      </section>

      {/* =====================
          ACTIVITY
      ===================== */}

      <section className="right-widget">
        <div className="right-widget__header">
          <div className="right-widget__title">
            <ClockIcon />

            <h2>Активність</h2>
          </div>
        </div>

        <div className="right-activity">
          <div className="right-activity__item">
            <span>Активних книг</span>

            <strong>{isLoading ? "..." : currentBooks.length}</strong>
          </div>

          <div className="right-activity__divider" />

          <div className="right-activity__item">
            <span>Завершено</span>

            <strong>{isLoading ? "..." : finishedCount}</strong>
          </div>
        </div>

        <p className="right-widget__note">
          Детальна статистика читання з’явиться тут, коли підключимо дані сесій
          читання.
        </p>
      </section>

      {/* =====================
          REMINDERS
      ===================== */}

      <section className="right-widget">
        <div className="right-widget__header">
          <div className="right-widget__title">
            <ClockIcon />

            <h2>Нагадування</h2>
          </div>
        </div>

        <div className="right-reminder">
          <div className="right-reminder__icon">
            <BookIcon />
          </div>

          <div className="right-reminder__content">
            <strong>Продовжити читання</strong>

            <span>
              {mainCurrentBook ? mainCurrentBook.title : "Немає активної книги"}
            </span>
          </div>
        </div>
      </section>
    </aside>
  );
};

export default RightSidebar;

