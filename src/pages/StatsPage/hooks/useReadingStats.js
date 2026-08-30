import { useEffect, useState } from "react";

import { apiFetch } from "../../../utils/apiClient.js";

const useReadingStats = ({ year }) => {
  const [stats, setStats] = useState(null);

  const [goal, setGoal] = useState(null);

  const [isLoading, setIsLoading] = useState(true);

  const [error, setError] = useState("");

  useEffect(() => {
    const loadReadingStats = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        setStats(null);
        setGoal(null);

        setError("Потрібно увійти в акаунт");

        setIsLoading(false);

        return;
      }

      try {
        setIsLoading(true);
        setError("");

        const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

        const [statsData, goalData] = await Promise.all([
          apiFetch(
            `/api/user-books/stats?year=${year}&timeZone=${encodeURIComponent(
              timeZone,
            )}`,
          ),

          apiFetch(`/api/user-books/goals?year=${year}`),
        ]);

        setStats(statsData?.stats ?? null);

        setGoal(goalData?.goal ?? null);
      } catch (loadError) {
        console.error("Get stats error:", loadError);

        setStats(null);
        setGoal(null);

        setError(
          loadError instanceof Error
            ? loadError.message
            : "Не вдалося завантажити статистику",
        );
      } finally {
        setIsLoading(false);
      }
    };

    loadReadingStats();
  }, [year]);

  return {
    stats,
    goal,
    isLoading,
    error,
  };
};

export default useReadingStats;
