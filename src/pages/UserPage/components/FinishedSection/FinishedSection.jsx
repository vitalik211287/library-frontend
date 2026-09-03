import { useNavigate, useSearchParams } from "react-router-dom";

import "./FinishedSection.css";

const ArrowIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="m9 6 6 6-6 6" />
  </svg>
);

const FinishedSection = ({ books = [], isLoading = false, error = "" }) => {
  const navigate = useNavigate();

  const [searchParams, setSearchParams] = useSearchParams();

  const handleOpenAll = () => {
    navigate("/finished");
  };

  const handleOpenBook = (book) => {
    if (!book?.id) {
      return;
    }

    const params = new URLSearchParams(searchParams);

    params.set("reading", book.id);

    if (book.sourceLibrary?.id) {
      params.set("readingLibrary", book.sourceLibrary.id);
    } else {
      params.delete("readingLibrary");
    }

    setSearchParams(params);
  };

  return (
    <section className="profile-section">
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
        <div className="profile-empty">Тут з’являться прочитані книги</div>
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

              <h3>
                <button
                  type="button"
                  className="profile-book__title-button"
                  onClick={() => handleOpenBook(book)}
                >
                  {book.title}
                </button>
              </h3>

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
