import { useEffect, useState } from "react";

import { apiFetch } from "../../../utils/apiClient.js";

const useReadingSession = (book) => {
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

  const isPaused = Boolean(activeSession?.pausedAt);

  /* =========================
     USER BOOK
  ========================= */

  const fetchUserBook = async () => {
    try {
      const data = await apiFetch(`/api/user-books/${book.id}`);

      setCurrentBook({
        ...data.book,

        currentPage: data.currentPage ?? 0,

        status: data.status ?? "NOT_STARTED",

        rating: data.rating ?? null,
      });
    } catch (error) {
      if (error?.status === 401) {
        return;
      }

      console.error("Помилка отримання даних книги:", error);

      setMessage(
        error instanceof Error
          ? error.message
          : "Не вдалося отримати дані читання",
      );
    }
  };

  /* =========================
     STATS
  ========================= */

  const fetchReadingStats = async () => {
    try {
      const data = await apiFetch(`/api/user-books/${book.id}/reading/stats`);

      setStats(data.stats);
    } catch (error) {
      console.error("Помилка отримання статистики:", error);
    }
  };

  /* =========================
     START
  ========================= */

  const startReading = async () => {
    try {
      setLoading(true);
      setMessage("");

      const data = await apiFetch(`/api/user-books/${book.id}/reading/start`, {
        method: "POST",
      });

      setElapsedSeconds(0);

      setActiveSession(data.session);

      setCurrentBook((current) => ({
        ...current,
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

  /* =========================
     PAUSE
  ========================= */

  const pauseReading = async () => {
    try {
      setPauseLoading(true);

      setMessage("");

      const data = await apiFetch(`/api/user-books/${book.id}/reading/pause`, {
        method: "POST",
      });

      setActiveSession(data.session);
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

  /* =========================
     RESUME
  ========================= */

  const resumeReading = async () => {
    try {
      setPauseLoading(true);

      setMessage("");

      const data = await apiFetch(`/api/user-books/${book.id}/reading/resume`, {
        method: "POST",
      });

      setActiveSession(data.session);
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

  /* =========================
     RATING
  ========================= */

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

      setCurrentBook((current) => ({
        ...current,

        rating: data.rating,
      }));
    } catch (error) {
      console.error("Помилка збереження оцінки:", error);

      setMessage(
        error instanceof Error ? error.message : "Не вдалося зберегти оцінку",
      );
    } finally {
      setRatingLoading(false);
    }
  };

  /* =========================
     FINISH
  ========================= */

  const finishReading = async () => {
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

      await apiFetch(`/api/user-books/${book.id}/reading/finish`, {
        method: "POST",

        body: {
          endPage: page,
        },
      });

      setCurrentBook((current) => ({
        ...current,

        currentPage: page,

        status: current.pages && page >= current.pages ? "FINISHED" : "READING",
      }));

      setActiveSession(null);

      setElapsedSeconds(0);

      setEndPage("");

      await fetchReadingStats();
    } catch (error) {
      console.error("Помилка завершення читання:", error);

      setMessage(
        error instanceof Error ? error.message : "Не вдалося завершити читання",
      );
    } finally {
      setFinishing(false);
    }
  };

  /* =========================
     TIMER
  ========================= */

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

  /* =========================
     ACTIVE SESSION
  ========================= */

  useEffect(() => {
    const fetchActiveSession = async () => {
      try {
        const data = await apiFetch(
          `/api/user-books/${book.id}/reading/active`,
        );

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
  }, [book.id]);

  /* =========================
     LOAD BOOK
  ========================= */

  useEffect(() => {
    fetchUserBook();
  }, [book.id]);

  /* =========================
     LOAD STATS
  ========================= */

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

    elapsedSeconds,

    endPage,
    setEndPage,

    isPaused,

    startReading,
    pauseReading,
    resumeReading,
    finishReading,
    changeRating,
  };
};

export default useReadingSession;
