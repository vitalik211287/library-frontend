import { useEffect, useMemo, useState } from "react";

const API_URL = "https://library-backend-production-5d60.up.railway.app";

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
      const token = localStorage.getItem("token");

      if (!token) {
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

        const response = await fetch(`${API_URL}/api/user-books/achievements`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Не вдалося завантажити досягнення");
        }

        setAchievements(
          Array.isArray(data.achievements) ? data.achievements : [],
        );

        setSummary({
          total: Number(data.summary?.total) || 0,

          unlocked: Number(data.summary?.unlocked) || 0,

          locked: Number(data.summary?.locked) || 0,
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
