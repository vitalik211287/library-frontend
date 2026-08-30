import { useEffect, useState } from "react";

import "./WishlistSection.css";

const API_URL = "https://library-backend-production-5d60.up.railway.app";

const ArrowIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="m9 6 6 6-6 6" />
  </svg>
);

const BookmarkIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M6 4.5A1.5 1.5 0 0 1 7.5 3h9A1.5 1.5 0 0 1 18 4.5V21l-6-4-6 4V4.5Z" />
  </svg>
);

const WishlistSection = ({ onCountChange }) => {
  const [books, setBooks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadWishlist = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        setIsLoading(false);
        onCountChange?.(0);
        return;
      }

      try {
        setIsLoading(true);
        setError("");

        const response = await fetch(
          `${API_URL}/api/user-books/wishlist`,
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
        const items = Array.isArray(data.books) ? data.books : [];

        setBooks(items);
        onCountChange?.(Number(data.count) || items.length);
      } catch (loadError) {
        console.error("Load wishlist error:", loadError);

        setError("Не вдалося завантажити список");
        onCountChange?.(0);
      } finally {
        setIsLoading(false);
      }
    };

    loadWishlist();
  }, [onCountChange]);

  const handleRemoveFromWishlist = async (bookId) => {
    const token = localStorage.getItem("token");

    if (!token || !bookId) {
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/api/user-books/${bookId}/wishlist`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!response.ok) {
        throw new Error(
          "Не вдалося прибрати книгу зі списку бажань",
        );
      }

      setBooks((currentBooks) => {
        const nextBooks = currentBooks.filter(
          ({ book }) => book.id !== bookId,
        );

        onCountChange?.(nextBooks.length);

        return nextBooks;
      });
    } catch (removeError) {
      console.error(
        "Remove wishlist error:",
        removeError,
      );
    }
  };

  return (
    <section className="profile-section">
      <div className="profile-section__header">
        <h2>Хочу прочитати</h2>

        {books.length > 0 && (
          <button type="button">
            Переглянути всі
            <ArrowIcon />
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
      ) : books.length === 0 ? (
        <div className="profile-empty">
          Список поки порожній
        </div>
      ) : (
        <div className="profile-books">
          {books.map(({ book, userBook }) => (
            <article
              className="profile-book"
              key={userBook.id}
            >
              <div className="profile-book__cover">
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

                <button
                  type="button"
                  className="profile-book__bookmark"
                  onClick={() =>
                    handleRemoveFromWishlist(
                      book.id,
                    )
                  }
                  aria-label="Прибрати зі списку бажань"
                  title="Прибрати зі списку бажань"
                >
                  <BookmarkIcon />
                </button>
              </div>

              <h3>{book.title}</h3>
              <p>{book.author}</p>
            </article>
          ))}
        </div>
      )}
    </section>
  );
};

export default WishlistSection;
