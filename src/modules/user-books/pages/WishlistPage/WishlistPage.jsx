import { useNavigate } from "react-router-dom";

import BookCard from "../../../books/pages/CatalogPage/components/BookCard/BookCard.jsx";

import { useAuth } from "../../../auth/context/AuthContext.jsx";
import { useLibrary } from "../../../libraries/context/LibraryContext.jsx";
import { useUserBooks } from "../../context/UserBooksContext.jsx";

import "./WishlistPage.css";

const WishlistPage = ({ onOpenReading }) => {
  const navigate = useNavigate();

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

    onOpenReading?.(
      book.id,
      book.sourceLibrary?.id ?? null,
    );
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






