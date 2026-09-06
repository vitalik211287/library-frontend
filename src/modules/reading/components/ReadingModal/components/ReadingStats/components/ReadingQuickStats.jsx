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
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <circle cx="12" cy="12" r="8" />
              <path d="M12 8v5l3 2" />
            </svg>
          </span>

          <strong>{totalReadingValue}</strong>
          <span>Час читання</span>
        </div>

        <div className="reading-modal__quick-stat">
          <span className="reading-modal__quick-stat-icon">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H11v16H6.5A2.5 2.5 0 0 0 4 21.5Z" />
              <path d="M20 5.5A2.5 2.5 0 0 0 17.5 3H13v16h4.5a2.5 2.5 0 0 1 2.5 2.5Z" />
            </svg>
          </span>

          <strong>{progressReadValue}</strong>
          <span>Прочитано</span>
        </div>

        <div className="reading-modal__quick-stat">
          <span className="reading-modal__quick-stat-icon">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M4 16a8 8 0 1 1 16 0" />
              <path d="m12 12 4-4" />
              <circle cx="12" cy="16" r="1" />
            </svg>
          </span>

          <strong>{speedValue}</strong>
          <span>{speedUnit}</span>
        </div>

        <div className="reading-modal__quick-stat">
          <span className="reading-modal__quick-stat-icon">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <rect x="3" y="5" width="18" height="16" rx="2" />
              <path d="M8 3v4" />
              <path d="M16 3v4" />
              <path d="M3 10h18" />
            </svg>
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
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M5 19V9" />
            <path d="M12 19V5" />
            <path d="M19 19v-7" />
          </svg>
        </span>

        <span>Деталі статистики</span>

        <span
          className={`reading-modal__stats-toggle-arrow ${
            detailsOpen ? "reading-modal__stats-toggle-arrow--open" : ""
          }`}
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="m6 9 6 6 6-6" />
          </svg>
        </span>
      </button>
    </div>
  );
};

export default ReadingQuickStats;
