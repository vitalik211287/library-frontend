import { useNavigate } from "react-router-dom";
import { FinishedBookIcon } from "../../../../../home/components/HomeIcons.jsx";

import "./FinishedSection.css";

const ArrowIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="m9 6 6 6-6 6" />
  </svg>
);

const FinishedSection = ({
  books = [],
  isLoading = false,
  error = "",
  onOpenReading,
}) => {
  const navigate = useNavigate();

  const handleOpenAll = () => {
    navigate("/finished");

    requestAnimationFrame(() => {
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: "auto",
      });
    });
  };

  const handleOpenBook = (book) => {
    if (!book?.id) {
      return;
    }

    onOpenReading?.(
      book.id,
      book.sourceLibrary?.id ?? null,
    );
  };

  return (
    <section className="profile-section profile-section--books">
      <div className="profile-section__header">
        <h2>Прочитано</h2>

        {books.length > 0 && (
          <button type="button" onClick={handleOpenAll}>
            Переглянути всі
            <ArrowIcon />
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="profile-empty">Завантаження...</div>
      ) : error ? (
        <div className="profile-empty">{error}</div>
      ) : books.length === 0 ? (
        <div className="home-empty-state">
          <div className="home-empty-state__icon">
            <FinishedBookIcon />
          </div>

          <div>
            <strong>Тут з’являться прочитані книги</strong>
            <span>Завершуй читання та відмічай книги як прочитані, щоб бачити їх тут.</span>
          </div>
        </div>
      ) : (
        <div className="profile-books">
          {books.slice(0, 3).map((book) => (
            <article className="profile-book" key={book.id}>
              <button
                type="button"
                className="profile-book__open"
                onClick={() => handleOpenBook(book)}
                aria-label={`Відкрити книгу «${book.title}»`}
                title="Відкрити книгу"
              >
                <div className="profile-book__cover">
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
              </button>
                <button
                  type="button"
                  className="finished-book__title-button"
                  onClick={() => handleOpenBook(book)}
                >
                  {book.title}
                </button>
              <p>{book.author}</p>

              {book.rating ? (
                <div className="profile-book__rating">
                  {"★".repeat(
                    Math.min(5, Math.max(0, Number(book.rating) || 0)),
                  )}
                </div>
              ) : null}
            </article>
          ))}
        </div>
      )}
    </section>
  );
};

export default FinishedSection;

