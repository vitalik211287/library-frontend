import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import "./ReadingModal.css";

function ReadingModal({ book, apiUrl, onClose }) {
  const [activeSession, setActiveSession] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [endPage, setEndPage] = useState("");
  const [finishing, setFinishing] = useState(false);
  const [currentBook, setCurrentBook] = useState(book);
  const [stats, setStats] = useState(null);
  const [ratingLoading, setRatingLoading] = useState(false);
  const [pauseLoading, setPauseLoading] = useState(false);

  const navigate = useNavigate();

  const token = localStorage.getItem("token");

  const progress =
    currentBook.pages && currentBook.pages > 0
      ? Math.round(
          ((currentBook.currentPage ?? 0) / currentBook.pages) * 1000,
        ) / 10
      : 0;

  const isPaused = Boolean(activeSession?.pausedAt);

  const getAuthHeaders = () => ({
    Authorization: `Bearer ${token}`,
  });

  const getStatusLabel = () => {
    if (activeSession) {
      return isPaused ? "PAUSED" : "READING";
    }

    return currentBook.status;
  };

  const handleOverlayClick = (event) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  const fetchUserBook = async () => {
    try {
      const response = await fetch(`${apiUrl}/api/user-books/${book.id}`, {
        headers: getAuthHeaders(),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          return;
        }

        setMessage(data.message || "Не вдалося отримати дані читання");

        return;
      }

      setCurrentBook({
        ...data.book,
        currentPage: data.currentPage ?? 0,
        status: data.status ?? "NOT_STARTED",
        rating: data.rating ?? null,
      });
    } catch (error) {
      console.error("Помилка отримання даних книги:", error);

      setMessage("Не вдалося отримати дані читання");
    }
  };

  const fetchReadingStats = async () => {
    try {
      const response = await fetch(
        `${apiUrl}/api/user-books/${book.id}/reading/stats`,
        {
          headers: getAuthHeaders(),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        return;
      }

      setStats(data.stats);
    } catch (error) {
      console.error("Помилка отримання статистики:", error);
    }
  };

  const handleStartReading = async () => {
    try {
      setLoading(true);
      setMessage("");

      const response = await fetch(
        `${apiUrl}/api/user-books/${book.id}/reading/start`,
        {
          method: "POST",
          headers: getAuthHeaders(),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || "Не вдалося почати читання");

        return;
      }

      setElapsedSeconds(0);
      setActiveSession(data.session);

      setCurrentBook((current) => ({
        ...current,
        status: "READING",
      }));

      setMessage("Читання розпочато");
    } catch (error) {
      console.error("Помилка запуску читання:", error);

      setMessage("Не вдалося почати читання");
    } finally {
      setLoading(false);
    }
  };

  const handlePauseReading = async () => {
    try {
      setPauseLoading(true);
      setMessage("");

      const response = await fetch(
        `${apiUrl}/api/user-books/${book.id}/reading/pause`,
        {
          method: "POST",
          headers: getAuthHeaders(),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || "Не вдалося поставити читання на паузу");

        return;
      }

      setActiveSession(data.session);

      setMessage("Читання поставлено на паузу");
    } catch (error) {
      console.error("Помилка паузи читання:", error);

      setMessage("Не вдалося поставити читання на паузу");
    } finally {
      setPauseLoading(false);
    }
  };

  const handleResumeReading = async () => {
    try {
      setPauseLoading(true);
      setMessage("");

      const response = await fetch(
        `${apiUrl}/api/user-books/${book.id}/reading/resume`,
        {
          method: "POST",
          headers: getAuthHeaders(),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || "Не вдалося продовжити читання");

        return;
      }

      setActiveSession(data.session);

      setMessage("Читання продовжено");
    } catch (error) {
      console.error("Помилка продовження читання:", error);

      setMessage("Не вдалося продовжити читання");
    } finally {
      setPauseLoading(false);
    }
  };

  const handleRatingChange = async (rating) => {
    try {
      setRatingLoading(true);
      setMessage("");

      const response = await fetch(`${apiUrl}/api/user-books/${book.id}`, {
        method: "PATCH",

        headers: {
          ...getAuthHeaders(),
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          rating,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || "Не вдалося зберегти оцінку");

        return;
      }

      setCurrentBook((current) => ({
        ...current,
        rating: data.rating,
      }));

      setMessage("Оцінку збережено");
    } catch (error) {
      console.error("Помилка збереження оцінки:", error);

      setMessage("Не вдалося зберегти оцінку");
    } finally {
      setRatingLoading(false);
    }
  };

  const handleFinishReading = async () => {
    const page = Number(endPage);

    if (!Number.isInteger(page)) {
      setMessage("Вкажи коректний номер сторінки");

      return;
    }

    if (activeSession && page < activeSession.startPage) {
      setMessage(`Сторінка не може бути меншою за ${activeSession.startPage}`);

      return;
    }

    if (currentBook.pages && page > currentBook.pages) {
      setMessage(`У книзі всього ${currentBook.pages} сторінок`);

      return;
    }

    try {
      setFinishing(true);
      setMessage("");

      const response = await fetch(
        `${apiUrl}/api/user-books/${book.id}/reading/finish`,
        {
          method: "POST",

          headers: {
            ...getAuthHeaders(),
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            endPage: page,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || "Не вдалося завершити читання");

        return;
      }

      setCurrentBook((current) => ({
        ...current,

        currentPage: page,

        status: current.pages && page >= current.pages ? "FINISHED" : "READING",
      }));

      setActiveSession(null);
      setElapsedSeconds(0);
      setEndPage("");

      await fetchReadingStats();

      setMessage("Сесію читання завершено");
    } catch (error) {
      console.error("Помилка завершення читання:", error);

      setMessage("Не вдалося завершити читання");
    } finally {
      setFinishing(false);
    }
  };

  const handleOpenCalendar = () => {
    navigate(`/calendar?book=${book.id}`, {
      state: {
        fromReadingModal: true,
        bookId: book.id,
      },
    });
  };

  useEffect(() => {
    if (!activeSession || activeSession.pausedAt) {
      return;
    }

    const intervalId = setInterval(() => {
      setElapsedSeconds((seconds) => seconds + 1);
    }, 1000);

    return () => {
      clearInterval(intervalId);
    };
  }, [activeSession]);

  useEffect(() => {
    const fetchActiveSession = async () => {
      try {
        const response = await fetch(
          `${apiUrl}/api/user-books/${book.id}/reading/active`,
          {
            headers: getAuthHeaders(),
          },
        );

        const data = await response.json();

        if (!response.ok) {
          return;
        }

        if (data.session) {
          setElapsedSeconds(data.elapsedSeconds ?? 0);

          setActiveSession(data.session);

          setCurrentBook((current) => ({
            ...current,
            status: "READING",
          }));
        }
      } catch (error) {
        console.error("Помилка отримання активної сесії:", error);
      }
    };

    fetchActiveSession();
  }, [apiUrl, book.id]);

  useEffect(() => {
    fetchUserBook();
  }, [apiUrl, book.id]);

  useEffect(() => {
    fetchReadingStats();
  }, [apiUrl, book.id]);

  const formatTime = (totalSeconds) => {
    const hours = Math.floor(totalSeconds / 3600);

    const minutes = Math.floor((totalSeconds % 3600) / 60);

    const seconds = totalSeconds % 60;

    return [hours, minutes, seconds]
      .map((value) => String(value).padStart(2, "0"))
      .join(":");
  };

  const formatDuration = (totalSeconds) => {
    if (totalSeconds === null || totalSeconds === undefined) {
      return "—";
    }

    const hours = Math.floor(totalSeconds / 3600);

    const minutes = Math.floor((totalSeconds % 3600) / 60);

    if (hours > 0) {
      return `${hours} год ${minutes} хв`;
    }

    return `${minutes} хв`;
  };

  return (
    <div className="reading-modal-overlay" onMouseDown={handleOverlayClick}>
      <div
        className="reading-modal"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          className="reading-modal__close"
          onClick={onClose}
          aria-label="Закрити"
        >
          ×
        </button>

        <div className="reading-modal__header">
          <h2>{currentBook.title}</h2>

          <p className="reading-modal__author">{currentBook.author}</p>
        </div>

        {message && <p className="reading-modal__message">{message}</p>}

        <div className="reading-modal__layout">
          {/* BOOK INFO */}

          <div className="reading-modal__top">
            <div className="reading-modal__cover">
              {currentBook.coverUrl ? (
                <img
                  src={
                    currentBook.coverUrl.startsWith("/uploads")
                      ? `${apiUrl}${currentBook.coverUrl}`
                      : currentBook.coverUrl
                  }
                  alt={currentBook.title}
                />
              ) : (
                <div className="reading-modal__no-cover">Немає обкладинки</div>
              )}
            </div>

            <div className="reading-modal__info">
              <div className="reading-modal__info-item">
                <span className="reading-modal__info-label">
                  Поточна сторінка
                </span>

                <span className="reading-modal__info-value">
                  {currentBook.currentPage ?? 0}
                </span>
              </div>

              <div className="reading-modal__info-item">
                <span className="reading-modal__info-label">
                  Всього сторінок
                </span>

                <span className="reading-modal__info-value">
                  {currentBook.pages ?? "—"}
                </span>
              </div>

              <div className="reading-modal__info-item">
                <span className="reading-modal__info-label">Статус</span>

                <span className="reading-modal__info-value reading-modal__info-value--accent">
                  {getStatusLabel()}
                </span>
              </div>

              <div className="reading-modal__info-item">
                <span className="reading-modal__info-label">Оцінка</span>

                <div className="reading-modal__rating">
                  {[1, 2, 3, 4, 5].map((value) => (
                    <button
                      key={value}
                      type="button"
                      className="reading-modal__star"
                      onClick={() => handleRatingChange(value)}
                      disabled={ratingLoading}
                      aria-label={`Оцінити на ${value} з 5`}
                      title={`${value} з 5`}
                    >
                      {value <= (currentBook.rating ?? 0) ? "★" : "☆"}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* PROGRESS */}

          <div className="reading-modal__progress">
            <div className="reading-modal__progress-header">
              <span>Прогрес читання</span>

              <strong>{progress}%</strong>
            </div>

            <div className="reading-modal__progress-track">
              <div
                className="reading-modal__progress-bar"
                style={{
                  width: `${Math.min(progress, 100)}%`,
                }}
              />
            </div>
          </div>

          {/* SESSION */}

          <section className="reading-modal__session-card">
            {!activeSession ? (
              <>
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
                  onClick={handleStartReading}
                  disabled={loading}
                >
                  {loading ? "Запускаємо..." : "▶ Почати читання"}
                </button>
              </>
            ) : (
              <>
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

                <div className="reading-modal__timer">
                  {formatTime(elapsedSeconds)}
                </div>

                <p className="reading-modal__timer-caption">
                  {isPaused ? "Читання на паузі" : "Тривалість сесії"}
                </p>

                <div className="reading-modal__finish-form">
                  <label htmlFor="reading-end-page">
                    На якій сторінці зупинився?
                  </label>

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
                      onClick={handlePauseReading}
                      disabled={pauseLoading}
                    >
                      {pauseLoading ? "Пауза..." : "⏸ Пауза"}
                    </button>
                  )}

                  {isPaused && (
                    <button
                      type="button"
                      className="reading-modal__resume"
                      onClick={handleResumeReading}
                      disabled={pauseLoading}
                    >
                      {pauseLoading ? "Продовжуємо..." : "▶ Продовжити"}
                    </button>
                  )}

                  <button
                    type="button"
                    className="reading-modal__finish"
                    onClick={handleFinishReading}
                    disabled={finishing || endPage === ""}
                  >
                    {finishing ? "Завершуємо..." : "■ Завершити"}
                  </button>
                </div>
              </>
            )}
          </section>

          {/* STATS */}

          {stats && (
            <section className="reading-modal__stats-section">
              <h3 className="reading-modal__stats-title">
                <span>▥</span>
                Статистика
              </h3>

              <div className="reading-modal__stats">
                <div className="reading-modal__stats-item">
                  <span className="reading-modal__stats-label">
                    Загальний час
                  </span>

                  <span className="reading-modal__stats-value">
                    {formatDuration(stats.totalReadingSeconds)}
                  </span>
                </div>

                <div className="reading-modal__stats-item">
                  <span className="reading-modal__stats-label">Прочитано</span>

                  <span className="reading-modal__stats-value">
                    {stats.pagesRead} стор.
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
                  <span className="reading-modal__stats-label">
                    Орієнтовний час
                  </span>

                  <span className="reading-modal__stats-value">
                    {formatDuration(stats.estimatedRemainingSeconds)}
                  </span>
                </div>

                <button
                  type="button"
                  className="reading-modal__stats-item reading-modal__stats-item--calendar"
                  onClick={handleOpenCalendar}
                  aria-label="Відкрити календар читання"
                  title="Відкрити календар читання"
                >
                  <div className="reading-modal__stats-div">
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
                  </div>
                </button>
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}

export default ReadingModal;
