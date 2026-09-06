import {
  useEffect,
  useState,
} from "react";

import {
  apiFetch,
} from "../../../../../../../shared/api/apiClient.js";

const useReadingSessions = ({
  bookId,
  totalPages,
  onChanged,
}) => {
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

      const data = await apiFetch(
        `/api/user-books/${bookId}/reading/sessions`,
      );

      setSessions(
        Array.isArray(data.sessions)
          ? data.sessions
          : [],
      );
    } catch (error) {
      console.error(
        "Помилка завантаження історії сесій:",
        error,
      );

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
      const startPercent =
        editingSession.startPercent ?? 0;

      if (value < startPercent) {
        return `Відсоток не може бути меншим за ${startPercent}%`;
      }

      if (value > 100) {
        return "Відсоток має бути від 0 до 100";
      }

      return "";
    }

    const startPage =
      editingSession.startPage ?? 0;

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

    const validationMessage =
      validateEditValue();

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
      console.error(
        "Помилка редагування сесії:",
        error,
      );

      setMessage(
        error instanceof Error
          ? error.message
          : "Не вдалося змінити сесію",
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
      console.error(
        "Помилка видалення сесії:",
        error,
      );

      setMessage(
        error instanceof Error
          ? error.message
          : "Не вдалося видалити сесію",
      );
    } finally {
      setDeleting(false);
    }
  };

  return {
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
  };
};

export default useReadingSessions;
