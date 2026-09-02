import { useState } from "react";

import Modal from "../Modal/Modal.jsx";

import useReadingSession from "./hooks/useReadingSession.js";

import ReadingBookInfo from "./components/ReadingBookInfo/ReadingBookInfo.jsx";
import ReadingSessionCard from "./components/ReadingSessionCard/ReadingSessionCard.jsx";
import ReadingStats from "./components/ReadingStats/ReadingStats.jsx";
import ReadingStatusModal from "./components/ReadingStatusModal/ReadingStatusModal.jsx";
import ReadingSessionsModal from "./components/ReadingSessionsModal/ReadingSessionsModal.jsx";

import { getReadingStatusLabel } from "./utils/readingModalHelpers.js";

import "./ReadingModal.css";

const ReadingModal = ({ book, apiUrl, onClose, onBookUpdated }) => {
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
  } = useReadingSession(book, onBookUpdated);

  const statusLabel = getReadingStatusLabel(currentBook.status, activeSession);

  const modalTitle = activeSession ? "Сесія читання" : "Нова сесія читання";

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

  const childModalOpen = statusModalOpen || sessionsModalOpen;

  return (
    <>
      <Modal
        isOpen
        onClose={onClose}
        title={modalTitle}
        subtitle={currentBook.title}
        className="reading-modal"
        closeOnEscape={!childModalOpen}
        closeOnBackdrop={!childModalOpen}
      >
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
      </Modal>

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
    </>
  );
};

export default ReadingModal;
