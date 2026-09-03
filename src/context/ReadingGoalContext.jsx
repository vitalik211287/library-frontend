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

  const [readingGoal, setReadingGoal] = useState(null);

  const [isGoalLoading, setIsGoalLoading] = useState(true);

  const [goalError, setGoalError] = useState("");

  const [isGoalSaving, setIsGoalSaving] = useState(false);

  const [goalSaveError, setGoalSaveError] = useState("");

  /* =========================
     LOAD GOAL
  ========================= */

  const refreshReadingGoal = useCallback(async () => {
    if (!isAuthenticated || !hasToken()) {
      setReadingGoal(null);
      setGoalError("");
      setIsGoalLoading(false);

      return null;
    }

    try {
      setIsGoalLoading(true);
      setGoalError("");

      const data = await apiFetch(`/api/user-books/goals?year=${currentYear}`);

      const goal = data?.goal?.goal ?? null;

      setReadingGoal(goal);

      return goal;
    } catch (error) {
      console.error("Load reading goal error:", error);

      setReadingGoal(null);

      setGoalError("Не вдалося завантажити мету");

      return null;
    } finally {
      setIsGoalLoading(false);
    }
  }, [currentYear, isAuthenticated]);

  /* =========================
     AUTH / INITIAL LOAD
  ========================= */

  useEffect(() => {
    if (isAuthLoading) {
      return;
    }

    if (!isAuthenticated) {
      setReadingGoal(null);

      setGoalError("");

      setGoalSaveError("");

      setIsGoalLoading(false);

      return;
    }

    refreshReadingGoal();
  }, [isAuthenticated, isAuthLoading, refreshReadingGoal]);

  /* =========================
     SAVE GOAL
  ========================= */

  const saveReadingGoal = useCallback(
    async ({ books, pages, minutes }) => {
      if (!isAuthenticated || !hasToken()) {
        setGoalSaveError("Потрібно увійти в акаунт");

        return false;
      }

      try {
        setIsGoalSaving(true);

        setGoalSaveError("");

        const data = await apiFetch(
          `/api/user-books/goals?year=${currentYear}`,
          {
            method: "PUT",

            body: {
              booksGoal: books,
              pagesGoal: pages,
              minutesGoal: minutes,
            },
          },
        );

        const goal = data?.goal?.goal ?? null;

        setReadingGoal(goal);

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
     VALUE
  ========================= */

  const value = useMemo(
    () => ({
      currentYear,

      readingGoal,

      isGoalLoading,

      goalError,

      isGoalSaving,

      goalSaveError,

      refreshReadingGoal,

      saveReadingGoal,

      clearGoalSaveError,
    }),
    [
      currentYear,
      readingGoal,
      isGoalLoading,
      goalError,
      isGoalSaving,
      goalSaveError,
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
