import { BookIcon } from "../HomeIcons.jsx";
import "./CurrentReading.css";

const CurrentReading = ({
  book,
  currentPage,
  totalPages,
  progress,
  onContinue,
}) => {
  return (
    <section className="home-panel current-reading-section">
      <div className="home-panel__header">
        <div>
          <span className="home-section__kicker">Зараз читаю</span>

          <h2>Поточна книга</h2>
        </div>

        {book && <span className="home-panel__badge">{progress}%</span>}
      </div>

      {!book ? (
        <div className="home-empty-state">
          <div className="home-empty-state__icon">
            <BookIcon />
          </div>

          <div>
            <strong>Немає активної книги</strong>

            <span>Обери книгу з бібліотеки, щоб продовжити читання.</span>
          </div>
        </div>
      ) : (
        <article className="current-reading-card">
          <div className="current-reading-card__main">
            <div className="current-reading-card__cover">
              {book.coverUrl ? (
                <img
                  src={book.coverUrl}
                  alt={book.title}
                  className="current-reading-card__cover-image"
                />
              ) : (
                <div className="current-reading-card__cover-placeholder">
                  <BookIcon />
                </div>
              )}
            </div>

            <div className="current-reading-card__content">
              <div>
                <h3>{book.title}</h3>

                <p className="current-reading-card__author">{book.author}</p>
              </div>

              <div className="current-reading-card__progress-info">
                <span>
                  {currentPage}

                  {totalPages ? ` / ${totalPages} стор.` : " стор."}
                </span>

                <strong>{progress}%</strong>
              </div>

              <div className="home-progress">
                <div
                  className="home-progress__bar"
                  style={{
                    width: `${progress}%`,
                  }}
                />
              </div>
            </div>
          </div>

          <button
            type="button"
            className="home-primary-button"
            onClick={onContinue}
          >
            <span aria-hidden="true">▶</span>
            Продовжити читання
          </button>
        </article>
      )}
    </section>
  );
};

export default CurrentReading;
