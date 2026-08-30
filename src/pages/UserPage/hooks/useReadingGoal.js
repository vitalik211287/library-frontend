import { useEffect, useState } from "react";

import { apiFetch } from "../../../utils/apiClient.js";

const useReadingGoal = () => {
  const currentYear = new Date().getFullYear();

  const [readingGoal, setReadingGoal] = useState(null);

  const [isGoalLoading, setIsGoalLoading] = useState(true);

  const [goalError, setGoalError] = useState("");

  const [isGoalSaving, setIsGoalSaving] = useState(false);

  const [goalSaveError, setGoalSaveError] = useState("");

  useEffect(() => {
    const loadReadingGoal = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        setReadingGoal(null);
        setGoalError("");
        setIsGoalLoading(false);

        return;
      }

      try {
        setIsGoalLoading(true);

        setGoalError("");

        const data = await apiFetch(
          `/api/user-books/goals?year=${currentYear}`,
        );

        setReadingGoal(data?.goal ?? null);
      } catch (error) {
        console.error("Load reading goal error:", error);

        setReadingGoal(null);

        setGoalError("Не вдалося завантажити мету");
      } finally {
        setIsGoalLoading(false);
      }
    };

    loadReadingGoal();
  }, [currentYear]);

  const saveReadingGoal = async ({ books, pages, minutes }) => {
    const token = localStorage.getItem("token");

    if (!token) {
      setGoalSaveError("Потрібно увійти в акаунт");

      return false;
    }

    try {
      setIsGoalSaving(true);
      setGoalSaveError("");

      const data = await apiFetch(`/api/user-books/goals?year=${currentYear}`, {
        method: "PUT",

        body: {
          booksGoal: books,
          pagesGoal: pages,
          minutesGoal: minutes,
        },
      });

      setReadingGoal(data?.goal ?? null);

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
  };

  const clearGoalSaveError = () => {
    setGoalSaveError("");
  };

  return {
    currentYear,
    readingGoal,
    isGoalLoading,
    goalError,
    isGoalSaving,
    goalSaveError,
    saveReadingGoal,
    clearGoalSaveError,
  };
};

export default useReadingGoal;
