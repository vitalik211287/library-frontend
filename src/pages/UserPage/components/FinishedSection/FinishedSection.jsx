import { useEffect, useState } from "react";

import "./FinishedSection.css";

const API_URL = "https://library-backend-production-5d60.up.railway.app";

const ArrowIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="m9 6 6 6-6 6" />
  </svg>
);

const FinishedSection = ({ readingBookId, onCountChange }) => {
  const [books, setBooks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadFinishedBooks = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        setIsLoading(false);
        onCountChange?.(0);
        return;
      }

      try {
        setIsLoading(true);
        setError("");

        const response = await fetch(`${API_URL}/api/user-books/finished`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error();
        }

        const data = await response.json();
        const items = Array.isArray(data.books) ? data.books : [];

        setBooks(items);
        onCountChange?.(Number(data.count) || items.length);
      } catch (loadError) {
        console.error("Load finished error:", loadError);

        setError("Не вдалося завантажити прочитані книги");

        onCountChange?.(0);
      } finally {
        setIsLoading(false);
      }
    };

    loadFinishedBooks();
  }, [readingBookId, onCountChange]);

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
          {books.map(({ book, userBook }) => (
            <article className="profile-book" key={userBook.id}>
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

              {userBook.rating && (
                <div className="profile-book__rating">
                  {"★".repeat(userBook.rating)}
                </div>
              )}
            </article>
          ))}
        </div>
      )}
    </section>
  );
};

export default FinishedSection;
