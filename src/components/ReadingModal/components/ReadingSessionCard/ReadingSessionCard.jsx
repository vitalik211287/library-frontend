import { formatTime } from "../../utils/readingModalHelpers.js";

import "./ReadingSessionCard.css";

const ReadingSessionCard = ({
  activeSession,
  currentBook,

  loading,
  finishing,
  pauseLoading,

  elapsedSeconds,

  progressMode,
  onProgressModeChange,

  startProgress,
  setStartProgress,

  endProgress,
  setEndProgress,

  isPaused,

  finishValidationMessage,
  canFinish,

  onStart,
  onPause,
  onResume,
  onFinish,
}) => {
  const isPagesMode = (activeSession?.progressMode ?? progressMode) === "PAGES";

  const isPercentMode = !isPagesMode;

  const startValue = isPercentMode
    ? (activeSession?.startPercent ?? 0)
    : (activeSession?.startPage ?? 0);

  if (!activeSession) {
    return (
      <section className="reading-modal__session-card">
        <div className="reading-modal__session-setup">
          <div className="reading-modal__setup-section">
            <div className="reading-modal__setup-heading">
              <span className="reading-modal__setup-number">1</span>

              <h3>Спосіб підрахунку прогресу</h3>
            </div>

            <div
              className="reading-modal__mode-switch"
              role="group"
              aria-label="Спосіб підрахунку прогресу"
            >
              <button
                type="button"
                className={
                  progressMode === "PAGES"
                    ? "reading-modal__mode-button reading-modal__mode-button--active"
                    : "reading-modal__mode-button"
                }
                onClick={() => onProgressModeChange("PAGES")}
              >
                Сторінки
              </button>

              <button
                type="button"
                className={
                  progressMode === "PERCENT"
                    ? "reading-modal__mode-button reading-modal__mode-button--active"
                    : "reading-modal__mode-button"
                }
                onClick={() => onProgressModeChange("PERCENT")}
              >
                Відсотки
              </button>
            </div>

            <p className="reading-modal__mode-note">
              Цей спосіб збережеться для цієї книги. Його можна буде змінити
              пізніше.
            </p>
          </div>

          <div className="reading-modal__setup-section">
            <div className="reading-modal__setup-heading">
              <span className="reading-modal__setup-number">2</span>

              <h3>
                {progressMode === "PERCENT"
                  ? "З якого відсотка починаєте?"
                  : "З якої сторінки починаєте?"}
              </h3>
            </div>

            <div className="reading-modal__progress-input-wrap">
              <input
                id="reading-start-progress"
                type="number"
                min="0"
                max={
                  progressMode === "PERCENT"
                    ? 100
                    : (currentBook.pages ?? undefined)
                }
                step="1"
                value={startProgress}
                onChange={(event) => setStartProgress(event.target.value)}
                placeholder="0"
                inputMode="numeric"
              />

              <span className="reading-modal__progress-input-suffix">
                {progressMode === "PERCENT"
                  ? "%"
                  : currentBook.pages
                    ? `/ ${currentBook.pages}`
                    : "стор."}
              </span>
            </div>

            {progressMode === "PAGES" && currentBook.pages && (
              <p className="reading-modal__mode-note">
                У книзі {currentBook.pages} сторінок
              </p>
            )}
          </div>
        </div>

        <button
          type="button"
          className="reading-modal__start"
          onClick={onStart}
          disabled={loading || startProgress === ""}
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
        <h3>Сесія читання</h3>

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

      <div className="reading-modal__session-start-progress">
        Початок сесії:{" "}
        <strong>
          {startValue}
          {isPercentMode
            ? "%"
            : currentBook.pages
              ? ` / ${currentBook.pages}`
              : " стор."}
        </strong>
      </div>

      <div className="reading-modal__finish-form">
        <label htmlFor="reading-end-progress">
          {isPercentMode
            ? "До якого відсотка дочитали?"
            : "На якій сторінці зупинилися?"}
        </label>

        <div className="reading-modal__progress-input-wrap">
          <input
            id="reading-end-progress"
            type="number"
            min={startValue}
            max={isPercentMode ? 100 : (currentBook.pages ?? undefined)}
            step="1"
            value={endProgress}
            onChange={(event) => setEndProgress(event.target.value)}
            placeholder={String(
              isPercentMode ? Math.min(startValue + 5, 100) : startValue + 10,
            )}
            inputMode="numeric"
          />

          <span className="reading-modal__progress-input-suffix">
            {isPercentMode
              ? "%"
              : currentBook.pages
                ? `/ ${currentBook.pages}`
                : "стор."}
          </span>
        </div>

        {finishValidationMessage && (
          <p className="reading-modal__validation-error">
            {finishValidationMessage}
          </p>
        )}
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
          disabled={finishing || !canFinish}
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
