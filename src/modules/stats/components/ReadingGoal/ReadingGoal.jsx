import Icon from "../../../../shared/components/Icon/Icon.jsx";
import { useState } from "react";

import { useReadingGoalContext } from "../../context/ReadingGoalContext.jsx";

import ReadingGoalModal from "./ReadingGoalModal.jsx";

import "./ReadingGoal.css";

/* =========================
   ICONS
========================= */

/* =========================
   COMPONENT
========================= */

const ReadingGoal = () => {
  const {
    currentYear,
    readingGoal,
    readingGoalProgress,
    readingGoalPercent,
    isGoalLoading,
    goalError,
  } = useReadingGoalContext();

  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);

  const goal = readingGoal;
  const progress = readingGoalProgress ?? {};
  const percent = readingGoalPercent ?? {};

  const formatMinutes = (minutes) => {
    const totalMinutes = Math.max(0, Math.round(Number(minutes) || 0));
    const hours = Math.floor(totalMinutes / 60);
    const restMinutes = totalMinutes % 60;

    if (hours === 0) {
      return `${restMinutes} хв`;
    }

    if (restMinutes === 0) {
      return `${hours} год`;
    }

    return `${hours} год ${restMinutes} хв`;
  };

  const goalTime =
    goal?.minutes !== null && goal?.minutes !== undefined
      ? formatMinutes(goal.minutes)
      : "—";

  const progressTime = formatMinutes(progress.minutes ?? 0);

  const timePercent =
    Number(goal?.minutes) > 0
      ? Math.round(
          ((Number(progress.minutes) || 0) / Number(goal.minutes)) * 10000,
        ) / 100
      : 0;

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
            <Icon name="edit" />
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
              <Icon name="book" />

              <div>
                <strong>
                  {progress.books ?? 0} / {goal?.books ?? "—"}
                </strong>

                <span>книг</span>
                <span className="reading-goal-card__percent">
                  {percent.books ?? 0}%
                </span>
              </div>
            </div>

            <div className="reading-goal-card__item">
              <Icon name="bookmark" />

              <div>
                <strong>
                  {progress.pages ?? 0} / {goal?.pages ?? "—"}
                </strong>

                <span>сторінок</span>
                <span className="reading-goal-card__percent">
                  {percent.pages ?? 0}%
                </span>
              </div>
            </div>

            <div className="reading-goal-card__item">
              <Icon name="clock" />

              <div>
                <strong>{progressTime}</strong>

                <span>з {goalTime}</span>
                <span className="reading-goal-card__percent">
                  {timePercent}%
                </span>
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
