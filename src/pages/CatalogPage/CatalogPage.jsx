import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import EditBookModal from "../../components/EditBookModal/EditBookModal";
import BarcodeScanner from "../../components/BarcodeScanner/BarcodeScanner";

import { useAuth } from "../../context/AuthContext.jsx";
import { useLibrary } from "../../context/LibraryContext.jsx";

import useCatalogBooks from "./hooks/useCatalogBooks.js";
import { filterCatalogBooks } from "./utils/catalogHelpers.js";

import CatalogSearch from "./components/CatalogSearch/CatalogSearch.jsx";
import BookCard from "./components/BookCard/BookCard.jsx";

import "./CatalogPage.css";

const CatalogPage = () => {
  const [search, setSearch] = useState("");
  const [searchBy, setSearchBy] = useState("title");
  const [editingBook, setEditingBook] = useState(null);
  const [scannerOpen, setScannerOpen] = useState(false);

  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const searchInputRef = useRef(null);

  const { isAuthenticated, isAuthLoading } = useAuth();
  const { activeLibrary, activeLibraryId, isLibrariesLoading } = useLibrary();

  const canEditLibrary =
    activeLibrary?.role === "OWNER" || activeLibrary?.role === "ADMIN";
  const { books, message, wishlistLoadingId, toggleWishlist, updateBook } =
    useCatalogBooks({
      isAuthenticated,
      isAuthLoading,
      activeLibraryId,
      isLibrariesLoading,
    });

  useEffect(() => {
    searchInputRef.current?.focus();
  }, []);

  const filteredBooks = useMemo(
    () =>
      filterCatalogBooks({
        books,
        search,
        searchBy,
      }),
    [books, search, searchBy],
  );

  const handleScan = (isbn) => {
    setSearchBy("isbn");
    setSearch(isbn);
    setScannerOpen(false);
  };

  const handleBookUpdated = (updatedBook) => {
    updateBook(updatedBook);
    setEditingBook(null);
  };

  const handleWishlistToggle = async (book) => {
    if (isAuthLoading) {
      return;
    }

    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    await toggleWishlist(book);
  };

  const handleOpenReading = (book) => {
    if (isAuthLoading) {
      return;
    }

    if (!isAuthenticated) {
      navigate("/login", {
        state: {
          from: `/catalog?reading=${book.id}`,
        },
      });
      return;
    }

    const params = new URLSearchParams(searchParams);
    params.set("reading", book.id);
    setSearchParams(params);
  };

  return (
    <div className="catalog-page">
      <h1>Каталог бібліотеки</h1>

      <p className="books-count">
        {activeLibrary
          ? `${activeLibrary.name}: ${books.length} книг`
          : `Книг у бібліотеці: ${books.length}`}
      </p>

      {message && <p className="catalog-message">{message}</p>}

      <CatalogSearch
        search={search}
        searchBy={searchBy}
        searchInputRef={searchInputRef}
        onSearchChange={setSearch}
        onSearchByChange={setSearchBy}
        onOpenScanner={() => setScannerOpen(true)}
      />

      <div className="books-grid">
        {filteredBooks.map((book) => (
          <BookCard
            key={book.id}
            book={book}
            isAuthenticated={isAuthenticated}
            isAuthLoading={isAuthLoading}
            wishlistLoadingId={wishlistLoadingId}
            onWishlistToggle={handleWishlistToggle}
            onEdit={setEditingBook}
            onRead={handleOpenReading}
            canEdit={canEditLibrary}
          />
        ))}
      </div>

      {editingBook && (
        <EditBookModal
          book={editingBook}
          activeLibraryId={activeLibraryId}
          onClose={() => setEditingBook(null)}
          onUpdated={handleBookUpdated}
        />
      )}

      {scannerOpen && (
        <BarcodeScanner
          onScan={handleScan}
          onClose={() => setScannerOpen(false)}
        />
      )}
    </div>
  );
};

export default CatalogPage;
