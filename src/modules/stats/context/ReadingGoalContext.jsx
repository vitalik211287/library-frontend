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

const ReadingGoalContext = createContext(null);

const offlineGoalKey = (userId, year) =>
  "library-offline-goal-v1:" + JSON.stringify([userId, year]);

const readOfflineGoal = (userId, year) => {
  if (!userId) return null;

  try {
    const record = JSON.parse(
      localStorage.getItem(offlineGoalKey(userId, year)) || "null"
    );

    if (!record || !Object.prototype.hasOwnProperty.call(record, "value")) {
      return null;
    }

    if (
      record.value !== null &&
      (typeof record.value !== "object" || Array.isArray(record.value))
    ) {
      return null;
    }

    return { value: record.value };
  } catch {
    return null;
  }
};

const writeOfflineGoal = (userId, year, value) => {
  if (!userId) return;

  try {
    const data = JSON.stringify({ value, savedAt: Date.now() });

    if (new Blob([data]).size > 64 * 1024) {
      console.warn("Offline goal exceeds cache budget");
      return;
    }

    localStorage.setItem(offlineGoalKey(userId, year), data);
  } catch (error) {
    console.warn("Cannot cache reading goal", error);
  }
};


const ReadingGoalProvider = ({ children }) => {
  const { user, isAuthenticated, isAuthLoading } = useAuth();

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
          writeOfflineGoal(user?.id, year, goalData);

          return goalData;
        } catch (error) {
          console.error("Load reading goal error:", error);

          const temporaryFailure =
            typeof error?.status !== "number" || error.status >= 500;

          const cached = temporaryFailure
            ? Object.prototype.hasOwnProperty.call(goalCacheRef.current, year)
              ? { value: goalCacheRef.current[year] }
              : readOfflineGoal(user?.id, year)
            : null;

          if (cached) {
            saveGoalData(year, cached.value);
            setErrorByYear((current) => ({
              ...current,
              [year]: "",
            }));
            return cached.value;
          }

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
    [currentYear, isAuthenticated, saveGoalData, user?.id],
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

      // Очищаємо дані цілі читання попереднього користувача після виходу.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setGoalDataByYear({});
      setLoadingByYear({});
      setErrorByYear({});
      setGoalSaveError("");

      return;
    }

    ensureReadingGoal(currentYear);
  }, [currentYear, isAuthenticated, isAuthLoading, ensureReadingGoal]);

  useEffect(() => {
    if (!isAuthenticated || !user?.id) return undefined;

    const handleOnline = () => {
      void refreshReadingGoal(currentYear);
    };

    window.addEventListener("online", handleOnline);
    return () => window.removeEventListener("online", handleOnline);
  }, [isAuthenticated, user?.id, currentYear, refreshReadingGoal]);

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
        writeOfflineGoal(user?.id, year, goalData);

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
    [currentYear, isAuthenticated, saveGoalData, user?.id],
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




