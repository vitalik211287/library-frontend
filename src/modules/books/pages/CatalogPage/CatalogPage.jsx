import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import EditBookModal from "../../components/EditBookModal/EditBookModal";
import BarcodeScanner from "../../components/BarcodeScanner/BarcodeScanner";

import { useAuth } from "../../../auth/context/AuthContext.jsx";
import { useLibrary } from "../../../libraries/context/LibraryContext.jsx";

import useCatalogBooks from "./hooks/useCatalogBooks.js";
import { filterCatalogBooks } from "./utils/catalogHelpers.js";
import { groupBooksByGenre } from "./utils/genreHelpers.js";

import CatalogSearch from "./components/CatalogSearch/CatalogSearch.jsx";
import BookCard from "./components/BookCard/BookCard.jsx";
import GenreShelves from "./components/GenreShelves/GenreShelves.jsx";

import "./CatalogPage.css";

const CatalogPage = () => {
  const [search, setSearch] = useState("");
  const [searchBy, setSearchBy] = useState("all");
  const [editingBook, setEditingBook] = useState(null);
  const [scannerOpen, setScannerOpen] = useState(false);

  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const searchInputRef = useRef(null);
  const catalogTopRef = useRef(null);

  const { isAuthenticated, isAuthLoading } = useAuth();
  const { activeLibrary, activeLibraryId } = useLibrary();

  const viewMode = searchParams.get("view") ?? "shelves";
  const selectedShelf = searchParams.get("shelf");

  const canEditLibrary =
    activeLibrary?.role === "OWNER" ||
    activeLibrary?.role === "ADMIN";

  const {
    books,
    message,
    wishlistLoadingId,
    toggleWishlist,
    updateBook,
  } = useCatalogBooks();

  useEffect(() => {
    searchInputRef.current?.focus();
  }, []);

  useEffect(() => {
    const handleLibraryBookUpdated = (event) => {
      const updatedBook = event.detail;

      if (!updatedBook?.id) {
        return;
      }

      updateBook(updatedBook);
    };

    window.addEventListener(
      "library-book-updated",
      handleLibraryBookUpdated,
    );

    return () => {
      window.removeEventListener(
        "library-book-updated",
        handleLibraryBookUpdated,
      );
    };
  }, [updateBook]);

  const genreShelves = useMemo(
    () => groupBooksByGenre(books),
    [books],
  );

  const shelfBooks = useMemo(() => {
    if (!selectedShelf) {
      return books;
    }

    const shelf = genreShelves.find(
      (item) => item.id === selectedShelf,
    );

    return shelf?.books ?? [];
  }, [books, genreShelves, selectedShelf]);

  const filteredBooks = useMemo(
    () =>
      filterCatalogBooks({
        books: shelfBooks,
        search,
        searchBy,
      }),
    [shelfBooks, search, searchBy],
  );

  const scrollToCatalogTop = () => {
    requestAnimationFrame(() => {
      catalogTopRef.current?.scrollIntoView({
        block: "start",
        behavior: "auto",
      });
    });
  };

  const handleViewModeChange = (mode) => {
    const params = new URLSearchParams(searchParams);

    params.set("view", mode);
    params.delete("shelf");

    setSearchParams(params, {
      replace: true,
    });

    scrollToCatalogTop();
  };

  const handleShelfSelect = (shelfId) => {
    const params = new URLSearchParams(searchParams);

    params.set("view", "shelves");
    params.set("shelf", shelfId);

    setSearchParams(params);

    scrollToCatalogTop();
  };

  const handleShelfBack = () => {
    navigate(-1);
  };

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

  const showShelves =
    viewMode === "shelves" &&
    !selectedShelf &&
    !search.trim();

  return (
    <div
      ref={catalogTopRef}
      className="catalog-page"
    >
      <h1>Каталог бібліотеки</h1>

      <p className="books-count">
        {activeLibrary
          ? `${activeLibrary.name}: ${books.length} книг`
          : `Книг у бібліотеці: ${books.length}`}
      </p>

      {message && (
        <p className="catalog-message">
          {message}
        </p>
      )}

      <div className="catalog-view-toggle">
        <button
          type="button"
          className={
            viewMode === "all"
              ? "catalog-view-toggle__button is-active"
              : "catalog-view-toggle__button"
          }
          onClick={() =>
            handleViewModeChange("all")
          }
        >
          Усі книги
        </button>

        <button
          type="button"
          className={
            viewMode === "shelves"
              ? "catalog-view-toggle__button is-active"
              : "catalog-view-toggle__button"
          }
          onClick={() =>
            handleViewModeChange("shelves")
          }
        >
          Полички
        </button>
      </div>

      <CatalogSearch
        search={search}
        searchBy={searchBy}
        searchInputRef={searchInputRef}
        onSearchChange={setSearch}
        onSearchByChange={setSearchBy}
        onOpenScanner={() =>
          setScannerOpen(true)
        }
      />

      {showShelves ? (
        <GenreShelves
          shelves={genreShelves}
          onSelect={handleShelfSelect}
        />
      ) : (
        <>
          {selectedShelf && (
            <button
              type="button"
              className="catalog-shelf-back"
              onClick={handleShelfBack}
            >
              ← Усі полички
            </button>
          )}

          <div className="books-grid">
            {filteredBooks.map((book) => (
              <BookCard
                key={book.id}
                book={book}
                isAuthenticated={isAuthenticated}
                isAuthLoading={isAuthLoading}
                wishlistLoadingId={
                  wishlistLoadingId
                }
                onWishlistToggle={
                  handleWishlistToggle
                }
                onEdit={setEditingBook}
                onRead={handleOpenReading}
                canEdit={canEditLibrary}
              />
            ))}
          </div>
        </>
      )}

      {editingBook && (
        <EditBookModal
          book={editingBook}
          activeLibraryId={activeLibraryId}
          onClose={() =>
            setEditingBook(null)
          }
          onUpdated={handleBookUpdated}
        />
      )}

      {scannerOpen && (
        <BarcodeScanner
          onScan={handleScan}
          onClose={() =>
            setScannerOpen(false)
          }
        />
      )}
    </div>
  );
};

export default CatalogPage;