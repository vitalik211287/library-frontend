import { useCallback, useEffect, useRef, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";

import { apiFetch } from "../../../../shared/api/apiClient.js";
import { useAuth } from "../../../auth/context/AuthContext.jsx";
import useRefreshReadingData from "../../../reading/hooks/useRefreshReadingData.js";
import { getBookFiles } from "../../api/bookFilesApi.js";
import { getOfflineEpub } from "../../offline/offlineEpubStorage.js";
import EbookReader from "../../components/EbookReader/EbookReader.jsx";
import useEbookAutoSession from "./useEbookAutoSession.js";
import useOfflineEbookSession from "./useOfflineEbookSession.js";

const EbookReaderPageContent = () => {
  const { libraryId, bookId, fileId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const refreshReadingData = useRefreshReadingData();

  const [book, setBook] = useState(null);
  const [file, setFile] = useState(null);
  const [offlineMode, setOfflineMode] = useState(false);
  const [showOfflineNotice, setShowOfflineNotice] = useState(true);

  useEffect(() => {
    if (!offlineMode) return undefined;


    const timer = window.setTimeout(() => {
      setShowOfflineNotice(false);
    }, 5000);

    return () => window.clearTimeout(timer);
  }, [offlineMode]);
  const [error, setError] = useState("");
  const [ready, setReady] = useState(false);
  const [readAdvance, setReadAdvance] = useState(0);
  const epubPositionRef = useRef({ start: null, end: null });
  const epubReachedEndRef = useRef(false);

  useEffect(() => {
    let current = true;


    const loadBook = async () => {
      try {
        const [nextBook, files] = await Promise.all([
          apiFetch(
            "/api/libraries/" + encodeURIComponent(libraryId) +
            "/books/" + encodeURIComponent(bookId)
          ),
          getBookFiles(libraryId, bookId),
        ]);

        if (!current) return;

        const nextFile = files.find((item) => item.id === fileId);

        if (!nextFile || nextFile.format !== "EPUB") {
          setError("\u0426\u0435\u0439 EPUB-\u0444\u0430\u0439\u043b \u043d\u0435\u0434\u043e\u0441\u0442\u0443\u043f\u043d\u0438\u0439");
          return;
        }

        setBook(nextBook);
        setFile(nextFile);
      } catch (reason) {
        if (!current) return;

        // Never bypass an explicit server rejection.
        if (typeof reason?.status === "number") {
          setError(reason.message || "Server rejected book access");
          return;
        }

        if (!user?.id) {
          setError("Offline reader requires an authenticated user");
          return;
        }

        try {
          const cached = await getOfflineEpub({
            userId: user.id,
            libraryId,
            bookId,
            fileId,
          });

          if (!current) return;

          const valid =
            cached?.blob instanceof Blob &&
            cached.blob.size > 0 &&
            cached.book?.id === bookId &&
            cached.file?.id === fileId &&
            cached.file?.format === "EPUB";

          if (valid) {
            setShowOfflineNotice(true);
            setOfflineMode(true);
            setBook(cached.book);
            setFile(cached.file);
            return;
          }

          setError(
            "\u041a\u043d\u0438\u0433\u0430 \u043d\u0435\u0434\u043e\u0441\u0442\u0443\u043f\u043d\u0430 \u043e\u0444\u043b\u0430\u0439\u043d. \u0412\u0456\u0434\u043a\u0440\u0438\u0439 \u0457\u0457 \u043e\u043d\u043b\u0430\u0439\u043d \u0456 \u0437\u0431\u0435\u0440\u0435\u0436\u0438."
          );
        } catch (cacheError) {
          console.warn("Offline EPUB lookup failed", cacheError);

          if (current) {
            setError(
              "\u041f\u043e\u043c\u0438\u043b\u043a\u0430 \u0447\u0438\u0442\u0430\u043d\u043d\u044f \u043e\u0444\u043b\u0430\u0439\u043d-\u043a\u043e\u043f\u0456\u0457."
            );
          }
        }
      }
    };

    void loadBook();

    return () => {
      current = false;
    };
  }, [libraryId, bookId, fileId, user?.id]);

  const positionKey = `ebook-position:${user?.id || "unknown"}:${libraryId}:${fileId}`;

  // These are EPUB locations, NOT the accumulated reading percentage.
  useEffect(() => {
    epubPositionRef.current = { start: null, end: null };
    epubReachedEndRef.current = false;
  }, [positionKey]);

  // The online hook exclusively owns server sessions. Cached offline books
  // use an independent local draft; never run both timers together.
  const offlineSession = useOfflineEbookSession({
    enabled: ready && Boolean(book) && offlineMode && book?.status !== "FINISHED",
    userId: user?.id,
    bookId,
    fileId,
    startPercent: book?.currentPercent ?? 0,
  });

  const { position: offlinePosition, advance: offlineAdvance, finish: finishOfflineSession } = offlineSession;

  const handlePositionChange = useCallback((value) => {
    if (!Number.isFinite(value)) return;
    const next = Math.max(0, Math.min(100, Math.round(value)));
    if (epubPositionRef.current.start === null) {
      epubPositionRef.current.start = next;
    }
    epubPositionRef.current.end = next;
    if (offlineMode) offlinePosition(next);
  }, [offlineMode, offlinePosition]);
  // Count only portions traversed by ordinary forward page turns.
  // Seeking, restoring a bookmark and changing font size affect position,
  // not statistics. Preserve the backend's previously recorded percentage.
  const handleReachedEnd = useCallback(() => {
    epubReachedEndRef.current = true;
  }, []);

  const handleReadingAdvance = useCallback((delta) => {
    if (Number.isFinite(delta) && delta > 0) {
      setReadAdvance((current) => Math.min(100, current + delta));
      if (offlineMode) offlineAdvance(delta);
    }
  }, [offlineMode, offlineAdvance]);
  const percent = book
    ? Math.min(100, (Number(book.currentPercent) || 0) + readAdvance)
    : null;

  const session = useEbookAutoSession({
    bookId,
    fileId,
    userId: user?.id,
    ready: ready && Boolean(book) && !offlineMode,
    initialPercent: book?.currentPercent ?? 0,
    finished: book?.status === "FINISHED",
    percent,
    onSaved: refreshReadingData,
  });

  const finishOnlineSession = session.finish;

  useEffect(() => {
    if (offlineMode || !session.notice) return;

    toast.error(session.notice, {
      id: `ebook-session-warning:${bookId}`,
      duration: 5000,
    });
  }, [session.notice, offlineMode, bookId]);

  const handleClose = useCallback(async () => {
    if (offlineMode) {
      // Offline EPUB drafts must be queued BEFORE leaving the reader.
      const saved = await finishOfflineSession(epubPositionRef.current.end);
      if (!saved) return;
    } else if (navigator.onLine !== false) {
      const saved = await finishOnlineSession({
        epubStartPositionPercent: epubPositionRef.current.start ?? undefined,
        epubEndPositionPercent: epubPositionRef.current.end ?? undefined,
        epubReachedEnd: epubReachedEndRef.current,
      });
      if (!saved) return;
    }
    // When a live online session loses connectivity, do not create a local
    // overlapping session: preserve its server lease for later recovery.
    const from = location.state?.ebookFrom;
    const safeFrom =
      typeof from === "string" &&
      from.startsWith("/") &&
      !from.startsWith("//");

    if (safeFrom && window.history.state?.idx > 0) {
      navigate(-1);
    } else {
      navigate(safeFrom ? from : "/catalog", { replace: true });
    }
  }, [offlineMode, finishOfflineSession, finishOnlineSession, location.state, navigate]);

  const handleChangeStatus = useCallback(async (status) => {
    if (!["NOT_STARTED", "READING", "PAUSED", "FINISHED"].includes(status)) {
      return false;
    }
    if (offlineMode || navigator.onLine === false) {
      toast.error("Змінювати статус книги можна після відновлення зв'язку.");
      return false;
    }

    const saved = await finishOnlineSession({
      epubStartPositionPercent: epubPositionRef.current.start ?? undefined,
      epubEndPositionPercent: epubPositionRef.current.end ?? undefined,
      epubReachedEnd: epubReachedEndRef.current,
    });

    if (!saved) return false;

    try {
      await apiFetch(`/api/user-books/${encodeURIComponent(bookId)}`, {
        method: "PATCH",
        body: { status },
      });

      try {
        await refreshReadingData();
      } catch (refreshError) {
        console.warn("Не вдалося оновити кеш після зміни статусу", refreshError);
      }

      const from = location.state?.ebookFrom;
      const safeFrom = typeof from === "string" &&
        from.startsWith("/") && !from.startsWith("//");

      navigate(safeFrom ? from : "/catalog", { replace: true });
      return true;
    } catch (error) {
      toast.error(error?.message || "Не вдалося змінити статус книги");
      return false;
    }
  }, [bookId, finishOnlineSession, refreshReadingData, location.state, navigate, offlineMode]);

  const readerNotice = offlineMode
    ? offlineSession.notice || (showOfflineNotice
      ? (offlineSession.tracking
        ? "Офлайн: час і прогрес зберігаються на пристрої та синхронізуються після відновлення зв'язку."
        : "Офлайн: запускаємо локальний облік читання…")
      : "")
    : "";

  if (error) {
    return (
      <main style={{ padding: 24 }}>
        <p role="alert">{error}</p>
        <button type="button" onClick={() => navigate("/catalog", { replace: true })}>До каталогу</button>
      </main>
    );
  }

  if (!book || !file) return <p style={{ padding: 24 }}>Відкриваємо електронну книгу…</p>;

  return (
    <>
      <EbookReader
        book={book}
        file={file}
        libraryId={libraryId}
        locationKey={positionKey}
        onReady={() => setReady(true)}
        onLocationChange={handlePositionChange}
        onReadingAdvance={handleReadingAdvance}
        onReachedEnd={handleReachedEnd}
        onClose={handleClose}
        onChangeStatus={handleChangeStatus}
      />
      {session.recoveryCandidate && (
        <div
          role="dialog"
          aria-label="Відновлення сесії"
          style={{
            position: "fixed",
            bottom: 85,
            left: 16,
            right: 16,
            maxWidth: 480,
            margin: "0 auto",
            zIndex: 11050,
            padding: 16,
            borderRadius: 12,
            background: "var(--surface-secondary, #fff)",
            color: "var(--text-h, #222)",
            border: "1px solid var(--border, #ccc)",
            boxShadow: "0 8px 30px rgba(0,0,0,.2)",
          }}
        >
          <p style={{ margin: "0 0 12px" }}>
            Знайдено попередню EPUB-сесію цієї книги. Якщо читання перервалося, її можна відновити без створення нової.
          </p>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button
              type="button"
              disabled={session.isRecovering}
              onClick={() => void session.recover()}
            >
              Відновити сесію
            </button>
            <button type="button" onClick={session.dismissRecovery}>
              Не зараз
            </button>
          </div>
        </div>
      )}

      {readerNotice && (
        <div role="status" style={{ position: "fixed", left: 16, right: 16, top: 76, zIndex: 11000, padding: "10px 14px", borderRadius: 10, background: "var(--surface-secondary)", color: "var(--text-h)", border: "1px solid var(--border)" }}>
          {readerNotice}
        </div>
      )}
    </>
  );
};

const EbookReaderPage = () => {
  const { libraryId, bookId, fileId } = useParams();
  const { user } = useAuth();
  const readerKey = `${user?.id ?? "anonymous"}:${libraryId}:${bookId}:${fileId}`;

  return <EbookReaderPageContent key={readerKey} />;
};

export default EbookReaderPage;
