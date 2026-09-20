import Icon from "../../Icon/Icon.jsx";

import { getProgress, getProgressLabel } from "../utils/rightSidebarHelpers.js";

const CurrentReadingWidget = ({ currentBooks, isLoading, onOpenReading }) => {
  const mainCurrentBook = currentBooks[0] ?? null;
  const currentProgress = getProgress(mainCurrentBook);

  return (
    <section className="right-widget">
      <div className="right-widget__header">
        <div className="right-widget__title">
          <Icon name="reading" />
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
              <img src={mainCurrentBook.coverUrl} alt={mainCurrentBook.title} decoding="async" />
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
                <span style={{ width: `${currentProgress}%` }} />
              </div>
              <strong>{currentProgress}%</strong>
            </div>

            <span className="right-current__page">
              {getProgressLabel(mainCurrentBook)}
            </span>

            <button
              type="button"
              className="right-current__button"
              onClick={() => onOpenReading(mainCurrentBook.id)}
            >
              Продовжити
              <Icon name="chevron-right" />
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
                onClick={() => onOpenReading(book.id)}
              >
                <div className="right-current-mini__cover">
                  {book.coverUrl ? (
                    <img src={book.coverUrl} alt={book.title} loading="lazy" decoding="async" />
                  ) : (
                    <div className="right-no-cover">—</div>
                  )}
                </div>

                <div className="right-current-mini__content">
                  <strong>{book.title}</strong>
                  <div className="right-current-mini__progress">
                    <span style={{ width: `${progress}%` }} />
                  </div>
                </div>

                <span className="right-current-mini__percent">{progress}%</span>
              </button>
            );
          })}
        </div>
      )}
    </section>
  );
};

export default CurrentReadingWidget;
