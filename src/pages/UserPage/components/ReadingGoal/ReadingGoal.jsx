import { useState } from "react";

import { useReadingGoalContext } from "../../../../context/ReadingGoalContext.jsx";

import ReadingGoalModal from "./ReadingGoalModal.jsx";

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
   COMPONENT
========================= */

const ReadingGoal = () => {
  const { currentYear, readingGoal, isGoalLoading, goalError } =
      useReadingGoalContext();

  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);

  const goal = readingGoal;
  
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
            onClick={() => setIsGoalModalOpen(true)}
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
        <ReadingGoalModal
          initialGoal={goal}
          onClose={() => setIsGoalModalOpen(false)}
        />
      )}
    </>
  );
};

export default ReadingGoal;
