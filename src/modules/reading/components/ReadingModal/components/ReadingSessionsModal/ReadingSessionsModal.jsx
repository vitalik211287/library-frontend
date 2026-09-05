import { useEffect, useState } from "react";

import Modal from "../../../../../../shared/components/Modal/Modal.jsx";
import ConfirmDeleteModal from "../../../../../../shared/components/ConfirmDeleteModal/ConfirmDeleteModal.jsx";

import { apiFetch } from "../../../../../../shared/api/apiClient.js";

import "./ReadingSessionsModal.css";

const formatDate = (value) => {
  if (!value) {
    return "";
  }

  return new Intl.DateTimeFormat("uk-UA", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(value));
};

const formatClockTime = (value) => {
  if (!value) {
    return "—";
  }

  return new Intl.DateTimeFormat("uk-UA", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
};

const formatDuration = (seconds = 0) => {
  const totalSeconds = Math.max(Math.floor(seconds), 0);

  const hours = Math.floor(totalSeconds / 3600);

  const minutes = Math.floor((totalSeconds % 3600) / 60);

  const remainingSeconds = totalSeconds % 60;

  if (hours > 0) {
    if (minutes === 0) {
      return `${hours} год`;
    }

    return `${hours} год ${minutes} хв`;
  }

  if (minutes > 0) {
    if (remainingSeconds === 0) {
      return `${minutes} хв`;
    }

    return `${minutes} хв ${remainingSeconds} сек`;
  }

  return `${remainingSeconds} сек`;
};

const ReadingSessionsModal = ({ bookId, totalPages, onClose, onChanged }) => {
  const [sessions, setSessions] = useState([]);

  const [loading, setLoading] = useState(true);

  const [message, setMessage] = useState("");

  const [editingSession, setEditingSession] = useState(null);

  const [editValue, setEditValue] = useState("");

  const [saving, setSaving] = useState(false);

  const [deletingSession, setDeletingSession] = useState(null);

  const [deleting, setDeleting] = useState(false);

  const loadSessions = async () => {
    try {
      setLoading(true);
      setMessage("");

      const data = await apiFetch(`/api/user-books/${bookId}/reading/sessions`);

      setSessions(Array.isArray(data.sessions) ? data.sessions : []);
    } catch (error) {
      console.error("Помилка завантаження історії сесій:", error);

      setMessage(
        error instanceof Error
          ? error.message
          : "Не вдалося завантажити історію сесій",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSessions();
  }, [bookId]);

  const handleClose = () => {
    if (editingSession || deletingSession || saving || deleting) {
      return;
    }

    onClose();
  };

  const handleEdit = (session) => {
    setMessage("");

    setEditingSession(session);

    setEditValue(
      session.progressMode === "PERCENT"
        ? String(session.endPercent ?? 0)
        : String(session.endPage ?? 0),
    );
  };

  const handleCancelEdit = () => {
    if (saving) {
      return;
    }

    setEditingSession(null);
    setEditValue("");
    setMessage("");
  };

  const validateEditValue = () => {
    if (!editingSession) {
      return "Сесію не вибрано";
    }

    if (editValue.trim() === "") {
      return editingSession.progressMode === "PERCENT"
        ? "Вкажіть кінцевий відсоток"
        : "Вкажіть кінцеву сторінку";
    }

    const value = Number(editValue);

    if (!Number.isFinite(value)) {
      return "Введіть коректне значення";
    }

    if (!Number.isInteger(value)) {
      return editingSession.progressMode === "PERCENT"
        ? "Відсоток має бути цілим числом"
        : "Номер сторінки має бути цілим числом";
    }

    if (editingSession.progressMode === "PERCENT") {
      const startPercent = editingSession.startPercent ?? 0;

      if (value < startPercent) {
        return `Відсоток не може бути меншим за ${startPercent}%`;
      }

      if (value > 100) {
        return "Відсоток має бути від 0 до 100";
      }

      return "";
    }

    const startPage = editingSession.startPage ?? 0;

    if (value < startPage) {
      return `Сторінка не може бути меншою за ${startPage}`;
    }

    if (totalPages && value > totalPages) {
      return `У книзі всього ${totalPages} сторінок`;
    }

    return "";
  };

  const handleSave = async () => {
    if (!editingSession) {
      return;
    }

    const validationMessage = validateEditValue();

    if (validationMessage) {
      setMessage(validationMessage);

      return;
    }

    const value = Number(editValue);

    try {
      setSaving(true);
      setMessage("");

      const body =
        editingSession.progressMode === "PERCENT"
          ? {
              endPercent: value,
            }
          : {
              endPage: value,
            };

      await apiFetch(
        `/api/user-books/${bookId}/reading/sessions/${editingSession.id}`,
        {
          method: "PATCH",
          body,
        },
      );

      setEditingSession(null);
      setEditValue("");

      await loadSessions();

      await onChanged?.();
    } catch (error) {
      console.error("Помилка редагування сесії:", error);

      setMessage(
        error instanceof Error ? error.message : "Не вдалося змінити сесію",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteRequest = (session) => {
    setMessage("");

    setDeletingSession(session);
  };

  const handleCancelDelete = () => {
    if (deleting) {
      return;
    }

    setDeletingSession(null);
  };

  const handleConfirmDelete = async () => {
    if (!deletingSession) {
      return;
    }

    try {
      setDeleting(true);
      setMessage("");

      await apiFetch(
        `/api/user-books/${bookId}/reading/sessions/${deletingSession.id}`,
        {
          method: "DELETE",
        },
      );

      setDeletingSession(null);

      await loadSessions();

      await onChanged?.();
    } catch (error) {
      console.error("Помилка видалення сесії:", error);

      setMessage(
        error instanceof Error ? error.message : "Не вдалося видалити сесію",
      );
    } finally {
      setDeleting(false);
    }
  };

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
        closeOnEscape={
          !editingSession && !deletingSession && !saving && !deleting
        }
        closeOnBackdrop={
          !editingSession && !deletingSession && !saving && !deleting
        }
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

              return (
                <article
                  key={session.id}
                  className="reading-sessions-modal__session"
                >
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
                      : (totalPages ?? undefined)
                  }
                  step="1"
                  inputMode="numeric"
                  autoFocus
                />

                <span>
                  {editingSession.progressMode === "PERCENT"
                    ? "%"
                    : totalPages
                      ? `/ ${totalPages}`
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



