import { useCallback, useEffect, useRef, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";

import { apiFetch } from "../../../../shared/api/apiClient.js";
import { useAuth } from "../../../auth/context/AuthContext.jsx";
import useRefreshReadingData from "../../../reading/hooks/useRefreshReadingData.js";
import { getBookFiles } from "../../api/bookFilesApi.js";
import EbookReader from "../../components/EbookReader/EbookReader.jsx";
import useEbookAutoSession from "./useEbookAutoSession.js";

const EbookReaderPage = () => {
  const { libraryId, bookId, fileId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const refreshReadingData = useRefreshReadingData();

  const [book, setBook] = useState(null);
  const [file, setFile] = useState(null);
  const [error, setError] = useState("");
  const [ready, setReady] = useState(false);
  const [readAdvance, setReadAdvance] = useState(0);
  const epubPositionRef = useRef({ start: null, end: null });

  useEffect(() => {
    let current = true;
    Promise.all([
      apiFetch(`/api/libraries/${encodeURIComponent(libraryId)}/books/${encodeURIComponent(bookId)}`),
      getBookFiles(libraryId, bookId),
    ])
      .then(([nextBook, files]) => {
        if (!current) return;
        const nextFile = files.find((item) => item.id === fileId);
        if (!nextFile || nextFile.format !== "EPUB") {
          setError("Цей EPUB-файл недоступний для читання");
          return;
        }
        setBook(nextBook);
        setFile(nextFile);
      })
      .catch((reason) => {
        if (current) setError(reason?.message || "Не вдалося відкрити е-книгу");
      });
    return () => { current = false; };
  }, [libraryId, bookId, fileId]);

  const positionKey = `ebook-position:${user?.id || "unknown"}:${libraryId}:${fileId}`;

  // These are EPUB locations, NOT the accumulated reading percentage.
  useEffect(() => {
    epubPositionRef.current = { start: null, end: null };
  }, [positionKey]);

  const handlePositionChange = useCallback((value) => {
    if (!Number.isFinite(value)) return;
    const next = Math.max(0, Math.min(100, Math.round(value)));
    if (epubPositionRef.current.start === null) {
      epubPositionRef.current.start = next;
    }
    epubPositionRef.current.end = next;
  }, []);
  // Count only portions traversed by ordinary forward page turns.
  // Seeking, restoring a bookmark and changing font size affect position,
  // not statistics. Preserve the backend's previously recorded percentage.
  const handleReadingAdvance = useCallback((delta) => {
    if (Number.isFinite(delta) && delta > 0) {
      setReadAdvance((current) => Math.min(100, current + delta));
    }
  }, []);
  const percent = book
    ? Math.min(100, (Number(book.currentPercent) || 0) + readAdvance)
    : null;

  const session = useEbookAutoSession({
    bookId,
    fileId,
    userId: user?.id,
    ready: ready && Boolean(book),
    initialPercent: book?.currentPercent ?? 0,
    finished: book?.status === "FINISHED",
    percent,
    onSaved: refreshReadingData,
  });

  const handleClose = useCallback(async () => {
    const saved = await session.finish({
      epubStartPositionPercent: epubPositionRef.current.start ?? undefined,
      epubEndPositionPercent: epubPositionRef.current.end ?? undefined,
    });
    if (!saved) return;
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
  }, [session.finish, location.state, navigate]);

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
        onClose={handleClose}
      />
      {session.notice && (
        <div role="status" style={{ position: "fixed", left: 16, right: 16, top: 76, zIndex: 11000, padding: "10px 14px", borderRadius: 10, background: "var(--surface-secondary)", color: "var(--text-h)", border: "1px solid var(--border)" }}>
          {session.notice}
        </div>
      )}
    </>
  );
};

export default EbookReaderPage;
