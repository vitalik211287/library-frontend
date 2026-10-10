import { useEffect, useState } from "react";

import {
  getActiveReadingSession,
  getReadingStats,
} from "../../../reading/components/ReadingModal/api/readingSessionApi.js";
import { formatDuration } from "../../../reading/components/ReadingModal/components/ReadingSessionsModal/utils/readingSessionHelpers.js";
import { getReadingStatusLabel } from "../../../reading/components/ReadingModal/utils/readingModalHelpers.js";

import "./EbookReaderStatsPanel.css";

const clampPercent = (value) =>
  Math.min(100, Math.max(0, Math.round(Number(value) || 0)));

// Displays the existing reading metrics; does not create a new session or tally.
const EbookReaderStatsPanel = ({ bookId, bookTitle, currentPercent, currentStatus, onClose, onOpenHistory, onOpenStatus }) => {
  const [stats, setStats] = useState(null);
  const [active, setActive] = useState(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let valid = true;

    Promise.all([getReadingStats(bookId), getActiveReadingSession(bookId)])
      .then(([summary, current]) => {
        if (!valid) return;
        setStats(summary?.stats ?? null);
        setActive(current?.session ?? null);
        setElapsedSeconds(Math.max(0, current?.elapsedSeconds ?? 0));
      })
      .catch((cause) => {
        if (valid) setError(cause?.message || "Не вдалося отримати статистику");
      })
      .finally(() => {
        if (valid) setLoading(false);
      });

    return () => {
      valid = false;
    };
  }, [bookId]);

  // The canonical duration comes from the backend. This is only a local display timer.
  useEffect(() => {
    if (!active || active.pausedAt) return undefined;
    const id = window.setInterval(() => setElapsedSeconds((seconds) => seconds + 1), 1000);
    return () => window.clearInterval(id);
  }, [active]);

  const savedPercent = stats?.progressMode === "PERCENT" ? stats?.progressPercent : null;
  const readingPercent = Number.isFinite(currentPercent)
    ? clampPercent(currentPercent)
    : Number.isFinite(savedPercent)
      ? clampPercent(savedPercent)
      : null;

  return (
    <section className="ebook-reader-stats" aria-label="Статистика читання книги">
      <div className="ebook-reader-stats__header">
        <div className="ebook-reader-stats__heading">
          <h2>Статистика читання</h2>
          <p>{bookTitle}</p>
        </div>
        <button type="button" className="ebook-reader-stats__close" onClick={onClose} aria-label="Повернутися до книги">
          ×
        </button>
      </div>

      <button
        type="button"
        className="ebook-reader-stats__status"
        onClick={onOpenStatus}
      >
        <span>Статус книги</span>
        <strong>{getReadingStatusLabel(currentStatus)}</strong>
        <span>Змінити →</span>
      </button>
      {loading ? (
        <p className="ebook-reader-stats__message" role="status">Отримуємо статистику…</p>
      ) : error ? (
        <p className="ebook-reader-stats__message" role="alert">{error}</p>
      ) : (
        <>
          <div className="ebook-reader-stats__grid">
            <div className="ebook-reader-stats__metric">
              <span>Активна сесія</span>
              <strong>{active ? formatDuration(elapsedSeconds) : "Немає"}</strong>
            </div>
            <div className="ebook-reader-stats__metric">
              <span>Місце в EPUB</span>
              <strong>{readingPercent === null ? "—" : `${readingPercent}%`}</strong>
            </div>
            <div className="ebook-reader-stats__metric">
              <span>Час читання книги</span>
              <strong>{formatDuration(stats?.totalReadingSeconds ?? 0)}</strong>
              <small>Завершені сесії</small>
            </div>
            <div className="ebook-reader-stats__metric">
              <span>Усього сесій</span>
              <strong>{stats?.sessionsCount ?? 0}</strong>
            </div>
          </div>

          <div className="ebook-reader-stats__position">
            <div className="ebook-reader-stats__position-label">
              <span>Прогрес книги</span>
              <strong>{readingPercent === null ? "—" : `${readingPercent}%`}</strong>
            </div>
            <div
              className="ebook-reader-stats__track"
              role={readingPercent === null ? "presentation" : "progressbar"}
              aria-label="Позиція в електронній книзі"
              aria-valuemin={readingPercent === null ? undefined : 0}
              aria-valuemax={readingPercent === null ? undefined : 100}
              aria-valuenow={readingPercent === null ? undefined : readingPercent}
            >
              <span style={{ width: `${readingPercent ?? 0}%` }} />
            </div>
          </div>

        </>
      )}

      <button type="button" className="ebook-reader-stats__history" onClick={onOpenHistory}>
        <span>Історія сесій цієї книги</span>
        <span aria-hidden="true">→</span>
      </button>
    </section>
  );
};

export default EbookReaderStatsPanel;
