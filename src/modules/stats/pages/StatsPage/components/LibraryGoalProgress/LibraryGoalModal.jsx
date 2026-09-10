import { useState } from "react";

import Modal from "../../../../../../shared/components/Modal/Modal.jsx";
import { apiFetch } from "../../../../../../shared/api/apiClient.js";

const LibraryGoalModal = ({
  libraryId,
  year,
  initialGoal,
  onClose,
  onSaved,
}) => {
  const [booksGoal, setBooksGoal] = useState(
    initialGoal != null ? String(initialGoal) : "",
  );

  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();

    const parsedGoal = Number(booksGoal);

    if (!Number.isInteger(parsedGoal) || parsedGoal <= 0) {
      setError("Вкажи додатне ціле число книг");
      return;
    }

    try {
      setIsSaving(true);
      setError("");

      const data = await apiFetch(
        `/api/libraries/${libraryId}/goal?year=${year}`,
        {
          method: "PUT",
          body: {
            booksGoal: parsedGoal,
          },
        },
      );

      onSaved?.(data);
      onClose();
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : "Не вдалося зберегти ціль",
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal
      isOpen
      onClose={onClose}
      title={`Поповнення бібліотеки · ${year}`}
      subtitle="Скільки книг плануєте додати до бібліотеки за рік"
      className="goal-modal"
      closeOnEscape={!isSaving}
      closeOnBackdrop={!isSaving}
    >
      <form className="goal-modal__form" onSubmit={handleSubmit}>
        <label>
          <span>Кількість книг</span>

          <input
            type="number"
            min="1"
            step="1"
            value={booksGoal}
            onChange={(event) => {
              setBooksGoal(event.target.value);
              setError("");
            }}
            placeholder="60"
          />
        </label>

        {error && <div className="goal-modal__error">{error}</div>}

        <div className="goal-modal__actions">
          <button
            type="button"
            className="goal-modal__cancel"
            onClick={onClose}
            disabled={isSaving}
          >
            Скасувати
          </button>

          <button
            type="submit"
            className="goal-modal__save"
            disabled={isSaving}
          >
            {isSaving ? "Збереження..." : "Зберегти"}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default LibraryGoalModal;