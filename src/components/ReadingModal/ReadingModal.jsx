import { useEffect, useState } from "react";
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

  const token = localStorage.getItem("token");

  const progress =
    currentBook.pages && currentBook.pages > 0
      ? Math.round(
          ((currentBook.currentPage ?? 0) /
            currentBook.pages) *
            1000,
        ) / 10
      : 0;

  const getAuthHeaders = () => ({
    Authorization: `Bearer ${token}`,
  });

  const handleOverlayClick = (event) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  // =====================================================
  // Отримання персональних даних книги
  // =====================================================

  const fetchUserBook = async () => {
    try {
      const response = await fetch(
        `${apiUrl}/api/user-books/${book.id}`,
        {
          headers: getAuthHeaders(),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(
          data.message ||
            "Не вдалося отримати дані читання",
        );

        return;
      }

      /*
        Backend повертає UserBook:

        {
          id,
          userId,
          bookId,
          currentPage,
          status,
          rating,
          book: {...}
        }

        Для існуючої верстки об'єднуємо
        Book + UserBook.
      */

      setCurrentBook({
        ...data.book,
        currentPage: data.currentPage ?? 0,
        status: data.status ?? "NOT_STARTED",
        rating: data.rating ?? null,
      });
    } catch (error) {
      console.error(
        "Помилка отримання даних книги:",
        error,
      );
    }
  };

  // =====================================================
  // Статистика
  // =====================================================

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
      console.error(
        "Помилка отримання статистики:",
        error,
      );
    }
  };

  // =====================================================
  // Початок читання
  // =====================================================

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
        setMessage(
          data.message ||
            "Не вдалося почати читання",
        );

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
      console.error(
        "Помилка запуску читання:",
        error,
      );

      setMessage("Не вдалося почати читання");
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // Рейтинг
  // =====================================================

  const handleRatingChange = async (rating) => {
    try {
      setRatingLoading(true);
      setMessage("");

      const response = await fetch(
        `${apiUrl}/api/user-books/${book.id}`,
        {
          method: "PATCH",

          headers: {
            ...getAuthHeaders(),
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            rating,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(
          data.message ||
            "Не вдалося зберегти оцінку",
        );

        return;
      }

      setCurrentBook((current) => ({
        ...current,
        rating: data.rating,
      }));

      setMessage("Оцінку збережено");
    } catch (error) {
      console.error(
        "Помилка збереження оцінки:",
        error,
      );

      setMessage("Не вдалося зберегти оцінку");
    } finally {
      setRatingLoading(false);
    }
  };

  // =====================================================
  // Завершення сесії
  // =====================================================

  const handleFinishReading = async () => {
    const page = Number(endPage);

    if (!Number.isInteger(page)) {
      setMessage(
        "Вкажи коректний номер сторінки",
      );

      return;
    }

    if (
      activeSession &&
      page < activeSession.startPage
    ) {
      setMessage(
        `Сторінка не може бути меншою за ${activeSession.startPage}`,
      );

      return;
    }

    if (
      currentBook.pages &&
      page > currentBook.pages
    ) {
      setMessage(
        `У книзі всього ${currentBook.pages} сторінок`,
      );

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
        setMessage(
          data.message ||
            "Не вдалося завершити читання",
        );

        return;
      }

      setCurrentBook((current) => ({
        ...current,

        currentPage: page,

        status:
          current.pages &&
          page >= current.pages
            ? "FINISHED"
            : "READING",
      }));

      setActiveSession(null);
      setElapsedSeconds(0);
      setEndPage("");

      await fetchReadingStats();

      setMessage(
        "Сесію читання завершено",
      );
    } catch (error) {
      console.error(
        "Помилка завершення читання:",
        error,
      );

      setMessage(
        "Не вдалося завершити читання",
      );
    } finally {
      setFinishing(false);
    }
  };

  // =====================================================
  // Таймер
  // =====================================================

  useEffect(() => {
    if (!activeSession) {
      return;
    }

    const intervalId = setInterval(() => {
      setElapsedSeconds(
        (seconds) => seconds + 1,
      );
    }, 1000);

    return () => {
      clearInterval(intervalId);
    };
  }, [activeSession]);

  // =====================================================
  // Активна сесія
  // =====================================================

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
          setElapsedSeconds(
            data.elapsedSeconds ?? 0,
          );

          setActiveSession(data.session);

          setCurrentBook((current) => ({
            ...current,
            status: "READING",
          }));
        }
      } catch (error) {
        console.error(
          "Помилка отримання активної сесії:",
          error,
        );
      }
    };

    fetchActiveSession();
  }, [apiUrl, book.id]);

  // =====================================================
  // Початкове завантаження UserBook
  // =====================================================

  useEffect(() => {
    fetchUserBook();
  }, [apiUrl, book.id]);

  // =====================================================
  // Початкове завантаження статистики
  // =====================================================

  useEffect(() => {
    fetchReadingStats();
  }, [apiUrl, book.id]);

  // =====================================================
  // Форматування часу
  // =====================================================

  const formatTime = (totalSeconds) => {
    const hours = Math.floor(
      totalSeconds / 3600,
    );

    const minutes = Math.floor(
      (totalSeconds % 3600) / 60,
    );

    const seconds =
      totalSeconds % 60;

    return [
      hours,
      minutes,
      seconds,
    ]
      .map((value) =>
        String(value).padStart(2, "0"),
      )
      .join(":");
  };

  const formatDuration = (totalSeconds) => {
    if (
      totalSeconds === null ||
      totalSeconds === undefined
    ) {
      return "—";
    }

    const hours = Math.floor(
      totalSeconds / 3600,
    );

    const minutes = Math.floor(
      (totalSeconds % 3600) / 60,
    );

    if (hours > 0) {
      return `${hours} год ${minutes} хв`;
    }

    return `${minutes} хв`;
  };

  // =====================================================
  // JSX
  // =====================================================

  return (
    <div
      className="reading-modal-overlay"
      onMouseDown={handleOverlayClick}
    >
      <div
        className="reading-modal"
        onMouseDown={(event) =>
          event.stopPropagation()
        }
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

          <p className="reading-modal__author">
            {currentBook.author}
          </p>
        </div>

        {message && (
          <p className="reading-modal__message">
            {message}
          </p>
        )}

        <div className="reading-modal__layout">
          <div className="reading-modal__top">
            <div className="reading-modal__cover">
              {currentBook.coverUrl ? (
                <img
                  src={
                    currentBook.coverUrl.startsWith(
                      "/uploads",
                    )
                      ? `${apiUrl}${currentBook.coverUrl}`
                      : currentBook.coverUrl
                  }
                  alt={currentBook.title}
                />
              ) : (
                <div className="reading-modal__no-cover">
                  Немає обкладинки
                </div>
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
                <span className="reading-modal__info-label">
                  Статус
                </span>

                <span className="reading-modal__info-value">
                  {activeSession
                    ? "READING"
                    : currentBook.status}
                </span>
              </div>

              <div className="reading-modal__info-item">
                <span className="reading-modal__info-label">
                  Оцінка
                </span>

                <div className="reading-modal__rating">
                  {[1, 2, 3, 4, 5].map(
                    (value) => (
                      <button
                        key={value}
                        type="button"
                        className="reading-modal__star"
                        onClick={() =>
                          handleRatingChange(
                            value,
                          )
                        }
                        disabled={
                          ratingLoading
                        }
                        aria-label={`Оцінити на ${value} з 5`}
                        title={`${value} з 5`}
                      >
                        {value <=
                        (currentBook.rating ??
                          0)
                          ? "★"
                          : "☆"}
                      </button>
                    ),
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="reading-modal__progress">
            <div className="reading-modal__progress-header">
              <span>
                Прогрес читання
              </span>

              <span>{progress}%</span>
            </div>

            <div className="reading-modal__progress-track">
              <div
                className="reading-modal__progress-bar"
                style={{
                  width: `${Math.min(
                    progress,
                    100,
                  )}%`,
                }}
              />
            </div>
          </div>

          {stats && (
            <div className="reading-modal__stats">
              <div className="reading-modal__stats-item">
                <span className="reading-modal__stats-label">
                  Загальний час
                </span>

                <span className="reading-modal__stats-value">
                  {formatDuration(
                    stats.totalReadingSeconds,
                  )}
                </span>
              </div>

              <div className="reading-modal__stats-item">
                <span className="reading-modal__stats-label">
                  Прочитано
                </span>

                <span className="reading-modal__stats-value">
                  {stats.pagesRead} стор.
                </span>
              </div>

              <div className="reading-modal__stats-item">
                <span className="reading-modal__stats-label">
                  Швидкість
                </span>

                <span className="reading-modal__stats-value">
                  {stats.pagesPerHour} стор./год
                </span>
              </div>

              <div className="reading-modal__stats-item">
                <span className="reading-modal__stats-label">
                  Залишилось
                </span>

                <span className="reading-modal__stats-value">
                  {stats.remainingPages ?? "—"}{" "}
                  стор.
                </span>
              </div>

              <div className="reading-modal__stats-item">
                <span className="reading-modal__stats-label">
                  Орієнтовний час
                </span>

                <span className="reading-modal__stats-value">
                  {formatDuration(
                    stats.estimatedRemainingSeconds,
                  )}
                </span>
              </div>

              <div className="reading-modal__stats-item">
                <span className="reading-modal__stats-label">
                  Сесій
                </span>

                <span className="reading-modal__stats-value">
                  {stats.sessionsCount}
                </span>
              </div>
            </div>
          )}

          {activeSession && (
            <div className="reading-modal__session">
              <span className="reading-modal__session-label">
                Читання активне
              </span>

              <div className="reading-modal__timer">
                {formatTime(elapsedSeconds)}
              </div>

              <div className="reading-modal__finish-form">
                <label htmlFor="reading-end-page">
                  На якій сторінці зупинився?
                </label>

                <input
                  id="reading-end-page"
                  type="number"
                  min={
                    activeSession.startPage
                  }
                  max={
                    currentBook.pages ??
                    undefined
                  }
                  value={endPage}
                  onChange={(event) =>
                    setEndPage(
                      event.target.value,
                    )
                  }
                  placeholder={`Наприклад, ${
                    activeSession.startPage +
                    10
                  }`}
                />
              </div>

              <span className="reading-modal__session-page">
                Початкова сторінка:{" "}
                {activeSession.startPage}
              </span>
            </div>
          )}
        </div>

        <div className="reading-modal__actions">
          {!activeSession && (
            <button
              type="button"
              className="reading-modal__start"
              onClick={
                handleStartReading
              }
              disabled={loading}
            >
              {loading
                ? "Запускаємо..."
                : "▶ Почати читання"}
            </button>
          )}

          {activeSession && (
            <button
              type="button"
              className="reading-modal__finish"
              onClick={
                handleFinishReading
              }
              disabled={
                finishing ||
                endPage === ""
              }
            >
              {finishing
                ? "Завершуємо..."
                : "■ Завершити читання"}
            </button>
          )}

          <button
            type="button"
            className="reading-modal__cancel"
            onClick={onClose}
          >
            Закрити
          </button>
        </div>
      </div>
    </div>
  );
}

export default ReadingModal;