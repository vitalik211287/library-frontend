import { useEffect, useState } from "react";

const API_URL = "https://library-backend-production-5d60.up.railway.app";

const useReadingStreak = ({ readingBookId }) => {
  const [currentStreak, setCurrentStreak] = useState(0);

  const [isStreakLoading, setIsStreakLoading] = useState(true);

  useEffect(() => {
    const loadStreak = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        setCurrentStreak(0);
        setIsStreakLoading(false);

        return;
      }

      try {
        setIsStreakLoading(true);

        const currentYear = new Date().getFullYear();

        const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

        const response = await fetch(
          `${API_URL}/api/user-books/stats?year=${currentYear}&timeZone=${encodeURIComponent(
            timeZone,
          )}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        if (!response.ok) {
          throw new Error("Failed to load reading streak");
        }

        const data = await response.json();

        setCurrentStreak(Number(data?.stats?.streak?.current) || 0);
      } catch (error) {
        console.error("Load reading streak error:", error);

        setCurrentStreak(0);
      } finally {
        setIsStreakLoading(false);
      }
    };

    loadStreak();
  }, [readingBookId]);

  return {
    currentStreak,
    isStreakLoading,
  };
};

export default useReadingStreak;
