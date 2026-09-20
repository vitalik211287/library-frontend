import {
  lazy,
  Suspense,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import toast from "react-hot-toast";
import PageBackButton from "../../../../shared/components/PageBackButton/PageBackButton.jsx";
import Loader from "../../../../shared/components/Loader/Loader.jsx";

const BarcodeScanner = lazy(
  () => import("../../components/BarcodeScanner/BarcodeScanner.jsx"),
);
import { useLibrary } from "../../../libraries/context/LibraryContext.jsx";

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
  const [coverFile, setCoverFile] = useState(null);
  const [manualMode, setManualMode] = useState(false);
  const [scannerOpen, setScannerOpen] = useState(false);

  const isbnInputRef = useRef(null);

  const { activeLibraryId } = useLibrary();

  const focusIsbnInput = useCallback(() => {
    requestAnimationFrame(() => {
      isbnInputRef.current?.focus();
    });
  }, []);

  useEffect(() => {
    focusIsbnInput();
  }, [focusIsbnInput]);

  const { isSearching, lookupBook, resetLastSearch } = useBookLookup({
    setIsbn,
    setBook,
    focusIsbnInput,
  });

  const { isAdding, addFoundBook, addManualBook } = useAddBook({
    book,
    setBook,
    coverFile,
    setCoverFile,
    setIsbn,
    setManualMode,
    resetLastSearch,
    focusIsbnInput,
    activeLibraryId,
  });

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (isSearching) {
      return;
    }

    setCoverFile(null);
    await lookupBook(isbn);
  };

  const handleIsbnChange = (event) => {
    const cleanValue = normalizeIsbn(event.target.value);
    setIsbn(cleanValue);
  };

  const handleScan = async (scannedValue) => {
    const cleanIsbn = normalizeIsbn(scannedValue);

    if (!isValidIsbnLength(cleanIsbn)) {
      toast.error("Не вдалося розпізнати ISBN", {
        id: "scanner-invalid-isbn",
      });
      return;
    }

    setScannerOpen(false);
    setIsbn(cleanIsbn);
    setCoverFile(null);
    await lookupBook(cleanIsbn);
  };

  const handleCloseScanner = () => {
    setScannerOpen(false);
    focusIsbnInput();
  };

  return (
    <main className="add-book-page">
      <PageBackButton label="Додати книгу" />
      <h1>Додати книгу</h1>

      <IsbnSearch
        isbn={isbn}
        isSearching={isSearching}
        isbnInputRef={isbnInputRef}
        onIsbnChange={handleIsbnChange}
        onSubmit={handleSubmit}
        onOpenScanner={() => setScannerOpen(true)}
      />

      {isSearching && <Loader text="Шукаємо книгу…" />}

      {isAdding && <Loader text="Додаємо до бібліотеки…" />}

      <BookPreview
        book={book}
        setBook={setBook}
        coverFile={coverFile}
        setCoverFile={setCoverFile}
        onAddBook={addFoundBook}
      />

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
        <Suspense fallback={null}>
          <BarcodeScanner onScan={handleScan} onClose={handleCloseScanner} />
        </Suspense>
      )}
    </main>
  );
};

export default AddBookPage;
