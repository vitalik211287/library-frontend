import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { apiFetch, hasToken } from "../../../shared/api/apiClient.js";

import { useAuth } from "../../auth/context/AuthContext.jsx";

const ReadingStatsContext = createContext(null);

const OFFLINE_STATS_PREFIX = "library-reading-stats-v1";

const statsKey = (userId, year, timeZone) =>
  JSON.stringify([OFFLINE_STATS_PREFIX, userId, year, timeZone]);

const readOfflineStats = (userId, year, timeZone) => {
  if (!userId) return null;

  try {
    const record = JSON.parse(
      localStorage.getItem(statsKey(userId, year, timeZone)) || "null"
    );

    return record?.stats &&
      typeof record.stats === "object" &&
      !Array.isArray(record.stats)
      ? record.stats
      : null;
  } catch {
    return null;
  }
};

const writeOfflineStats = (userId, year, timeZone, stats) => {
  if (!userId) return;

  try {
    const key = statsKey(userId, year, timeZone);

    if (stats == null) {
      localStorage.removeItem(key);
      return;
    }

    const data = JSON.stringify({
      stats,
      savedAt: Date.now(),
    });

    if (new Blob([data]).size > 128 * 1024) {
      console.warn("Offline stats snapshot exceeds budget");
      return;
    }

    localStorage.setItem(key, data);
  } catch (error) {
    console.warn("Cannot cache reading stats", error);
  }
};


const ReadingStatsProvider = ({ children }) => {
  const { user, isAuthenticated, isAuthLoading } = useAuth();

  const currentYear = new Date().getFullYear();

  const [statsByYear, setStatsByYear] = useState({});

  const [loadingByYear, setLoadingByYear] = useState({});

  const [errorByYear, setErrorByYear] = useState({});

  const statsCacheRef = useRef({});

  const requestsInFlightRef = useRef(new Map());

  const saveStats = useCallback((year, stats) => {
    statsCacheRef.current[year] = stats;

    setStatsByYear((current) => ({
      ...current,
      [year]: stats,
    }));
  }, []);

  /* =========================
     LOAD STATS
  ========================= */

  const loadReadingStats = useCallback(
    async (year = currentYear, force = false) => {
      if (!isAuthenticated || !hasToken()) {
        saveStats(year, null);

        setLoadingByYear((current) => ({
          ...current,
          [year]: false,
        }));

        setErrorByYear((current) => ({
          ...current,
          [year]: "",
        }));

        return null;
      }

      if (
        !force &&
        Object.prototype.hasOwnProperty.call(statsCacheRef.current, year)
      ) {
        return statsCacheRef.current[year];
      }

      const existingRequest = requestsInFlightRef.current.get(year);

      if (existingRequest) {
        return existingRequest;
      }

      const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

      const request = (async () => {
        try {
          setLoadingByYear((current) => ({
            ...current,
            [year]: true,
          }));

          setErrorByYear((current) => ({
            ...current,
            [year]: "",
          }));

          const data = await apiFetch(
            `/api/user-books/stats?year=${year}&timeZone=${encodeURIComponent(
              timeZone,
            )}`,
          );

          const stats = data?.stats ?? null;

          saveStats(year, stats);
          writeOfflineStats(user?.id, year, timeZone, stats);

          return stats;
        } catch (error) {
          console.error("Load reading stats error:", error);

          const temporaryFailure =
            typeof error?.status !== "number" ||
            error.status >= 500;

          const cachedStats = temporaryFailure
            ? statsCacheRef.current[year] ??
              readOfflineStats(user?.id, year, timeZone)
            : null;

          if (cachedStats) {
            saveStats(year, cachedStats);
            return cachedStats;
          }

          saveStats(year, null);

          setErrorByYear((current) => ({
            ...current,

            [year]:
              error instanceof Error
                ? error.message
                : "Не вдалося завантажити статистику",
          }));

          return null;
        } finally {
          setLoadingByYear((current) => ({
            ...current,
            [year]: false,
          }));

          requestsInFlightRef.current.delete(year);
        }
      })();

      requestsInFlightRef.current.set(year, request);

      return request;
    },
    [currentYear, isAuthenticated, saveStats, user?.id],
  );

  const refreshReadingStats = useCallback(
    (year = currentYear) => loadReadingStats(year, true),
    [currentYear, loadReadingStats],
  );

  const ensureReadingStats = useCallback(
    (year = currentYear) => loadReadingStats(year, false),
    [currentYear, loadReadingStats],
  );

  /* =========================
     INITIAL LOAD
  ========================= */

  useEffect(() => {
    if (isAuthLoading) {
      return;
    }

    if (!isAuthenticated) {
      statsCacheRef.current = {};

      requestsInFlightRef.current.clear();

      setStatsByYear({});
      setLoadingByYear({});
      setErrorByYear({});

      return;
    }

    ensureReadingStats(currentYear);
  }, [currentYear, isAuthenticated, isAuthLoading, ensureReadingStats]);

  useEffect(() => {
    if (!isAuthenticated || !user?.id) return undefined;

    const handleOnline = () => {
      void refreshReadingStats(currentYear);
    };

    window.addEventListener("online", handleOnline);

    return () => {
      window.removeEventListener("online", handleOnline);
    };
  }, [isAuthenticated, user?.id, currentYear, refreshReadingStats]);

  /* =========================
     HELPERS
  ========================= */

  const getReadingStats = useCallback(
    (year = currentYear) => {
      return statsCacheRef.current[year] ?? null;
    },
    [currentYear],
  );

  const stats = statsByYear[currentYear] ?? null;

  const isStatsLoading = loadingByYear[currentYear] ?? false;

  const statsError = errorByYear[currentYear] ?? "";

  /* =========================
     VALUE
  ========================= */

  const value = useMemo(
    () => ({
      currentYear,

      stats,
      isStatsLoading,
      statsError,

      statsByYear,
      loadingByYear,
      errorByYear,

      getReadingStats,
      ensureReadingStats,
      refreshReadingStats,
    }),
    [
      currentYear,

      stats,
      isStatsLoading,
      statsError,

      statsByYear,
      loadingByYear,
      errorByYear,

      getReadingStats,
      ensureReadingStats,
      refreshReadingStats,
    ],
  );

  return (
    <ReadingStatsContext.Provider value={value}>
      {children}
    </ReadingStatsContext.Provider>
  );
};

const useReadingStatsContext = () => {
  const context = useContext(ReadingStatsContext);

  if (!context) {
    throw new Error(
      "useReadingStatsContext must be used inside ReadingStatsProvider",
    );
  }

  return context;
};

export { ReadingStatsProvider, useReadingStatsContext };




