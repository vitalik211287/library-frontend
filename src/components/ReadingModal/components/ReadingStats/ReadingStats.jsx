import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { formatDuration, formatTime } from "../../utils/readingModalHelpers.js";

import "./ReadingStats.css";

const formatEstimatedTime = (seconds) => {
  if (seconds === null || seconds === undefined || seconds <= 0) {
    return "—";
  }

  const totalMinutes = Math.ceil(seconds / 60);

  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours === 0) {
    return `${minutes} хв`;
  }

  if (minutes === 0) {
    return `${hours} год`;
  }

  return `${hours} год ${minutes} хв`;
};

const ReadingStats = ({ stats, activeSession, elapsedSeconds, bookId }) => {
  const navigate = useNavigate();

  const [detailsOpen, setDetailsOpen] = useState(false);

  if (!stats) {
    return null;
  }

  const handleOpenCalendar = () => {
    navigate(`/calendar?book=${bookId}`, {
      state: {
        fromReadingModal: true,
        bookId,
      },
    });
  };

  const isPercentMode = stats.progressMode === "PERCENT";

  const longestSessionSeconds = Math.max(
    stats.longestSessionSeconds ?? 0,
    activeSession ? elapsedSeconds : 0,
  );

  const totalReadingSeconds = stats.totalReadingSeconds ?? 0;

  const pagesRead = stats.pagesRead ?? 0;

  const percentRead = stats.percentRead ?? 0;

  const sessionsCount = stats.sessionsCount ?? 0;

  const pagesPerHour = stats.pagesPerHour ?? 0;

  const percentPerHour = stats.percentPerHour ?? 0;

  const progressReadValue = isPercentMode
    ? `${percentRead}%`
    : `${pagesRead} стор.`;

  const speedValue = isPercentMode ? percentPerHour : pagesPerHour;

  const speedUnit = isPercentMode ? "%/год" : "стор./год";

  const remainingValue = isPercentMode
    ? stats.remainingPercent !== null && stats.remainingPercent !== undefined
      ? `${stats.remainingPercent}%`
      : "—"
    : stats.remainingPages !== null && stats.remainingPages !== undefined
      ? `${stats.remainingPages} стор.`
      : "—";

  const estimatedTimeValue = formatEstimatedTime(
    stats.estimatedRemainingSeconds,
  );

  return (
    <section className="reading-modal__stats-section">
      <div className="reading-modal__stats-mobile">
        <div className="reading-modal__quick-stats">
          <div className="reading-modal__quick-stat">
            <span className="reading-modal__quick-stat-icon">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <circle cx="12" cy="12" r="8" />

                <path d="M12 8v5l3 2" />
              </svg>
            </span>

            <strong>{formatDuration(totalReadingSeconds)}</strong>

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
          onClick={() => setDetailsOpen((current) => !current)}
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

            <span className="reading-modal__stats-value">
              {progressReadValue}
            </span>
          </div>

          <div className="reading-modal__stats-item">
            <span className="reading-modal__stats-label">Загальний час</span>

            <span className="reading-modal__stats-value">
              {formatDuration(totalReadingSeconds)}
            </span>
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

            <span className="reading-modal__stats-value">
              {estimatedTimeValue}
            </span>
          </div>

          <button
            type="button"
            className="reading-modal__stats-item reading-modal__stats-item--calendar"
            onClick={handleOpenCalendar}
            aria-label="Відкрити календар читання"
          >
            <span className="reading-modal__stats-label">Сесій</span>

            <span className="reading-modal__stats-calendar-row">
              <span className="reading-modal__stats-value">
                {sessionsCount}
              </span>

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
        </div>
      </div>
    </section>
  );
};

export default ReadingStats;
