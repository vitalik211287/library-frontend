import { useEffect, useState } from "react";

import { apiFetch, hasToken } from "../../../utils/apiClient.js";

const useAchievements = ({ onUnauthorized }) => {
  const [achievements, setAchievements] = useState([]);

  const [summary, setSummary] = useState({
    total: 0,
    unlocked: 0,
    locked: 0,
  });

  const [isLoading, setIsLoading] = useState(true);

  const [error, setError] = useState("");

  useEffect(() => {
    const loadAchievements = async () => {
      if (!hasToken()) {
        setIsLoading(false);

        onUnauthorized?.();

        return;
      }

      try {
        setIsLoading(true);
        setError("");

        const data = await apiFetch("/api/user-books/achievements");

        setAchievements(
          Array.isArray(data?.achievements) ? data.achievements : [],
        );

        setSummary({
          total: Number(data?.summary?.total) || 0,

          unlocked: Number(data?.summary?.unlocked) || 0,

          locked: Number(data?.summary?.locked) || 0,
        });
      } catch (loadError) {
        console.error("Load achievements error:", loadError);

        setAchievements([]);

        setSummary({
          total: 0,
          unlocked: 0,
          locked: 0,
        });

        setError(
          loadError instanceof Error
            ? loadError.message
            : "Не вдалося завантажити досягнення",
        );
      } finally {
        setIsLoading(false);
      }
    };

    loadAchievements();
  }, [onUnauthorized]);

  return {
    achievements,
    summary,
    isLoading,
    error,
  };
};

export default useAchievements;
