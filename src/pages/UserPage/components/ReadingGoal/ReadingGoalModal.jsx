import { useState } from "react";

import useReadingGoal from "../../hooks/useReadingGoal.js";

import "./ReadingGoal.css";

const parseGoalValue = (value) => {
  if (value === "") {
    return null;
  }

  const number = Number(value);

  if (!Number.isFinite(number) || number < 0) {
    return null;
  }

  return number;
};

const getInitialForm = (goal) => ({
  books:
    goal?.books !== null && goal?.books !== undefined ? String(goal.books) : "",

  pages:
    goal?.pages !== null && goal?.pages !== undefined ? String(goal.pages) : "",

  hours:
    goal?.minutes !== null && goal?.minutes !== undefined
      ? String(Math.round((goal.minutes / 60) * 10) / 10)
      : "",
});

const ReadingGoalModal = ({ onClose, onSaved, initialGoal }) => {
  const {
    currentYear,
    readingGoal,
    isGoalSaving,
    goalSaveError,
    saveReadingGoal,
    clearGoalSaveError,
  } = useReadingGoal();

  const goal = initialGoal ?? readingGoal?.goal ?? null;

  const [goalForm, setGoalForm] = useState(() => getInitialForm(goal));

  const [localGoalError, setLocalGoalError] = useState("");

  const handleClose = () => {
    if (isGoalSaving) {
      return;
    }

    clearGoalSaveError();
    setLocalGoalError("");

    onClose();
  };

  const handleGoalChange = (event) => {
    const { name, value } = event.target;

    setGoalForm((form) => ({
      ...form,
      [name]: value,
    }));

    if (localGoalError) {
      setLocalGoalError("");
    }

    if (goalSaveError) {
      clearGoalSaveError();
    }
  };

  const handleSaveGoal = async (event) => {
    event.preventDefault();

    const books = parseGoalValue(goalForm.books);
    const pages = parseGoalValue(goalForm.pages);
    const hours = parseGoalValue(goalForm.hours);

    if (goalForm.books !== "" && books === null) {
      setLocalGoalError("Вкажи коректну кількість книг");

      return;
    }

    if (goalForm.pages !== "" && pages === null) {
      setLocalGoalError("Вкажи коректну кількість сторінок");

      return;
    }

    if (goalForm.hours !== "" && hours === null) {
      setLocalGoalError("Вкажи коректну кількість годин");

      return;
    }

    if (
      (books !== null && !Number.isInteger(books)) ||
      (pages !== null && !Number.isInteger(pages))
    ) {
      setLocalGoalError("Книги та сторінки мають бути цілими числами");

      return;
    }

    const minutes = hours === null ? null : Math.round(hours * 60);

    setLocalGoalError("");

    const isSaved = await saveReadingGoal({
      books,
      pages,
      minutes,
    });

    if (!isSaved) {
      return;
    }

    onSaved?.({
      books,
      pages,
      minutes,
    });

    onClose();
  };

  return (
    <div
      className="goal-modal-overlay"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          handleClose();
        }
      }}
    >
      <div
        className="goal-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="goal-modal-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="goal-modal__header">
          <div>
            <h2 id="goal-modal-title">Мета на {currentYear}</h2>

            <p>Встанови річну мету читання</p>
          </div>

          <button
            type="button"
            className="goal-modal__close"
            onClick={handleClose}
            disabled={isGoalSaving}
            aria-label="Закрити"
          >
            ×
          </button>
        </div>

        <form className="goal-modal__form" onSubmit={handleSaveGoal}>
          <label>
            <span>Книги</span>

            <input
              type="number"
              name="books"
              min="0"
              step="1"
              value={goalForm.books}
              onChange={handleGoalChange}
              placeholder="20"
            />
          </label>

          <label>
            <span>Сторінки</span>

            <input
              type="number"
              name="pages"
              min="0"
              step="1"
              value={goalForm.pages}
              onChange={handleGoalChange}
              placeholder="5000"
            />
          </label>

          <label>
            <span>Час читання, годин</span>

            <input
              type="number"
              name="hours"
              min="0"
              step="0.5"
              value={goalForm.hours}
              onChange={handleGoalChange}
              placeholder="100"
            />
          </label>

          {(localGoalError || goalSaveError) && (
            <div className="goal-modal__error">
              {localGoalError || goalSaveError}
            </div>
          )}

          <div className="goal-modal__actions">
            <button
              type="button"
              className="goal-modal__cancel"
              onClick={handleClose}
              disabled={isGoalSaving}
            >
              Скасувати
            </button>

            <button
              type="submit"
              className="goal-modal__save"
              disabled={isGoalSaving}
            >
              {isGoalSaving ? "Збереження..." : "Зберегти"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReadingGoalModal;
