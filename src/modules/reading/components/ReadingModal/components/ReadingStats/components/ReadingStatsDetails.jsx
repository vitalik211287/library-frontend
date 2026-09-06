import { formatTime } from "../../../utils/readingModalHelpers.js";

const ReadingStatsDetails = ({
  detailsOpen,
  activeSession,
  elapsedSeconds,
  progressReadValue,
  totalReadingValue,
  speedValue,
  speedUnit,
  remainingValue,
  estimatedTimeValue,
  sessionsCount,
  longestSessionSeconds,
  onOpenSessions,
  onOpenCalendar,
}) => {
  return (
    <div
      className={`reading-modal__stats-details ${
        detailsOpen ? "reading-modal__stats-details--open" : ""
      }`}
    >
      <h3 className="reading-modal__stats-title">
        <span>▥</span>
        Детальна статистика
      </h3>

      <div className="reading-modal__stats">
        <div
          className={`reading-modal__stats-item reading-modal__stats-item--current-session ${
            activeSession
              ? "reading-modal__stats-item--current-session-active"
              : ""
          }`}
        >
          <span className="reading-modal__stats-label">Поточна сесія</span>

          <span className="reading-modal__stats-session-row">
            <span className="reading-modal__stats-value reading-modal__stats-value--timer">
              {activeSession ? formatTime(elapsedSeconds) : "00:00:00"}
            </span>

            <span className="reading-modal__stats-session-icon">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <circle cx="12" cy="13" r="8" />
                <path d="M12 9v4l2.5 1.5" />
                <path d="M9 2h6" />
                <path d="M12 2v3" />
              </svg>
            </span>
          </span>
        </div>

        <div className="reading-modal__stats-item">
          <span className="reading-modal__stats-label">Прочитано</span>
          <span className="reading-modal__stats-value">{progressReadValue}</span>
        </div>

        <div className="reading-modal__stats-item">
          <span className="reading-modal__stats-label">Загальний час</span>
          <span className="reading-modal__stats-value">{totalReadingValue}</span>
        </div>

        <div className="reading-modal__stats-item">
          <span className="reading-modal__stats-label">Швидкість</span>
          <span className="reading-modal__stats-value">
            {speedValue} {speedUnit}
          </span>
        </div>

        <div className="reading-modal__stats-item">
          <span className="reading-modal__stats-label">Залишилось</span>
          <span className="reading-modal__stats-value">{remainingValue}</span>
        </div>

        <div className="reading-modal__stats-item">
          <span className="reading-modal__stats-label">Орієнтовний час</span>
          <span className="reading-modal__stats-value">{estimatedTimeValue}</span>
        </div>

        <button
          type="button"
          className="reading-modal__stats-item reading-modal__stats-item--calendar"
          onClick={onOpenSessions}
          aria-label="Відкрити історію сесій"
        >
          <span className="reading-modal__stats-label">Сесій</span>

          <span className="reading-modal__stats-calendar-row">
            <span className="reading-modal__stats-value">{sessionsCount}</span>

            <span className="reading-modal__stats-calendar-icon">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <circle cx="12" cy="12" r="8" />
                <path d="M12 8v4l3 2" />
              </svg>
            </span>
          </span>
        </button>

        <div className="reading-modal__stats-item reading-modal__stats-item--longest-session">
          <span className="reading-modal__stats-label">Найдовша сесія</span>

          <span className="reading-modal__stats-session-row">
            <span className="reading-modal__stats-value reading-modal__stats-value--timer">
              {formatTime(longestSessionSeconds)}
            </span>

            <span className="reading-modal__stats-session-icon">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <circle cx="12" cy="9" r="5" />
                <path d="m9 14-1 7 4-2 4 2-1-7" />
              </svg>
            </span>
          </span>
        </div>

        <button
          type="button"
          className="reading-modal__stats-item reading-modal__stats-item--calendar"
          onClick={onOpenCalendar}
          aria-label="Відкрити календар читання"
        >
          <span className="reading-modal__stats-label">Календар</span>

          <span className="reading-modal__stats-calendar-row">
            <span className="reading-modal__stats-value">Відкрити</span>

            <span className="reading-modal__stats-calendar-icon">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <rect x="3" y="5" width="18" height="16" rx="2" />
                <path d="M16 3v4" />
                <path d="M8 3v4" />
                <path d="M3 10h18" />
              </svg>
            </span>
          </span>
        </button>
      </div>
    </div>
  );
};

export default ReadingStatsDetails;
