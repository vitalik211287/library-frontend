import "./ReadingGoalCard.css";
import HomePanel from "../HomePanel/HomePanel.jsx";
import { TargetIcon } from "../HomeIcons.jsx";

const formatGoalValue = (item) => {
  if (item.type !== "time") {
    return item.current;
  }

  const hours = Math.floor(item.current / 60);
  const minutes = item.current % 60;

  if (hours > 0 && minutes > 0) {
    return `${hours} год ${minutes} хв`;
  }

  if (hours > 0) {
    return `${hours} год`;
  }

  return `${minutes} хв`;
};

const formatGoalTarget = (item) => {
  if (item.type !== "time") {
    return `${item.goal} ${item.unit}`;
  }

  const hours = Math.floor(item.goal / 60);
  const minutes = item.goal % 60;

  if (hours > 0 && minutes > 0) {
    return `${hours} год ${minutes} хв`;
  }

  if (hours > 0) {
    return `${hours} год`;
  }

  return `${minutes} хв`;
};

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
    <HomePanel
      clickable
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

      {hasReadingGoal && goalProgress?.length ? (
        <div className="reading-goal">
          {goalProgress.map((item) => (
            <div
              className="reading-goal__item"
              key={item.type}
            >
              <div className="reading-goal__hero">
                <div className="reading-goal__icon">
                  <TargetIcon />
                </div>

                <div className="reading-goal__content">
                  <div className="reading-goal__row">
                    <span>{item.label}</span>

                    <strong>{item.percent}%</strong>
                  </div>

                  <div className="reading-goal__numbers">
                    <strong>{formatGoalValue(item)}</strong>

                    <span>
                      / {formatGoalTarget(item)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="home-progress">
                <div
                  className="home-progress__bar"
                  style={{
                    width: `${item.percent}%`,
                  }}
                />
              </div>
            </div>
          ))}
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
    </HomePanel>
  );
};

export default ReadingGoalCard;
