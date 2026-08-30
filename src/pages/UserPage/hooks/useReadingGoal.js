import { useEffect, useState } from "react";

const API_URL = "https://library-backend-production-5d60.up.railway.app";

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

        const response = await fetch(
          `${API_URL}/api/user-books/goals?year=${currentYear}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Не вдалося завантажити мету");
        }

        setReadingGoal(data.goal);
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

      const response = await fetch(
        `${API_URL}/api/user-books/goals?year=${currentYear}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            booksGoal: books,
            pagesGoal: pages,
            minutesGoal: minutes,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Не вдалося зберегти мету");
      }

      setReadingGoal(data.goal);

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
