import Modal from "../../../../../../shared/components/Modal/Modal.jsx";
import ConfirmDeleteModal from "../../../../../../shared/components/ConfirmDeleteModal/ConfirmDeleteModal.jsx";

import useReadingSessions from "./hooks/useReadingSessions.js";

import {
  formatClockTime,
  formatDate,
  formatDuration,
} from "./utils/readingSessionHelpers.js";

import "./ReadingSessionsModal.css";

const ReadingSessionsModal = ({ bookId, totalPages, onClose, onChanged }) => {
  const {
    sessions,
    loading,
    message,

    editingSession,
    editValue,
    setEditValue,
    saving,

    deletingSession,
    deleting,

    handleEdit,
    handleCancelEdit,
    handleSave,

    handleDeleteRequest,
    handleCancelDelete,
    handleConfirmDelete,
  } = useReadingSessions({
    bookId,
    totalPages,
    onChanged,
  });

  const handleClose = () => {
    if (editingSession || deletingSession || saving || deleting) {
      return;
    }

    onClose();
  };

  const isCloseBlocked =
    Boolean(editingSession) || Boolean(deletingSession) || saving || deleting;

  return (
    <>
      <Modal
        isOpen
        onClose={handleClose}
        title="Історія сесій"
        subtitle={`${sessions.length} ${
          sessions.length === 1 ? "сесія" : "сесій"
        }`}
        className="reading-sessions-modal"
        closeOnEscape={!isCloseBlocked}
        closeOnBackdrop={!isCloseBlocked}
      >
        {message && (
          <p className="reading-sessions-modal__message">{message}</p>
        )}

        {loading ? (
          <div className="reading-sessions-modal__empty">Завантаження...</div>
        ) : sessions.length === 0 ? (
          <div className="reading-sessions-modal__empty">
            Завершених сесій поки немає.
          </div>
        ) : (
          <div className="reading-sessions-modal__list">
            {sessions.map((session) => {
              const isPercent = session.progressMode === "PERCENT";

              const start = isPercent
                ? (session.startPercent ?? 0)
                : (session.startPage ?? 0);

              const end = isPercent
                ? (session.endPercent ?? 0)
                : (session.endPage ?? 0);

              const delta = Math.max(end - start, 0);

              const durationSeconds = Math.max(session.durationSeconds ?? 0, 0);

              const speed =
                durationSeconds > 0 && delta > 0
                  ? delta / (durationSeconds / 3600)
                  : 0;

              const sessionTotalPages =
                totalPages ?? session.book?.pages ?? null;

              return (
                <article
                  key={session.id}
                  className="reading-sessions-modal__session"
                >
                  {!bookId && session.book && (
                    <div className="reading-sessions-modal__book">
                      <strong>{session.book.title}</strong>

                      {session.book.author && (
                        <span>{session.book.author}</span>
                      )}
                    </div>
                  )}

                  <div className="reading-sessions-modal__session-top">
                    <span className="reading-sessions-modal__date">
                      {formatDate(session.startedAt)}
                    </span>

                    <span className="reading-sessions-modal__duration">
                      {formatDuration(durationSeconds)}
                    </span>
                  </div>

                  <div className="reading-sessions-modal__time">
                    {formatClockTime(session.startedAt)}

                    <span>→</span>

                    {formatClockTime(session.finishedAt)}
                  </div>

                  <div className="reading-sessions-modal__progress">
                    <span>
                      {start}
                      {isPercent ? "%" : " стор."}
                    </span>

                    <span className="reading-sessions-modal__progress-arrow">
                      →
                    </span>

                    <strong>
                      {end}
                      {isPercent ? "%" : " стор."}
                    </strong>
                  </div>

                  <div className="reading-sessions-modal__meta">
                    <span>
                      +{delta}
                      {isPercent ? "%" : " стор."}
                    </span>

                    <span>
                      {speed > 0
                        ? `${Math.round(speed * 10) / 10} ${
                            isPercent ? "%/год" : "стор./год"
                          }`
                        : "—"}
                    </span>
                  </div>

                  <div className="reading-sessions-modal__actions">
                    <button type="button" onClick={() => handleEdit(session)}>
                      Змінити
                    </button>

                    <button
                      type="button"
                      className="reading-sessions-modal__delete"
                      onClick={() => handleDeleteRequest(session)}
                    >
                      Видалити
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </Modal>

      <Modal
        isOpen={Boolean(editingSession)}
        onClose={handleCancelEdit}
        title="Змінити сесію"
        subtitle={
          editingSession
            ? editingSession.progressMode === "PERCENT"
              ? `Початок: ${editingSession.startPercent ?? 0}%`
              : `Початок: ${editingSession.startPage ?? 0} стор.`
            : ""
        }
        className="reading-sessions-edit-modal"
        closeOnEscape={!saving}
        closeOnBackdrop={!saving}
      >
        {editingSession && (
          <div className="reading-sessions-edit">
            <label className="reading-sessions-edit__label">
              <span>
                {editingSession.progressMode === "PERCENT"
                  ? "На якому відсотку зупинились"
                  : "На якій сторінці зупинились"}
              </span>

              <div className="reading-sessions-edit__input-wrap">
                <input
                  type="number"
                  value={editValue}
                  onChange={(event) => setEditValue(event.target.value)}
                  min={
                    editingSession.progressMode === "PERCENT"
                      ? (editingSession.startPercent ?? 0)
                      : (editingSession.startPage ?? 0)
                  }
                  max={
                    editingSession.progressMode === "PERCENT"
                      ? 100
                      : (sessionTotalPages ?? undefined)
                  }
                  step="1"
                  inputMode="numeric"
                  autoFocus
                />

                <span>
                  {editingSession.progressMode === "PERCENT"
                    ? "%"
                    : sessionTotalPages
                      ? `/ ${sessionTotalPages}`
                      : "стор."}
                </span>
              </div>
            </label>

            <div className="reading-sessions-edit__actions">
              <button
                type="button"
                onClick={handleCancelEdit}
                disabled={saving}
              >
                Скасувати
              </button>

              <button
                type="button"
                className="reading-sessions-edit__save"
                onClick={handleSave}
                disabled={saving || editValue.trim() === ""}
              >
                {saving ? "Збереження..." : "Зберегти"}
              </button>
            </div>
          </div>
        )}
      </Modal>

      <ConfirmDeleteModal
        isOpen={Boolean(deletingSession)}
        title="Видалити сесію?"
        description="Ця сесія буде видалена з історії читання. Статистика книги перераховується автоматично."
        confirmText="Видалити"
        isLoading={deleting}
        onCancel={handleCancelDelete}
        onConfirm={handleConfirmDelete}
      />
    </>
  );
};

export default ReadingSessionsModal;
