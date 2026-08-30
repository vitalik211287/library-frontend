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

  const handleOverlayClick = (event) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="reading-modal-overlay" onMouseDown={handleOverlayClick}>
      <div
        className="reading-modal"
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
          <h2>{currentBook.title}</h2>

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
    </div>
  );
};

export default ReadingModal;
