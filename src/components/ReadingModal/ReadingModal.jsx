import { useEffect } from "react";
import { createPortal } from "react-dom";

import useReadingSession from "./hooks/useReadingSession.js";

import ReadingBookInfo from "./components/ReadingBookInfo/ReadingBookInfo.jsx";
import ReadingSessionCard from "./components/ReadingSessionCard/ReadingSessionCard.jsx";
import ReadingStats from "./components/ReadingStats/ReadingStats.jsx";

import {
  getReadingProgress,
  getReadingStatusLabel,
} from "./utils/readingModalHelpers.js";

import "./ReadingModal.css";

const ReadingModal = ({ book, apiUrl, onClose }) => {
  const {
    activeSession,
    currentBook,
    stats,

    message,

    loading,
    finishing,
    ratingLoading,
    pauseLoading,

    elapsedSeconds,

    endPage,
    setEndPage,

    isPaused,

    startReading,
    pauseReading,
    resumeReading,
    finishReading,
    changeRating,
  } = useReadingSession(book);

  const progress = getReadingProgress(
    currentBook.currentPage,
    currentBook.pages,
  );

  const statusLabel = getReadingStatusLabel(currentBook.status, activeSession);

  /* =========================
     LOCK PAGE SCROLL
  ========================= */

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;

    const previousPaddingRight = document.body.style.paddingRight;

    const scrollbarWidth =
      window.innerWidth - document.documentElement.clientWidth;

    document.body.style.overflow = "hidden";

    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }

    return () => {
      document.body.style.overflow = previousOverflow;

      document.body.style.paddingRight = previousPaddingRight;
    };
  }, []);

  /* =========================
     ESC CLOSE
  ========================= */

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  /* =========================
     OVERLAY CLICK
  ========================= */

  const handleOverlayClick = (event) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  /* =========================
     PORTAL
  ========================= */

  return createPortal(
    <div
      className="reading-modal-overlay"
      onMouseDown={handleOverlayClick}
      role="presentation"
    >
      <div
        className="reading-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="reading-modal-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          className="reading-modal__close"
          onClick={onClose}
          aria-label="Закрити"
        >
          ×
        </button>

        <div className="reading-modal__header">
          <h2 id="reading-modal-title">{currentBook.title}</h2>

          <p className="reading-modal__author">{currentBook.author}</p>
        </div>

        {message && <p className="reading-modal__message">{message}</p>}

        <div className="reading-modal__layout">
          <ReadingBookInfo
            currentBook={currentBook}
            apiUrl={apiUrl}
            statusLabel={statusLabel}
            progress={progress}
            ratingLoading={ratingLoading}
            onRatingChange={changeRating}
          />

          <ReadingSessionCard
            activeSession={activeSession}
            currentBook={currentBook}
            loading={loading}
            finishing={finishing}
            pauseLoading={pauseLoading}
            elapsedSeconds={elapsedSeconds}
            endPage={endPage}
            setEndPage={setEndPage}
            isPaused={isPaused}
            onStart={startReading}
            onPause={pauseReading}
            onResume={resumeReading}
            onFinish={finishReading}
          />

          <ReadingStats
            stats={stats}
            activeSession={activeSession}
            elapsedSeconds={elapsedSeconds}
            bookId={book.id}
          />
        </div>
      </div>
    </div>,
    document.body,
  );
};

export default ReadingModal;
