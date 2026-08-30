import { useState } from "react";

import useReadingGoal from "../../hooks/useReadingGoal.js";

import "./ReadingGoal.css";

/* =========================
   ICONS
========================= */

const BookIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H11a2 2 0 0 1 2 2v16a2 2 0 0 0-2-2H6.5A2.5 2.5 0 0 0 4 21.5v-16Z" />

    <path d="M20 5.5A2.5 2.5 0 0 0 17.5 3H13v18a2 2 0 0 1 2-2h2.5a2.5 2.5 0 0 1 2.5 2.5v-16Z" />
  </svg>
);

const BookmarkIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M6 4.5A1.5 1.5 0 0 1 7.5 3h9A1.5 1.5 0 0 1 18 4.5V21l-6-4-6 4V4.5Z" />
  </svg>
);

const EditIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="m4 20 4.4-1 9.8-9.8-3.4-3.4L5 15.6 4 20Z" />

    <path d="m13.8 6.8 3.4 3.4" />
  </svg>
);

/* =========================
   HELPERS
========================= */

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

/* =========================
   COMPONENT
========================= */

const ReadingGoal = () => {
  const {
    currentYear,
    readingGoal,
    isGoalLoading,
    goalError,
    isGoalSaving,
    goalSaveError,
    saveReadingGoal,
    clearGoalSaveError,
  } = useReadingGoal();

  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);

  const [localGoalError, setLocalGoalError] = useState("");

  const [goalForm, setGoalForm] = useState({
    books: "",
    pages: "",
    hours: "",
  });

  const goal = readingGoal?.goal;

  const goalHours =
    goal?.minutes !== null && goal?.minutes !== undefined
      ? Math.round((goal.minutes / 60) * 10) / 10
      : null;

  const handleOpenGoalModal = () => {
    setGoalForm({
      books:
        goal?.books !== null && goal?.books !== undefined
          ? String(goal.books)
          : "",

      pages:
        goal?.pages !== null && goal?.pages !== undefined
          ? String(goal.pages)
          : "",

      hours:
        goal?.minutes !== null && goal?.minutes !== undefined
          ? String(Math.round((goal.minutes / 60) * 10) / 10)
          : "",
    });

    setLocalGoalError("");
    clearGoalSaveError();

    setIsGoalModalOpen(true);
  };

  const handleCloseGoalModal = () => {
    if (isGoalSaving) {
      return;
    }

    setLocalGoalError("");
    clearGoalSaveError();

    setIsGoalModalOpen(false);
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

    if (isSaved) {
      setIsGoalModalOpen(false);
    }
  };

  return (
    <>
      <section className="profile-section profile-section--goal">
        <div className="profile-section__header">
          <h2>Мета на {currentYear}</h2>

          <button
            type="button"
            onClick={handleOpenGoalModal}
            disabled={isGoalLoading}
          >
            <EditIcon />
            Змінити
          </button>
        </div>

        {isGoalLoading ? (
          <div className="profile-empty">Завантаження мети...</div>
        ) : goalError ? (
          <div className="profile-empty">{goalError}</div>
        ) : (
          <div className="reading-goal-card">
            <div className="reading-goal-card__item">
              <BookIcon />

              <div>
                <strong>{goal?.books ?? "—"}</strong>

                <span>книг</span>
              </div>
            </div>

            <div className="reading-goal-card__item">
              <BookmarkIcon />

              <div>
                <strong>{goal?.pages ?? "—"}</strong>

                <span>сторінок</span>
              </div>
            </div>

            <div className="reading-goal-card__item">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <circle cx="12" cy="12" r="9" />

                <path d="M12 7v5l3 2" />
              </svg>

              <div>
                <strong>{goalHours ?? "—"}</strong>

                <span>годин</span>
              </div>
            </div>
          </div>
        )}
      </section>

      {isGoalModalOpen && (
        <div
          className="goal-modal-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              handleCloseGoalModal();
            }
          }}
        >
          <div
            className="goal-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="goal-modal-title"
          >
            <div className="goal-modal__header">
              <div>
                <h2 id="goal-modal-title">Мета на {currentYear}</h2>

                <p>Встанови річну мету читання</p>
              </div>

              <button
                type="button"
                className="goal-modal__close"
                onClick={handleCloseGoalModal}
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
                  onClick={handleCloseGoalModal}
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
      )}
    </>
  );
};

export default ReadingGoal;
