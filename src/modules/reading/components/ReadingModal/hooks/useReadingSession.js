import { useEffect, useMemo, useState } from "react";

import { apiFetch } from "../../../../../shared/api/apiClient.js";

const PROGRESS_MODES = {
  PAGES: "PAGES",
  PERCENT: "PERCENT",
};

const getProgressInputValue = (value) => {
  const progress = Number(value ?? 0);

  return progress > 0 ? String(progress) : "";
};

const useReadingSession = (book, onBookUpdated, onReadingDataChanged) => {
  const [activeSession, setActiveSession] = useState(null);

  const [currentBook, setCurrentBook] = useState(book);

  const [stats, setStats] = useState(null);

  const [message, setMessage] = useState("");

  const [loading, setLoading] = useState(false);

  const [finishing, setFinishing] = useState(false);

  const [ratingLoading, setRatingLoading] = useState(false);

  const [pauseLoading, setPauseLoading] = useState(false);

  const [statusLoading, setStatusLoading] = useState(false);

  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  const [progressMode, setProgressMode] = useState(
    book.progressMode ?? PROGRESS_MODES.PAGES,
  );

  const [startProgress, setStartProgress] = useState("");

  const [endProgress, setEndProgress] = useState("");

  const isPaused = Boolean(activeSession?.pausedAt);

  const sessionProgressMode =
    activeSession?.progressMode ??
    progressMode ??
    currentBook.progressMode ??
    PROGRESS_MODES.PAGES;

  const isPagesMode = sessionProgressMode === PROGRESS_MODES.PAGES;

  const isPercentMode = sessionProgressMode === PROGRESS_MODES.PERCENT;

  useEffect(() => {
    setCurrentBook(book);

    const nextProgressMode = book.progressMode ?? PROGRESS_MODES.PAGES;

    setProgressMode(nextProgressMode);

    const savedProgress =
      nextProgressMode === PROGRESS_MODES.PERCENT
        ? book.currentPercent
        : book.currentPage;

    setStartProgress(getProgressInputValue(savedProgress));
  }, [book]);

  const currentProgress = useMemo(() => {
    if ((currentBook.progressMode ?? progressMode) === PROGRESS_MODES.PERCENT) {
      return currentBook.currentPercent ?? 0;
    }

    return currentBook.currentPage ?? 0;
  }, [
    currentBook.currentPage,
    currentBook.currentPercent,
    currentBook.progressMode,
    progressMode,
  ]);

  const progressPercent = useMemo(() => {
    if ((currentBook.progressMode ?? progressMode) === PROGRESS_MODES.PERCENT) {
      return Math.min(Math.max(currentBook.currentPercent ?? 0, 0), 100);
    }

    if (!currentBook.pages || currentBook.pages <= 0) {
      return 0;
    }

    return Math.min(
      Math.max(
        Math.round(((currentBook.currentPage ?? 0) / currentBook.pages) * 100),
        0,
      ),
      100,
    );
  }, [
    currentBook.currentPage,
    currentBook.currentPercent,
    currentBook.pages,
    currentBook.progressMode,
    progressMode,
  ]);

  const fetchReadingStats = async () => {
    try {
      const data = await apiFetch(`/api/user-books/${book.id}/reading/stats`);

      setStats(data.stats);
    } catch (error) {
      console.error("Помилка отримання статистики:", error);
    }
  };

  const fetchActiveSession = async () => {
    try {
      const data = await apiFetch(`/api/user-books/${book.id}/reading/active`);

      if (!data.session) {
        setActiveSession(null);
        setElapsedSeconds(0);

        return;
      }

      setElapsedSeconds(data.elapsedSeconds ?? 0);

      setActiveSession(data.session);

      setProgressMode(data.session.progressMode ?? PROGRESS_MODES.PAGES);

      setCurrentBook((current) => ({
        ...current,

        progressMode:
          data.session.progressMode ??
          current.progressMode ??
          PROGRESS_MODES.PAGES,

        status: data.session.pausedAt ? "PAUSED" : "READING",
      }));
    } catch (error) {
      console.error("Помилка отримання активної сесії:", error);
    }
  };

  const changeProgressMode = (mode) => {
    if (activeSession) {
      return;
    }

    if (mode !== PROGRESS_MODES.PAGES && mode !== PROGRESS_MODES.PERCENT) {
      return;
    }

    setProgressMode(mode);
    setMessage("");

    if (mode === PROGRESS_MODES.PERCENT) {
      setStartProgress(getProgressInputValue(currentBook.currentPercent));

      return;
    }

    setStartProgress(getProgressInputValue(currentBook.currentPage));
  };

  const changeBookStatus = async (status) => {
    if (activeSession) {
      setMessage("Спочатку завершіть активну сесію читання.");

      return false;
    }

    try {
      setStatusLoading(true);
      setMessage("");

      const data = await apiFetch(`/api/user-books/${book.id}`, {
        method: "PATCH",

        body: {
          status,
        },
      });

      setCurrentBook((current) => ({
        ...current,

        status: data.status ?? status,

        progressMode: data.progressMode ?? current.progressMode,

        currentPage: data.currentPage ?? current.currentPage ?? 0,

        currentPercent: data.currentPercent ?? current.currentPercent ?? 0,
      }));

      if (status === "FINISHED") {
        if (
          (data.progressMode ?? currentBook.progressMode) ===
          PROGRESS_MODES.PERCENT
        ) {
          setStartProgress("100");
        } else if (currentBook.pages) {
          setStartProgress(String(currentBook.pages));
        }
      }

      if (status === "NOT_STARTED") {
        setStartProgress("");
      }

      await fetchReadingStats();

      await onReadingDataChanged?.();

      return true;
    } catch (error) {
      console.error("Помилка зміни статусу книги:", error);

      setMessage(
        error instanceof Error
          ? error.message
          : "Не вдалося змінити статус книги",
      );

      return false;
    } finally {
      setStatusLoading(false);
    }
  };

  const validateStartProgress = () => {
    if (startProgress.trim() === "") {
      return progressMode === PROGRESS_MODES.PERCENT
        ? "Вкажи початковий відсоток"
        : "Вкажи початкову сторінку";
    }

    const value = Number(startProgress);

    if (!Number.isInteger(value)) {
      return progressMode === PROGRESS_MODES.PERCENT
        ? "Вкажи цілий відсоток"
        : "Вкажи коректний номер сторінки";
    }

    if (value < 0) {
      return "Прогрес не може бути меншим за 0";
    }

    if (progressMode === PROGRESS_MODES.PERCENT && value > 100) {
      return "Відсоток має бути від 0 до 100";
    }

    if (
      progressMode === PROGRESS_MODES.PAGES &&
      currentBook.pages &&
      value > currentBook.pages
    ) {
      return `У книзі всього ${currentBook.pages} сторінок`;
    }

    return "";
  };

  const startReading = async () => {
    const validationMessage = validateStartProgress();

    if (validationMessage) {
      setMessage(validationMessage);

      return;
    }

    const value = Number(startProgress);

    try {
      setLoading(true);
      setMessage("");

      const body =
        progressMode === PROGRESS_MODES.PERCENT
          ? {
              progressMode: PROGRESS_MODES.PERCENT,
              startPercent: value,
            }
          : {
              progressMode: PROGRESS_MODES.PAGES,
              startPage: value,
            };

      const data = await apiFetch(`/api/user-books/${book.id}/reading/start`, {
        method: "POST",
        body,
      });

      setElapsedSeconds(data.elapsedSeconds ?? 0);

      setActiveSession(data.session);

      setEndProgress("");

      setCurrentBook((current) => ({
        ...current,

        progressMode,

        ...(progressMode === PROGRESS_MODES.PAGES
          ? {
              currentPage: value,
            }
          : {
              currentPercent: value,
            }),

        status: "READING",
      }));
    } catch (error) {
      console.error("Помилка запуску читання:", error);

      setMessage(
        error instanceof Error ? error.message : "Не вдалося почати читання",
      );
    } finally {
      setLoading(false);
    }
  };

  const pauseReading = async () => {
    try {
      setPauseLoading(true);
      setMessage("");

      const data = await apiFetch(`/api/user-books/${book.id}/reading/pause`, {
        method: "POST",
      });

      setActiveSession(data.session);

      if (data.elapsedSeconds != null) {
        setElapsedSeconds(data.elapsedSeconds);
      }

      setCurrentBook((current) => ({
        ...current,
        status: "PAUSED",
      }));
    } catch (error) {
      console.error("Помилка паузи читання:", error);

      setMessage(
        error instanceof Error
          ? error.message
          : "Не вдалося поставити читання на паузу",
      );
    } finally {
      setPauseLoading(false);
    }
  };

  const resumeReading = async () => {
    try {
      setPauseLoading(true);
      setMessage("");

      const data = await apiFetch(`/api/user-books/${book.id}/reading/resume`, {
        method: "POST",
      });

      setActiveSession(data.session);

      if (data.elapsedSeconds != null) {
        setElapsedSeconds(data.elapsedSeconds);
      }

      setCurrentBook((current) => ({
        ...current,
        status: "READING",
      }));
    } catch (error) {
      console.error("Помилка продовження читання:", error);

      setMessage(
        error instanceof Error
          ? error.message
          : "Не вдалося продовжити читання",
      );
    } finally {
      setPauseLoading(false);
    }
  };

  const changeRating = async (rating) => {
    try {
      setRatingLoading(true);
      setMessage("");

      const data = await apiFetch(`/api/user-books/${book.id}`, {
        method: "PATCH",

        body: {
          rating,
        },
      });

      const updatedRating = data.rating ?? rating;

      setCurrentBook((current) => {
        const updatedBook = {
          ...current,
          rating: updatedRating,
        };

        onBookUpdated?.(updatedBook);

        return updatedBook;
      });
    } catch (error) {
      console.error("Помилка збереження оцінки:", error);

      setMessage(
        error instanceof Error ? error.message : "Не вдалося зберегти оцінку",
      );
    } finally {
      setRatingLoading(false);
    }
  };

  const validateEndProgress = () => {
    if (endProgress.trim() === "") {
      return isPercentMode
        ? "Вкажи кінцевий відсоток"
        : "Вкажи сторінку, на якій зупинилися";
    }

    const value = Number(endProgress);

    if (!Number.isInteger(value)) {
      return isPercentMode
        ? "Вкажи цілий відсоток"
        : "Вкажи коректний номер сторінки";
    }

    if (value < 0) {
      return "Прогрес не може бути меншим за 0";
    }

    if (isPercentMode) {
      const sessionStartPercent = activeSession?.startPercent ?? 0;

      if (value > 100) {
        return "Відсоток має бути від 0 до 100";
      }

      if (value < sessionStartPercent) {
        return `Відсоток не може бути меншим за ${sessionStartPercent}%`;
      }

      return "";
    }

    const sessionStartPage = activeSession?.startPage ?? 0;

    if (value < sessionStartPage) {
      return `Сторінка не може бути меншою за ${sessionStartPage}`;
    }

    if (currentBook.pages && value > currentBook.pages) {
      return `У книзі всього ${currentBook.pages} сторінок`;
    }

    return "";
  };

  const finishValidationMessage =
    activeSession && endProgress !== "" ? validateEndProgress() : "";

  const canFinish =
    Boolean(activeSession) &&
    endProgress !== "" &&
    !finishValidationMessage &&
    !finishing;

  const finishReading = async () => {
    const validationMessage = validateEndProgress();

    if (validationMessage) {
      setMessage(validationMessage);

      return;
    }

    const value = Number(endProgress);

    try {
      setFinishing(true);
      setMessage("");

      const body =
        sessionProgressMode === PROGRESS_MODES.PERCENT
          ? {
              endPercent: value,
            }
          : {
              endPage: value,
            };

      await apiFetch(`/api/user-books/${book.id}/reading/finish`, {
        method: "POST",
        body,
      });

      setCurrentBook((current) => {
        const finished =
          sessionProgressMode === PROGRESS_MODES.PERCENT
            ? value >= 100
            : Boolean(current.pages && value >= current.pages);

        return {
          ...current,

          progressMode: sessionProgressMode,

          ...(sessionProgressMode === PROGRESS_MODES.PERCENT
            ? {
                currentPercent: value,
              }
            : {
                currentPage: value,
              }),

          status: finished ? "FINISHED" : "READING",
        };
      });

      setProgressMode(sessionProgressMode);

      setActiveSession(null);

      setElapsedSeconds(0);

      setEndProgress("");

      setStartProgress(getProgressInputValue(value));

      await fetchReadingStats();

      await onReadingDataChanged?.();
    } catch (error) {
      console.error("Помилка завершення читання:", error);

      setMessage(
        error instanceof Error ? error.message : "Не вдалося завершити читання",
      );
    } finally {
      setFinishing(false);
    }
  };

  // Локальний таймер потрібен лише для плавного
  // оновлення інтерфейсу, поки сторінка активна.
  useEffect(() => {
    if (!activeSession || activeSession.pausedAt) {
      return undefined;
    }

    const intervalId = setInterval(() => {
      setElapsedSeconds((seconds) => seconds + 1);
    }, 1000);

    return () => {
      clearInterval(intervalId);
    };
  }, [activeSession]);

  // При відкритті книги отримуємо канонічний
  // час активної сесії з бекенда.
  useEffect(() => {
    fetchActiveSession();
  }, [book.id]);

  // Телефон/PWA може призупинити JavaScript,
  // коли екран заблокований. Після повернення
  // на сторінку синхронізуємо таймер з бекендом.
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        fetchActiveSession();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [book.id]);

  // Додаткова синхронізація для PWA/мобільних
  // браузерів, коли window знову отримує фокус.
  useEffect(() => {
    const handleFocus = () => {
      fetchActiveSession();
    };

    window.addEventListener("focus", handleFocus);

    return () => {
      window.removeEventListener("focus", handleFocus);
    };
  }, [book.id]);

  useEffect(() => {
    fetchReadingStats();
  }, [book.id]);

  return {
    activeSession,
    currentBook,
    stats,

    message,

    loading,
    finishing,
    ratingLoading,
    pauseLoading,
    statusLoading,

    elapsedSeconds,

    progressMode,
    changeProgressMode,

    startProgress,
    setStartProgress,

    endProgress,
    setEndProgress,

    currentProgress,
    progressPercent,

    sessionProgressMode,
    isPagesMode,
    isPercentMode,

    finishValidationMessage,
    canFinish,

    isPaused,

    startReading,
    pauseReading,
    resumeReading,
    finishReading,
    changeRating,
    changeBookStatus,

    fetchReadingStats,
  };
};

export default useReadingSession;



