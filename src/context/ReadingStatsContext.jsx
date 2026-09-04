import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { apiFetch, hasToken } from "../utils/apiClient.js";

import { useAuth } from "./AuthContext.jsx";

const ReadingStatsContext = createContext(null);

const ReadingStatsProvider = ({ children }) => {
  const { isAuthenticated, isAuthLoading } = useAuth();

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

          const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

          const data = await apiFetch(
            `/api/user-books/stats?year=${year}&timeZone=${encodeURIComponent(
              timeZone,
            )}`,
          );

          const stats = data?.stats ?? null;

          saveStats(year, stats);

          return stats;
        } catch (error) {
          console.error("Load reading stats error:", error);

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
    [currentYear, isAuthenticated, saveStats],
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
