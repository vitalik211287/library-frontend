import "./FinishedSection.css";

const ArrowIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="m9 6 6 6-6 6" />
  </svg>
);

const FinishedSection = ({ books, isLoading, error }) => {
  return (
    <section className="profile-section">
      <div className="profile-section__header">
        <h2>Прочитано</h2>

        {books.length > 0 && (
          <button type="button">
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
          {books.map((book) => (
            <article className="profile-book" key={book.id}>
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

              <h3>{book.title}</h3>

              <p>{book.author}</p>

              {book.rating ? (
                <div className="profile-book__rating">
                  {"★".repeat(book.rating)}
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
