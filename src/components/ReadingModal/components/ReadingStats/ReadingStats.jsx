import { useNavigate } from "react-router-dom";

import { formatDuration, formatTime } from "../../utils/readingModalHelpers.js";

import "./ReadingStats.css";

const ReadingStats = ({ stats, activeSession, elapsedSeconds, bookId }) => {
  const navigate = useNavigate();

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

  const longestSessionSeconds = Math.max(
    stats.longestSessionSeconds ?? 0,
    activeSession ? elapsedSeconds : 0,
  );

  return (
    <section className="reading-modal__stats-section">
      <h3 className="reading-modal__stats-title">
        <span>▥</span>
        Статистика
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
            {stats.pagesRead} стор.
          </span>
        </div>

        <div className="reading-modal__stats-item">
          <span className="reading-modal__stats-label">Загальний час</span>

          <span className="reading-modal__stats-value">
            {formatDuration(stats.totalReadingSeconds)}
          </span>
        </div>

        <div className="reading-modal__stats-item">
          <span className="reading-modal__stats-label">Швидкість</span>

          <span className="reading-modal__stats-value">
            {stats.pagesPerHour} стор./год
          </span>
        </div>

        <div className="reading-modal__stats-item">
          <span className="reading-modal__stats-label">Залишилось</span>

          <span className="reading-modal__stats-value">
            {stats.remainingPages ?? "—"} стор.
          </span>
        </div>

        <div className="reading-modal__stats-item">
          <span className="reading-modal__stats-label">Орієнтовний час</span>

          <span className="reading-modal__stats-value">
            {stats.estimatedRemainingSeconds !== null &&
            stats.estimatedRemainingSeconds !== undefined
              ? formatDuration(stats.estimatedRemainingSeconds)
              : "—"}
          </span>
        </div>

        <button
          type="button"
          className="reading-modal__stats-item reading-modal__stats-item--calendar"
          onClick={handleOpenCalendar}
          aria-label="Відкрити календар читання"
          title="Відкрити календар читання"
        >
          <span className="reading-modal__stats-label">Сесій</span>

          <span className="reading-modal__stats-calendar-row">
            <span className="reading-modal__stats-value">
              {stats.sessionsCount}
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

                <path d="m12 6 .9 1.8 2 .3-1.45 1.4.35 2-1.8-.95-1.8.95.35-2L9.1 8.1l2-.3L12 6Z" />
              </svg>
            </span>
          </span>
        </div>
      </div>
    </section>
  );
};

export default ReadingStats;
