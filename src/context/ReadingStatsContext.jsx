import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
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

  /* =========================
     LOAD STATS
  ========================= */

  const refreshReadingStats = useCallback(
    async (year = currentYear) => {
      if (!isAuthenticated || !hasToken()) {
        setStatsByYear((current) => ({
          ...current,
          [year]: null,
        }));

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

        setStatsByYear((current) => ({
          ...current,
          [year]: stats,
        }));

        return stats;
      } catch (error) {
        console.error("Load reading stats error:", error);

        setStatsByYear((current) => ({
          ...current,
          [year]: null,
        }));

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
      }
    },
    [currentYear, isAuthenticated],
  );

  /* =========================
     ENSURE STATS
  ========================= */

  const ensureReadingStats = useCallback(
    async (year = currentYear) => {
      if (Object.prototype.hasOwnProperty.call(statsByYear, year)) {
        return statsByYear[year];
      }

      return refreshReadingStats(year);
    },
    [currentYear, statsByYear, refreshReadingStats],
  );

  /* =========================
     INITIAL LOAD
  ========================= */

  useEffect(() => {
    if (isAuthLoading) {
      return;
    }

    if (!isAuthenticated) {
      setStatsByYear({});
      setLoadingByYear({});
      setErrorByYear({});

      return;
    }

    refreshReadingStats(currentYear);
  }, [currentYear, isAuthenticated, isAuthLoading, refreshReadingStats]);

  /* =========================
     HELPERS
  ========================= */

  const getReadingStats = useCallback(
    (year = currentYear) => {
      return statsByYear[year] ?? null;
    },
    [currentYear, statsByYear],
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
