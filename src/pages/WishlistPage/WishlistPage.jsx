import { useNavigate, useSearchParams } from "react-router-dom";

import BookCard from "../CatalogPage/components/BookCard/BookCard.jsx";

import { useAuth } from "../../context/AuthContext.jsx";
import { useLibrary } from "../../context/LibraryContext.jsx";
import { useUserBooks } from "../../context/UserBooksContext.jsx";

import "./WishlistPage.css";

const WishlistPage = () => {
  const navigate = useNavigate();

  const [searchParams, setSearchParams] = useSearchParams();

  const { user, isAuthLoading } = useAuth();

  const { activeLibrary } = useLibrary();

  const {
    wishlistBooks,
    isWishlistLoading,
    wishlistError,
    wishlistLoadingId,
    removeFromWishlist,
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

  const handleWishlistToggle = async (book) => {
    await removeFromWishlist(book.id);
  };

  const handleEdit = (book) => {
    const libraryId = book.sourceLibrary?.id || activeLibrary?.id;

    if (!libraryId) {
      return;
    }

    navigate(`/library/${libraryId}/books/${book.id}/edit`);
  };

  return (
    <main className="wishlist-page">
      <div className="wishlist-page__header">
        <button
          type="button"
          className="wishlist-page__back"
          onClick={handleBack}
          aria-label="Назад"
        >
          ←
        </button>

        <div>
          <h1>Хочу прочитати</h1>

          <p className="books-count">{wishlistBooks.length} книг</p>
        </div>
      </div>

      {isWishlistLoading ? (
        <div className="catalog-message">Завантаження...</div>
      ) : wishlistError ? (
        <div className="catalog-message">{wishlistError}</div>
      ) : wishlistBooks.length === 0 ? (
        <div className="catalog-message">
          Список «Хочу прочитати» поки порожній
        </div>
      ) : (
        <div className="books-grid">
          {wishlistBooks.map((book) => (
            <BookCard
              key={book.id}
              book={book}
              isAuthenticated={isAuthenticated}
              isAuthLoading={isAuthLoading}
              wishlistLoadingId={wishlistLoadingId}
              canEdit={false}
              onWishlistToggle={handleWishlistToggle}
              onEdit={handleEdit}
              onRead={handleRead}
            />
          ))}
        </div>
      )}
    </main>
  );
};

export default WishlistPage;
