import "./ReadingGoalCard.css";
import { TargetIcon } from "../HomeIcons.jsx";

const ReadingGoalCard = ({
  hasReadingGoal,
  goalProgress,
  goalPercent,
  onOpen,
}) => {
  const handleKeyDown = (event) => {
    if (event.key !== "Enter" && event.key !== " ") {
      return;
    }

    event.preventDefault();
    onOpen();
  };

  return (
    <section
      className="home-panel home-panel--clickable"
      role="button"
      tabIndex={0}
      onClick={onOpen}
      onKeyDown={handleKeyDown}
    >
      <div className="home-panel__header">
        <div>
          <span className="home-section__kicker">Прогрес</span>

          <h2>Ціль читання</h2>
        </div>

        <span className="reading-goal__percent">{goalPercent}%</span>
      </div>

      {hasReadingGoal && goalProgress ? (
        <div className="reading-goal">
          <div className="reading-goal__hero">
            <div className="reading-goal__icon">
              <TargetIcon />
            </div>

            <div>
              <span>{goalProgress.label}</span>

              <div className="reading-goal__numbers">
                <strong>{goalProgress.current}</strong>

                <span>
                  / {goalProgress.goal} {goalProgress.unit}
                </span>
              </div>
            </div>
          </div>

          <div className="home-progress home-progress--large">
            <div
              className="home-progress__bar"
              style={{
                width: `${goalPercent}%`,
              }}
            />
          </div>
        </div>
      ) : (
        <div className="home-empty-state">
          <div className="home-empty-state__icon">
            <TargetIcon />
          </div>

          <div>
            <strong>Мету ще не встановлено</strong>

            <span>Встанови річну ціль, щоб бачити прогрес.</span>
          </div>
        </div>
      )}
    </section>
  );
};

export default ReadingGoalCard;
