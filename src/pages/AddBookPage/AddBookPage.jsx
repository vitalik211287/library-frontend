import { useCallback, useEffect, useRef, useState } from "react";

import toast from "react-hot-toast";

import BarcodeScanner from "../../components/BarcodeScanner/BarcodeScanner.jsx";

import IsbnSearch from "./components/IsbnSearch/IsbnSearch.jsx";
import BookPreview from "./components/BookPreview/BookPreview.jsx";
import ManualBookForm from "./components/ManualBookForm/ManualBookForm.jsx";

import useBookLookup from "./hooks/useBookLookup.js";
import useAddBook from "./hooks/useAddBook.js";

import { isValidIsbnLength, normalizeIsbn } from "./utils/bookHelpers.js";

import "./AddBookPage.css";

const AddBookPage = () => {
  const [isbn, setIsbn] = useState("");

  const [book, setBook] = useState(null);

  const [manualMode, setManualMode] = useState(false);

  const [scannerOpen, setScannerOpen] = useState(false);

  const isbnInputRef = useRef(null);

  const focusIsbnInput = useCallback(() => {
    requestAnimationFrame(() => {
      isbnInputRef.current?.focus();
    });
  }, []);

  useEffect(() => {
    focusIsbnInput();
  }, [focusIsbnInput]);

  /* =========================
     ПОШУК КНИГИ
  ========================= */

  const { isSearching, lookupBook, resetLastSearch } = useBookLookup({
    isbn,
    setIsbn,
    book,
    setBook,
    focusIsbnInput,
  });

  /* =========================
     ДОДАВАННЯ КНИГИ
  ========================= */

  const { addFoundBook, addManualBook } = useAddBook({
    book,
    setBook,
    setIsbn,
    setManualMode,
    resetLastSearch,
    focusIsbnInput,
  });

  /* =========================
     ISBN
  ========================= */

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (isSearching) {
      return;
    }

    resetLastSearch();

    await lookupBook(isbn);
  };

  const handleIsbnChange = (event) => {
    const cleanValue = normalizeIsbn(event.target.value);

    resetLastSearch();

    setIsbn(cleanValue);
  };

  /* =========================
     СКАНЕР
  ========================= */

  const handleScan = (scannedValue) => {
    const cleanIsbn = normalizeIsbn(scannedValue);

    if (!isValidIsbnLength(cleanIsbn)) {
      toast.error("Не вдалося розпізнати ISBN", {
        id: "scanner-invalid-isbn",
      });

      return;
    }

    resetLastSearch();

    setIsbn(cleanIsbn);

    setScannerOpen(false);
  };

  const handleCloseScanner = () => {
    setScannerOpen(false);

    focusIsbnInput();
  };

  /* =========================
     RENDER
  ========================= */

  return (
    <div className="add-book-page">
      <h1>Додати книгу</h1>

      <IsbnSearch
        isbn={isbn}
        isSearching={isSearching}
        isbnInputRef={isbnInputRef}
        onIsbnChange={handleIsbnChange}
        onSubmit={handleSubmit}
        onOpenScanner={() => setScannerOpen(true)}
      />

      <BookPreview book={book} setBook={setBook} onAddBook={addFoundBook} />

      <button
        className="manual-toggle"
        type="button"
        onClick={() => setManualMode((current) => !current)}
      >
        {manualMode ? "Закрити ручне додавання" : "Додати вручну"}
      </button>

      {manualMode && (
        <ManualBookForm
          isbn={isbn}
          onIsbnChange={handleIsbnChange}
          onSubmit={addManualBook}
        />
      )}

      {scannerOpen && (
        <BarcodeScanner onScan={handleScan} onClose={handleCloseScanner} />
      )}
    </div>
  );
};

export default AddBookPage;
