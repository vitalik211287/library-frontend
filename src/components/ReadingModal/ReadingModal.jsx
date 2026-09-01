import { useEffect, useState } from "react";

import { createPortal } from "react-dom";

import useReadingSession from "./hooks/useReadingSession.js";

import ReadingBookInfo from "./components/ReadingBookInfo/ReadingBookInfo.jsx";
import ReadingSessionCard from "./components/ReadingSessionCard/ReadingSessionCard.jsx";
import ReadingStats from "./components/ReadingStats/ReadingStats.jsx";
import ReadingStatusModal from "./components/ReadingStatusModal/ReadingStatusModal.jsx";
import ReadingSessionsModal from "./components/ReadingSessionsModal/ReadingSessionsModal.jsx";

import { getReadingStatusLabel } from "./utils/readingModalHelpers.js";

import "./ReadingModal.css";

const ReadingModal = ({ book, apiUrl, onClose }) => {
  const [statusModalOpen, setStatusModalOpen] = useState(false);

  const [sessionsModalOpen, setSessionsModalOpen] = useState(false);

  const {
    activeSession,
    currentBook,
    stats,

    message,

    loading,
    finishing,
    ratingLoading,
    pauseLoading,
    statusLoading,

    elapsedSeconds,

    progressMode,
    changeProgressMode,

    startProgress,
    setStartProgress,

    endProgress,
    setEndProgress,

    progressPercent,

    finishValidationMessage,
    canFinish,

    isPaused,

    startReading,
    pauseReading,
    resumeReading,
    finishReading,
    changeRating,
    changeBookStatus,

    fetchReadingStats,
  } = useReadingSession(book);

  const statusLabel = getReadingStatusLabel(currentBook.status, activeSession);

  const modalTitle = activeSession ? "Сесія читання" : "Нова сесія читання";

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

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key !== "Escape") {
        return;
      }

      if (sessionsModalOpen) {
        return;
      }

      if (statusModalOpen) {
        setStatusModalOpen(false);

        return;
      }

      onClose();
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose, statusModalOpen, sessionsModalOpen]);

  const handleOverlayClick = (event) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  const handleStatusOpen = () => {
    setStatusModalOpen(true);
  };

  const handleStatusClose = () => {
    if (statusLoading) {
      return;
    }

    setStatusModalOpen(false);
  };

  const handleSessionsOpen = () => {
    setSessionsModalOpen(true);
  };

  const handleSessionsClose = () => {
    setSessionsModalOpen(false);
  };

  const handleSessionsChanged = async () => {
    await fetchReadingStats();
  };

  return createPortal(
    <>
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
            <h2 id="reading-modal-title">{modalTitle}</h2>

            <p className="reading-modal__author">{currentBook.title}</p>
          </div>

          {message && <p className="reading-modal__message">{message}</p>}

          <div className="reading-modal__layout">
            <ReadingBookInfo
              currentBook={currentBook}
              apiUrl={apiUrl}
              statusLabel={statusLabel}
              progress={progressPercent}
              ratingLoading={ratingLoading}
              onRatingChange={changeRating}
              onStatusClick={handleStatusOpen}
            />

            <ReadingSessionCard
              activeSession={activeSession}
              currentBook={currentBook}
              loading={loading}
              finishing={finishing}
              pauseLoading={pauseLoading}
              elapsedSeconds={elapsedSeconds}
              progressMode={progressMode}
              onProgressModeChange={changeProgressMode}
              startProgress={startProgress}
              setStartProgress={setStartProgress}
              endProgress={endProgress}
              setEndProgress={setEndProgress}
              isPaused={isPaused}
              finishValidationMessage={finishValidationMessage}
              canFinish={canFinish}
              onStart={startReading}
              onPause={pauseReading}
              onResume={resumeReading}
              onFinish={finishReading}
            />

            <ReadingStats
              stats={stats}
              activeSession={activeSession}
              elapsedSeconds={elapsedSeconds}
              bookId={currentBook.id}
              onOpenSessions={handleSessionsOpen}
            />
          </div>
        </div>
      </div>

      {statusModalOpen && (
        <ReadingStatusModal
          currentStatus={currentBook.status}
          activeSession={activeSession}
          loading={statusLoading}
          onChange={changeBookStatus}
          onClose={handleStatusClose}
        />
      )}

      {sessionsModalOpen && (
        <ReadingSessionsModal
          bookId={currentBook.id}
          totalPages={currentBook.pages}
          onClose={handleSessionsClose}
          onChanged={handleSessionsChanged}
        />
      )}
    </>,
    document.body,
  );
};

export default ReadingModal;
