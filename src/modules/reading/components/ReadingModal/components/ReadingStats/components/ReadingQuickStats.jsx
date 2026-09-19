import Icon from "../../../../../../../shared/components/Icon/Icon.jsx";
const ReadingQuickStats = ({
  totalReadingValue,
  progressReadValue,
  speedValue,
  speedUnit,
  sessionsCount,
  detailsOpen,
  onToggleDetails,
}) => {
  return (
    <div className="reading-modal__stats-mobile">
      <div className="reading-modal__quick-stats">
        <div className="reading-modal__quick-stat">
          <span className="reading-modal__quick-stat-icon">
            <Icon name="clock" />
          </span>

          <strong>{totalReadingValue}</strong>
          <span>Час читання</span>
        </div>

        <div className="reading-modal__quick-stat">
          <span className="reading-modal__quick-stat-icon">
            <Icon name="reading" />
          </span>

          <strong>{progressReadValue}</strong>
          <span>Прочитано</span>
        </div>

        <div className="reading-modal__quick-stat">
          <span className="reading-modal__quick-stat-icon">
            <Icon name="speed" />
          </span>

          <strong>{speedValue}</strong>
          <span>{speedUnit}</span>
        </div>

        <div className="reading-modal__quick-stat">
          <span className="reading-modal__quick-stat-icon">
            <Icon name="calendar" />
          </span>

          <strong>{sessionsCount}</strong>
          <span>Сесій</span>
        </div>
      </div>

      <button
        type="button"
        className="reading-modal__stats-toggle"
        onClick={onToggleDetails}
        aria-expanded={detailsOpen}
      >
        <span className="reading-modal__stats-toggle-icon">
          <Icon name="stats" />
        </span>

        <span>Деталі статистики</span>

        <span
          className={`reading-modal__stats-toggle-arrow ${
            detailsOpen ? "reading-modal__stats-toggle-arrow--open" : ""
          }`}
        >
          <Icon name="chevron-down" />
        </span>
      </button>
    </div>
  );
};

export default ReadingQuickStats;
