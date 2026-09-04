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

const ReadingGoalContext = createContext(null);

const ReadingGoalProvider = ({ children }) => {
  const { isAuthenticated, isAuthLoading } = useAuth();

  const currentYear = new Date().getFullYear();

  const [goalDataByYear, setGoalDataByYear] = useState({});

  const [loadingByYear, setLoadingByYear] = useState({});

  const [errorByYear, setErrorByYear] = useState({});

  const [isGoalSaving, setIsGoalSaving] = useState(false);

  const [goalSaveError, setGoalSaveError] = useState("");

  const goalCacheRef = useRef({});

  const requestsInFlightRef = useRef(new Map());

  const saveGoalData = useCallback((year, goalData) => {
    goalCacheRef.current[year] = goalData;

    setGoalDataByYear((current) => ({
      ...current,
      [year]: goalData,
    }));
  }, []);

  /* =========================
     HELPERS
  ========================= */

  const getReadingGoalData = useCallback(
    (year = currentYear) => goalCacheRef.current[year] ?? null,
    [currentYear],
  );

  const getReadingGoal = useCallback(
    (year = currentYear) => goalCacheRef.current[year]?.goal ?? null,
    [currentYear],
  );

  /* =========================
     LOAD GOAL
  ========================= */

  const loadReadingGoal = useCallback(
    async (year = currentYear, force = false) => {
      if (!isAuthenticated || !hasToken()) {
        saveGoalData(year, null);

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

      if (
        !force &&
        Object.prototype.hasOwnProperty.call(goalCacheRef.current, year)
      ) {
        return goalCacheRef.current[year];
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

          const data = await apiFetch(`/api/user-books/goals?year=${year}`);

          const goalData = data?.goal ?? null;

          saveGoalData(year, goalData);

          return goalData;
        } catch (error) {
          console.error("Load reading goal error:", error);

          saveGoalData(year, null);

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

          requestsInFlightRef.current.delete(year);
        }
      })();

      requestsInFlightRef.current.set(year, request);

      return request;
    },
    [currentYear, isAuthenticated, saveGoalData],
  );

  const refreshReadingGoal = useCallback(
    (year = currentYear) => loadReadingGoal(year, true),
    [currentYear, loadReadingGoal],
  );

  const ensureReadingGoal = useCallback(
    (year = currentYear) => loadReadingGoal(year, false),
    [currentYear, loadReadingGoal],
  );

  /* =========================
     AUTH / INITIAL LOAD
  ========================= */

  useEffect(() => {
    if (isAuthLoading) {
      return;
    }

    if (!isAuthenticated) {
      goalCacheRef.current = {};

      requestsInFlightRef.current.clear();

      setGoalDataByYear({});
      setLoadingByYear({});
      setErrorByYear({});
      setGoalSaveError("");

      return;
    }

    ensureReadingGoal(currentYear);
  }, [currentYear, isAuthenticated, isAuthLoading, ensureReadingGoal]);

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

        saveGoalData(year, goalData);

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
    [currentYear, isAuthenticated, saveGoalData],
  );

  /* =========================
     ERROR
  ========================= */

  const clearGoalSaveError = useCallback(() => {
    setGoalSaveError("");
  }, []);

  /* =========================
     CURRENT YEAR
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
