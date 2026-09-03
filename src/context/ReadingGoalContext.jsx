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

const ReadingGoalContext = createContext(null);

const ReadingGoalProvider = ({ children }) => {
  const { isAuthenticated, isAuthLoading } = useAuth();

  const currentYear = new Date().getFullYear();

  const [goalDataByYear, setGoalDataByYear] = useState({});

  const [loadingByYear, setLoadingByYear] = useState({});

  const [errorByYear, setErrorByYear] = useState({});

  const [isGoalSaving, setIsGoalSaving] = useState(false);

  const [goalSaveError, setGoalSaveError] = useState("");

  /* =========================
     HELPERS
  ========================= */

  const getReadingGoalData = useCallback(
    (year = currentYear) => {
      return goalDataByYear[year] ?? null;
    },
    [currentYear, goalDataByYear],
  );

  const getReadingGoal = useCallback(
    (year = currentYear) => {
      return goalDataByYear[year]?.goal ?? null;
    },
    [currentYear, goalDataByYear],
  );

  /* =========================
     LOAD GOAL
  ========================= */

  const refreshReadingGoal = useCallback(
    async (year = currentYear) => {
      if (!isAuthenticated || !hasToken()) {
        setGoalDataByYear((current) => ({
          ...current,
          [year]: null,
        }));

        setErrorByYear((current) => ({
          ...current,
          [year]: "",
        }));

        setLoadingByYear((current) => ({
          ...current,
          [year]: false,
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

        const data = await apiFetch(`/api/user-books/goals?year=${year}`);

        const goalData = data?.goal ?? null;

        setGoalDataByYear((current) => ({
          ...current,
          [year]: goalData,
        }));

        return goalData;
      } catch (error) {
        console.error("Load reading goal error:", error);

        setGoalDataByYear((current) => ({
          ...current,
          [year]: null,
        }));

        setErrorByYear((current) => ({
          ...current,
          [year]: "Не вдалося завантажити мету",
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
     AUTH / INITIAL LOAD
  ========================= */

  useEffect(() => {
    if (isAuthLoading) {
      return;
    }

    if (!isAuthenticated) {
      setGoalDataByYear({});
      setLoadingByYear({});
      setErrorByYear({});
      setGoalSaveError("");

      return;
    }

    refreshReadingGoal(currentYear);
  }, [currentYear, isAuthenticated, isAuthLoading, refreshReadingGoal]);

  /* =========================
     ENSURE GOAL
  ========================= */

  const ensureReadingGoal = useCallback(
    async (year = currentYear) => {
      if (Object.prototype.hasOwnProperty.call(goalDataByYear, year)) {
        return goalDataByYear[year];
      }

      return refreshReadingGoal(year);
    },
    [currentYear, goalDataByYear, refreshReadingGoal],
  );

  /* =========================
     SAVE GOAL
  ========================= */

  const saveReadingGoal = useCallback(
    async ({ books, pages, minutes, year = currentYear }) => {
      if (!isAuthenticated || !hasToken()) {
        setGoalSaveError("Потрібно увійти в акаунт");

        return false;
      }

      try {
        setIsGoalSaving(true);
        setGoalSaveError("");

        const data = await apiFetch(`/api/user-books/goals?year=${year}`, {
          method: "PUT",

          body: {
            booksGoal: books,
            pagesGoal: pages,
            minutesGoal: minutes,
          },
        });

        const goalData = data?.goal ?? null;

        setGoalDataByYear((current) => ({
          ...current,
          [year]: goalData,
        }));

        return true;
      } catch (error) {
        console.error("Save reading goal error:", error);

        setGoalSaveError(
          error instanceof Error ? error.message : "Не вдалося зберегти мету",
        );

        return false;
      } finally {
        setIsGoalSaving(false);
      }
    },
    [currentYear, isAuthenticated],
  );

  /* =========================
     ERROR
  ========================= */

  const clearGoalSaveError = useCallback(() => {
    setGoalSaveError("");
  }, []);

  /* =========================
     CURRENT YEAR COMPATIBILITY
  ========================= */

  const currentGoalData = goalDataByYear[currentYear] ?? null;

  const readingGoal = currentGoalData?.goal ?? null;

  const readingGoalProgress = currentGoalData?.progress ?? null;

  const readingGoalPercent = currentGoalData?.percent ?? null;

  const isGoalLoading = loadingByYear[currentYear] ?? false;

  const goalError = errorByYear[currentYear] ?? "";

  /* =========================
     VALUE
  ========================= */

  const value = useMemo(
    () => ({
      currentYear,

      readingGoal,
      readingGoalProgress,
      readingGoalPercent,
      currentGoalData,

      isGoalLoading,
      goalError,

      isGoalSaving,
      goalSaveError,

      goalDataByYear,
      loadingByYear,
      errorByYear,

      getReadingGoal,
      getReadingGoalData,
      ensureReadingGoal,
      refreshReadingGoal,
      saveReadingGoal,
      clearGoalSaveError,
    }),
    [
      currentYear,
      readingGoal,
      readingGoalProgress,
      readingGoalPercent,
      currentGoalData,
      isGoalLoading,
      goalError,
      isGoalSaving,
      goalSaveError,
      goalDataByYear,
      loadingByYear,
      errorByYear,
      getReadingGoal,
      getReadingGoalData,
      ensureReadingGoal,
      refreshReadingGoal,
      saveReadingGoal,
      clearGoalSaveError,
    ],
  );

  return (
    <ReadingGoalContext.Provider value={value}>
      {children}
    </ReadingGoalContext.Provider>
  );
};

const useReadingGoalContext = () => {
  const context = useContext(ReadingGoalContext);

  if (!context) {
    throw new Error(
      "useReadingGoalContext must be used inside ReadingGoalProvider",
    );
  }

  return context;
};

export { ReadingGoalProvider, useReadingGoalContext };
