import { useNavigate, useSearchParams } from "react-router-dom";

import BookCard from "../../../books/pages/CatalogPage/components/BookCard/BookCard.jsx";

import { useAuth } from "../../../auth/context/AuthContext.jsx";
import { useUserBooks } from "../../context/UserBooksContext.jsx";

import "./FinishedBooksPage.css";

const FinishedBooksPage = () => {
  const navigate = useNavigate();

  const [searchParams, setSearchParams] = useSearchParams();

  const { user, isAuthLoading } = useAuth();

  const {
    finishedBooks,
    finishedTotal,
    isFinishedBooksLoading,
    finishedBooksError,
  } = useUserBooks();

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

          <p className="books-count">{finishedTotal} книг</p>
        </div>
      </div>

      {isFinishedBooksLoading ? (
        <div className="catalog-message">Завантаження...</div>
      ) : finishedBooksError ? (
        <div className="catalog-message">{finishedBooksError}</div>
      ) : finishedBooks.length === 0 ? (
        <div className="catalog-message">Прочитаних книг поки немає</div>
      ) : (
        <div className="books-grid">
          {finishedBooks.map((book) => (
            <BookCard
              key={book.id}
              book={book}
              isAuthenticated={isAuthenticated}
              isAuthLoading={isAuthLoading}
              wishlistLoadingId={null}
              canEdit={false}
              showWishlist={false}
              onRead={handleRead}
            />
          ))}
        </div>
      )}
    </main>
  );
};

export default FinishedBooksPage;





