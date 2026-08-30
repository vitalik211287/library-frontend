import { formatTime } from "../../utils/readingModalHelpers.js";

import "./ReadingSessionCard.css";

const ReadingSessionCard = ({
  activeSession,
  currentBook,

  loading,
  finishing,
  pauseLoading,

  elapsedSeconds,

  endPage,
  setEndPage,

  isPaused,

  onStart,
  onPause,
  onResume,
  onFinish,
}) => {
  if (!activeSession) {
    return (
      <section className="reading-modal__session-card">
        <div className="reading-modal__session-empty">
          <div className="reading-modal__session-icon">▶</div>

          <div>
            <h3>Сесія читання не активна</h3>

            <p>Почніть читати, щоб відстежувати час та прогрес.</p>
          </div>
        </div>

        <button
          type="button"
          className="reading-modal__start"
          onClick={onStart}
          disabled={loading}
        >
          <span className="reading-modal__action-icon">▶</span>

          <span className="reading-modal__action-text">
            {loading ? "Запускаємо..." : "Почати читання"}
          </span>
        </button>
      </section>
    );
  }

  return (
    <section className="reading-modal__session-card">
      <div className="reading-modal__session-header">
        <h3>◉ Сесія читання</h3>

        <span
          className={`reading-modal__session-status ${
            isPaused ? "reading-modal__session-status--paused" : ""
          }`}
        >
          <span />

          {isPaused ? "ПАУЗА" : "АКТИВНА"}
        </span>
      </div>

      <div className="reading-modal__timer">{formatTime(elapsedSeconds)}</div>

      <p className="reading-modal__timer-caption">
        {isPaused ? "Читання на паузі" : "Тривалість сесії"}
      </p>

      <div className="reading-modal__finish-form">
        <label htmlFor="reading-end-page">На якій сторінці зупинився?</label>

        <input
          id="reading-end-page"
          type="number"
          min={activeSession.startPage}
          max={currentBook.pages ?? undefined}
          value={endPage}
          onChange={(event) => setEndPage(event.target.value)}
          placeholder={`Наприклад, ${activeSession.startPage + 10}`}
        />

        <span className="reading-modal__session-page">
          Початкова сторінка: {activeSession.startPage}
        </span>
      </div>

      <div className="reading-modal__session-actions">
        {!isPaused && (
          <button
            type="button"
            className="reading-modal__pause"
            onClick={onPause}
            disabled={pauseLoading}
          >
            <span className="reading-modal__action-icon">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <rect x="6" y="5" width="4" height="14" rx="1" />

                <rect x="14" y="5" width="4" height="14" rx="1" />
              </svg>
            </span>

            <span className="reading-modal__action-text">
              {pauseLoading ? "Пауза..." : "Пауза"}
            </span>
          </button>
        )}

        {isPaused && (
          <button
            type="button"
            className="reading-modal__resume"
            onClick={onResume}
            disabled={pauseLoading}
          >
            <span className="reading-modal__action-icon">▶</span>

            <span className="reading-modal__action-text">
              {pauseLoading ? "Продовжуємо..." : "Продовжити"}
            </span>
          </button>
        )}

        <button
          type="button"
          className="reading-modal__finish"
          onClick={onFinish}
          disabled={finishing || endPage === ""}
        >
          <span className="reading-modal__action-icon">■</span>

          <span className="reading-modal__action-text">
            {finishing ? "Завершуємо..." : "Завершити"}
          </span>
        </button>
      </div>
    </section>
  );
};

export default ReadingSessionCard;
