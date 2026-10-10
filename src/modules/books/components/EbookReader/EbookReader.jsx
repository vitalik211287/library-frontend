import { lazy, Suspense, useCallback, useEffect, useState } from "react";

import Modal from "../../../../shared/components/Modal/Modal.jsx";
import Loader from "../../../../shared/components/Loader/Loader.jsx";
import { downloadBookFile } from "../../api/bookFilesApi.js";

import Icon from "../../../../shared/components/Icon/Icon.jsx";
import ReadingSessionsModal from "../../../reading/components/ReadingModal/components/ReadingSessionsModal/ReadingSessionsModal.jsx";
import useRefreshReadingData from "../../../reading/hooks/useRefreshReadingData.js";
import EbookReaderStatsPanel from "./EbookReaderStatsPanel.jsx";

import "./EbookReader.css";

const EpubReader = lazy(() =>
  import("./EpubReader/EpubReader.jsx")
);

const EbookReader = ({ file, book, libraryId, onClose, locationKey, onLocationChange, onReadingAdvance, onReady }) => {
  const [blob, setBlob] = useState(null);
  const [error, setError] = useState("");
  const [statsOpen, setStatsOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [epubPercent, setEpubPercent] = useState(null);
  const refreshReadingData = useRefreshReadingData();

  const handleCloseReader = useCallback(() => {
    if (historyOpen) return;
    if (statsOpen) {
      setStatsOpen(false);
      return;
    }
    onClose();
  }, [historyOpen, statsOpen, onClose]);
  const [readerTheme, setReaderTheme] = useState(
    () => localStorage.getItem("ebook-reader-theme") === "dark" ? "dark" : "light"
  );

  useEffect(() => {
    localStorage.setItem("ebook-reader-theme", readerTheme);
  }, [readerTheme]);

  useEffect(() => {
    let active = true;

    setBlob(null);
    setError("");

    downloadBookFile(libraryId, book.id, file.id)
      .then((data) => {
        if (active) setBlob(data);
      })
      .catch((err) => {
        if (active) {
          setError(err.message || "Не вдалося завантажити книгу");
        }
      });

    return () => {
      active = false;
    };
  }, [libraryId, book.id, file.id]);

  return (
    <>
    <Modal
      isOpen
      onClose={handleCloseReader}
      showHeader={false}
      ariaLabel={`Читалка: ${book.title}`}
      className="ebook-reader-modal"
      closeOnEscape={!historyOpen}
      closeOnBackdrop={!historyOpen}
    >
      <div className="ebook-reader__toolbar">
        <button
          type="button"
          className="ebook-reader__stats-toggle"
          onClick={() => setStatsOpen((open) => !open)}
          aria-label="Статистика читання"
          title="Статистика читання"
          aria-expanded={statsOpen}
        >
          <Icon name="stats" />
        </button>
        {file.format === "EPUB" && (
          <button
            type="button"
            className="ebook-reader__theme-toggle"
            onClick={() =>
              setReaderTheme((current) =>
                current === "light" ? "dark" : "light"
              )
            }
            aria-label={
              readerTheme === "light" ? "Увімкнути темну тему" : "Увімкнути світлу тему"
            }
            title={
              readerTheme === "light" ? "Темна тема" : "Світла тема"
            }
          >
            <span aria-hidden="true">{readerTheme === "light" ? "☾" : "☀"}</span>
          </button>
        )}
        <button
          type="button"
          className="ebook-reader__close"
          onClick={handleCloseReader}
          aria-label="Закрити читалку"
          title="Закрити"
        >
          <svg className="ebook-reader__close-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>
      </div>
      <div className="ebook-reader__content">
        {error ? (
          <p role="alert">{error}</p>
        ) : !blob ? (
          <Loader text="Відкриваємо книгу..." />
        ) : file.format === "EPUB" ? (
          <Suspense fallback={<Loader text="Завантажуємо читалку..." />}>
            <EpubReader
              blob={blob}
              readerTheme={readerTheme}
              locationKey={locationKey}
              onLocationChange={(nextPercent) => {
                setEpubPercent(nextPercent);
                onLocationChange?.(nextPercent);
              }}
              onReadingAdvance={onReadingAdvance}
              onReady={onReady}
            />
          </Suspense>
        ) : (
          <p>Читалка для цього формату ще розробляється.</p>
        )}
      </div>
      {statsOpen && (
        <EbookReaderStatsPanel
          bookId={book.id}
          bookTitle={book.title}
          currentPercent={epubPercent}
          onClose={() => setStatsOpen(false)}
          onOpenHistory={() => {
            setStatsOpen(false);
            setHistoryOpen(true);
          }}
        />
      )}
    </Modal>
    {historyOpen && (
      <ReadingSessionsModal
        bookId={book.id}
        totalPages={book.pages}
        onClose={() => {
          setHistoryOpen(false);
          setStatsOpen(true);
        }}
        onChanged={refreshReadingData}
      />
    )}
    </>
  );
};

export default EbookReader;
