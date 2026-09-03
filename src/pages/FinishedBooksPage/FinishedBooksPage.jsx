import { useNavigate, useSearchParams } from "react-router-dom";

import BookCard from "../CatalogPage/components/BookCard/BookCard.jsx";

import { useAuth } from "../../context/AuthContext.jsx";

import useFinishedBooks from "../UserPage/hooks/useFinishedBooks.js";

import "./FinishedBooksPage.css";

const FinishedBooksPage = () => {
  const navigate = useNavigate();

  const [searchParams, setSearchParams] = useSearchParams();

  const { user, isLoading: isAuthLoading } = useAuth();

  const { books, isLoading, error } = useFinishedBooks();

  const isAuthenticated = Boolean(user);

  const handleBack = () => {
    navigate("/account");
  };

  const handleRead = (book) => {
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
    <main className="finished-books-page">
      <div className="finished-books-page__header">
        <button
          type="button"
          className="finished-books-page__back"
          onClick={handleBack}
          aria-label="Назад"
        >
          ←
        </button>

        <div>
          <span className="finished-books-page__eyebrow">Бібліотека</span>

          <h1>Прочитано</h1>

          <p className="books-count">{books.length} книг</p>
        </div>
      </div>

      {isLoading ? (
        <div className="catalog-message">Завантаження...</div>
      ) : error ? (
        <div className="catalog-message">{error}</div>
      ) : books.length === 0 ? (
        <div className="catalog-message">Прочитаних книг поки немає</div>
      ) : (
        <div className="books-grid">
          {books.map((book) => (
            <BookCard
              key={book.id}
              book={book}
              isAuthenticated={isAuthenticated}
              isAuthLoading={isAuthLoading}
              wishlistLoadingId={null}
              canEdit={false}
              onWishlistToggle={() => {}}
              onEdit={() => {}}
              onRead={handleRead}
            />
          ))}
        </div>
      )}
    </main>
  );
};

export default FinishedBooksPage;
