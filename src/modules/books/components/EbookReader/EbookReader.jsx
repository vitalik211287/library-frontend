import { lazy, Suspense, useCallback, useEffect, useRef, useState } from "react";

import Modal from "../../../../shared/components/Modal/Modal.jsx";
import Loader from "../../../../shared/components/Loader/Loader.jsx";
import { downloadBookFile } from "../../api/bookFilesApi.js";
import { useAuth } from "../../../auth/context/AuthContext.jsx";
import { getOfflineEpub, saveOfflineEpub } from "../../offline/offlineEpubStorage.js";
import toast from "react-hot-toast";

import Icon from "../../../../shared/components/Icon/Icon.jsx";
import ReadingSessionsModal from "../../../reading/components/ReadingModal/components/ReadingSessionsModal/ReadingSessionsModal.jsx";
import ReadingStatusModal from "../../../reading/components/ReadingModal/components/ReadingStatusModal/ReadingStatusModal.jsx";
import useRefreshReadingData from "../../../reading/hooks/useRefreshReadingData.js";
import EbookReaderStatsPanel from "./EbookReaderStatsPanel.jsx";

import "./EbookReader.css";


const READER_TIPS = {
  stats: "\u0421\u0442\u0430\u0442\u0438\u0441\u0442\u0438\u043a\u0430 \u0447\u0438\u0442\u0430\u043d\u043d\u044f",
  dark: "\u0422\u0435\u043c\u043d\u0430 \u0442\u0435\u043c\u0430",
  light: "\u0421\u0432\u0456\u0442\u043b\u0430 \u0442\u0435\u043c\u0430",
  save: "\u0417\u0431\u0435\u0440\u0435\u0433\u0442\u0438 \u043e\u0444\u043b\u0430\u0439\u043d",
  saved: "\u0414\u043e\u0441\u0442\u0443\u043f\u043d\u0430 \u043e\u0444\u043b\u0430\u0439\u043d",
  close: "\u0417\u0430\u043a\u0440\u0438\u0442\u0438 \u0447\u0438\u0442\u0430\u043b\u043a\u0443",
  toolbar: "\u041a\u0435\u0440\u0443\u0432\u0430\u043d\u043d\u044f \u0447\u0438\u0442\u0430\u043b\u043a\u043e\u044e",
};

const EpubReader = lazy(() =>
  import("./EpubReader/EpubReader.jsx")
);

const EbookReader = ({ file, book, libraryId, onClose, locationKey, onLocationChange, onReadingAdvance, onReady, onChangeStatus, onReachedEnd }) => {
  const { user } = useAuth();
  const [blob, setBlob] = useState(null);
  const [offlineSaved, setOfflineSaved] = useState(false);
  const [offlineSaving, setOfflineSaving] = useState(false);
  const [error, setError] = useState("");
  const [statsOpen, setStatsOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [statusOpen, setStatusOpen] = useState(false);
  const [statusLoading, setStatusLoading] = useState(false);
  const [epubPercent, setEpubPercent] = useState(null);
  const [chromeVisible, setChromeVisible] = useState(true);
  const toolbarHoverRef = useRef(false);

  const chromeVisibleRef = useRef(true);
  const hideAtRef = useRef(Date.now() + 6000);
  const autoHiddenRef = useRef(false);
  const overlaysRef = useRef(false);

  overlaysRef.current = statsOpen || historyOpen || statusOpen;

  useEffect(() => {
    const timer = window.setInterval(() => {
      if (
        overlaysRef.current ||
        toolbarHoverRef.current ||
        autoHiddenRef.current ||
        Date.now() < hideAtRef.current
      ) {
        return;
      }

      autoHiddenRef.current = true;
      chromeVisibleRef.current = false;
      setChromeVisible(false);
    }, 250);

    return () => window.clearInterval(timer);
  }, []);

  const handlePageTap = useCallback(() => {
    if (overlaysRef.current) return;

    const next = !chromeVisibleRef.current;
    chromeVisibleRef.current = next;
    autoHiddenRef.current = !next;

    if (next) {
      hideAtRef.current = Date.now() + 6000;
    }

    setChromeVisible(next);
  }, []);
  const refreshReadingData = useRefreshReadingData();

  const handleCloseReader = useCallback(() => {
    if (historyOpen || statusOpen) return;
    if (statsOpen) {
      setStatsOpen(false);
      return;
    }
    onClose();
  }, [historyOpen, statusOpen, statsOpen, onClose]);
  const handleStatusChange = async (status) => {
    if (statusLoading) return false;
    setStatusLoading(true);
    try {
      return Boolean(await onChangeStatus(status));
    } finally {
      setStatusLoading(false);
    }
  };

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
    setOfflineSaved(false);

    const loadBook = async () => {
      try {
        if (file.format === "EPUB" && user?.id) {
          try {
            const cached = await getOfflineEpub({
              userId: user.id,
              libraryId,
              bookId: book.id,
              fileId: file.id,
            });

            if (!active) return;

            if (cached?.blob instanceof Blob && cached.blob.size > 0) {
              if (!cached.book || !cached.file) {
                void saveOfflineEpub({
                  userId: user.id,
                  libraryId,
                  bookId: book.id,
                  fileId: file.id,
                  title: book.title,
                  book,
                  file,
                  blob: cached.blob,
                  savedAt: cached.savedAt,
                }).catch((error) => {
                  console.warn("Offline EPUB metadata update failed", error);
                });
              }
              setOfflineSaved(true);
              setBlob(cached.blob);
              return;
            }
          } catch (cacheError) {
            console.warn("Offline EPUB cache unavailable", cacheError);
          }
        }

        const data = await downloadBookFile(libraryId, book.id, file.id);

        if (active) setBlob(data);
      } catch (error) {
        if (active) {
          setError(error.message || "Failed to load EPUB");
        }
      }
    };

    void loadBook();

    return () => {
      active = false;
    };
  }, [libraryId, book.id, file.id, file.format, user?.id]);

  const handleSaveOffline = async () => {
    if (
      offlineSaving ||
      offlineSaved ||
      !blob ||
      !user?.id ||
      file.format !== "EPUB"
    ) {
      return;
    }

    setOfflineSaving(true);

    try {
      await saveOfflineEpub({
        userId: user.id,
        libraryId,
        bookId: book.id,
        fileId: file.id,
        title: book.title,
        book,
        file,
        blob,
      });

      const saved = await getOfflineEpub({
        userId: user.id,
        libraryId,
        bookId: book.id,
        fileId: file.id,
      });
      if (!(saved?.blob instanceof Blob) ||
          saved.blob.size !== blob.size ||
          saved.book?.id !== book.id ||
          saved.file?.id !== file.id) {
        throw new Error("EPUB was not fully saved to offline storage");
      }
      setOfflineSaved(true);
      toast.success("EPUB збережено на цьому пристрої");
    } catch (error) {
      console.error("Offline EPUB save failed", error);
      toast.error("Не вдалося зберегти EPUB офлайн. Спробуй ще раз.");
    } finally {
      setOfflineSaving(false);
    }
  };

  return (
    <>
    <Modal
      isOpen
      onClose={handleCloseReader}
      showHeader={false}
      ariaLabel={`Читалка: ${book.title}`}
      overlayClassName="ebook-reader-overlay"
      className={chromeVisible
        ? "ebook-reader-modal"
        : "ebook-reader-modal ebook-reader-modal--chrome-hidden"}
      closeOnEscape={!historyOpen && !statusOpen}
      closeOnBackdrop={!historyOpen && !statusOpen}
    >

      <div
        className="ebook-reader__toolbar"
        role="toolbar"
        aria-label={READER_TIPS.toolbar}
        inert={!chromeVisible}
        onPointerEnter={(event) => {
          if (event.pointerType === "mouse") {
            toolbarHoverRef.current = true;
          }
        }}
        onPointerLeave={(event) => {
          if (event.pointerType === "mouse") {
            toolbarHoverRef.current = false;
            hideAtRef.current = Date.now() + 6000;
          }
        }}
        onPointerDown={() => {
          hideAtRef.current = Date.now() + 6000;
        }}
      >

        <button
          type="button"
          className="ebook-reader__stats-toggle"
          onClick={() => setStatsOpen((value) => !value)}
          title={READER_TIPS.stats}
          aria-label={READER_TIPS.stats}
          aria-expanded={statsOpen}
        >
          <Icon name="stats" />
        </button>

        {file.format === "EPUB" && (
          <>
            <button
              type="button"
              className="ebook-reader__theme-toggle"
              onClick={() =>
                setReaderTheme((value) =>
                  value === "light" ? "dark" : "light"
                )
              }
              title={readerTheme === "light" ? READER_TIPS.dark : READER_TIPS.light}
              aria-label={readerTheme === "light" ? READER_TIPS.dark : READER_TIPS.light}
            >
              <span aria-hidden="true">{readerTheme === "light" ? "\u263e" : "\u2600"}</span>
            </button>

            <button
              type="button"
              className={`ebook-reader__offline-toggle${offlineSaved ? " ebook-reader__offline-toggle--saved" : ""}`}
              onClick={() => void handleSaveOffline()}
              disabled={!blob || !user?.id || offlineSaving || offlineSaved}
              title={offlineSaving ? "Зберігаємо офлайн…" : offlineSaved ? READER_TIPS.saved : READER_TIPS.save}
              aria-label={offlineSaving ? "Зберігаємо офлайн…" : offlineSaved ? READER_TIPS.saved : READER_TIPS.save}
            >
              {offlineSaving ? (
                <span className="ebook-reader__offline-spinner" aria-hidden="true" />
              ) : offlineSaved ? (
                <Icon name="check" />
              ) : (
                <svg className="ebook-reader__line-icon" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M12 3v12m-5-5 5 5 5-5M4 18v3h16v-3" />
                </svg>
              )}
            </button>
          </>
        )}

        <button
          type="button"
          className="ebook-reader__close"
          onClick={handleCloseReader}
          title={READER_TIPS.close}
          aria-label={READER_TIPS.close}
        >
          <svg className="ebook-reader__close-icon" viewBox="0 0 24 24" aria-hidden="true">
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
              onReachedEnd={onReachedEnd}
              onToggleChrome={handlePageTap}
              chromeVisible={chromeVisible}
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
          currentStatus={book.status}
          onOpenStatus={() => setStatusOpen(true)}
          currentPercent={epubPercent}
          onClose={() => setStatsOpen(false)}
          onOpenHistory={() => {
            setStatsOpen(false);
            setHistoryOpen(true);
          }}
        />
      )}
    </Modal>
    {statusOpen && (
      <ReadingStatusModal
        currentStatus={book.status}
        activeSession={null}
        loading={statusLoading}
        onChange={handleStatusChange}
        onClose={() => {
          if (!statusLoading) setStatusOpen(false);
        }}
      />
    )}
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
