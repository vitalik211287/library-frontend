// src/pages/UserPage/hooks/useAchievements.js

import { useEffect, useMemo, useState } from "react";

import { apiFetch, hasToken } from "../../../utils/apiClient.js";

const useAchievements = ({ readingBookId }) => {
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
        setAchievements([]);

        setSummary({
          total: 0,
          unlocked: 0,
          locked: 0,
        });

        setError("");
        setIsLoading(false);

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

        setError("Не вдалося завантажити досягнення");
      } finally {
        setIsLoading(false);
      }
    };

    loadAchievements();
  }, [readingBookId]);

  const previewAchievements = useMemo(() => {
    return [...achievements]
      .sort((a, b) => {
        if (a.unlocked !== b.unlocked) {
          return a.unlocked ? -1 : 1;
        }

        return (Number(b.percent) || 0) - (Number(a.percent) || 0);
      })
      .slice(0, 4);
  }, [achievements]);

  return {
    achievements,
    previewAchievements,
    summary,
    isLoading,
    error,
  };
};

export default useAchievements;
