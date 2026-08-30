import { useEffect, useState } from "react";
import "./ReadingGoal.css";

const API_URL = "https://library-backend-production-5d60.up.railway.app";

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
   COMPONENT
========================= */

const ReadingGoal = () => {
  const currentYear = new Date().getFullYear();

  const [readingGoal, setReadingGoal] = useState(null);
  const [isGoalLoading, setIsGoalLoading] = useState(true);
  const [goalError, setGoalError] = useState("");

  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [isGoalSaving, setIsGoalSaving] = useState(false);
  const [goalSaveError, setGoalSaveError] = useState("");

  const [goalForm, setGoalForm] = useState({
    books: "",
    pages: "",
    hours: "",
  });

  useEffect(() => {
    const loadReadingGoal = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        setIsGoalLoading(false);
        return;
      }

      try {
        setIsGoalLoading(true);
        setGoalError("");

        const response = await fetch(
          `${API_URL}/api/user-books/goals?year=${currentYear}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Не вдалося завантажити мету");
        }

        setReadingGoal(data.goal);
      } catch (error) {
        console.error("Load reading goal error:", error);

        setGoalError("Не вдалося завантажити мету");
      } finally {
        setIsGoalLoading(false);
      }
    };

    loadReadingGoal();
  }, [currentYear]);

  const handleOpenGoalModal = () => {
    const goal = readingGoal?.goal;

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

    setGoalSaveError("");
    setIsGoalModalOpen(true);
  };

  const handleCloseGoalModal = () => {
    if (isGoalSaving) {
      return;
    }

    setGoalSaveError("");
    setIsGoalModalOpen(false);
  };

  const handleGoalChange = (event) => {
    const { name, value } = event.target;

    setGoalForm((form) => ({
      ...form,
      [name]: value,
    }));
  };

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

  const handleSaveGoal = async (event) => {
    event.preventDefault();

    const token = localStorage.getItem("token");

    if (!token) {
      setGoalSaveError("Потрібно увійти в акаунт");
      return;
    }

    const books = parseGoalValue(goalForm.books);
    const pages = parseGoalValue(goalForm.pages);
    const hours = parseGoalValue(goalForm.hours);

    if (goalForm.books !== "" && books === null) {
      setGoalSaveError("Вкажи коректну кількість книг");
      return;
    }

    if (goalForm.pages !== "" && pages === null) {
      setGoalSaveError("Вкажи коректну кількість сторінок");
      return;
    }

    if (goalForm.hours !== "" && hours === null) {
      setGoalSaveError("Вкажи коректну кількість годин");
      return;
    }

    if (
      (books !== null && !Number.isInteger(books)) ||
      (pages !== null && !Number.isInteger(pages))
    ) {
      setGoalSaveError("Книги та сторінки мають бути цілими числами");
      return;
    }

    const minutes = hours === null ? null : Math.round(hours * 60);

    try {
      setIsGoalSaving(true);
      setGoalSaveError("");

      const response = await fetch(
        `${API_URL}/api/user-books/goals?year=${currentYear}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            booksGoal: books,
            pagesGoal: pages,
            minutesGoal: minutes,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Не вдалося зберегти мету");
      }

      setReadingGoal(data.goal);
      setIsGoalModalOpen(false);
    } catch (error) {
      console.error("Save reading goal error:", error);

      setGoalSaveError(
        error instanceof Error ? error.message : "Не вдалося зберегти мету",
      );
    } finally {
      setIsGoalSaving(false);
    }
  };

  const goal = readingGoal?.goal;

  const goalHours =
    goal?.minutes !== null && goal?.minutes !== undefined
      ? Math.round((goal.minutes / 60) * 10) / 10
      : null;

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

              {goalSaveError && (
                <div className="goal-modal__error">{goalSaveError}</div>
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
