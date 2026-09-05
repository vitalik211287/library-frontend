import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { apiFetch, hasToken } from "../../../shared/api/apiClient.js";
import { useAuth } from "../../auth/context/AuthContext.jsx";

const AchievementsContext = createContext(null);

const EMPTY_SUMMARY = {
  total: 0,
  unlocked: 0,
  locked: 0,
};

const AchievementsProvider = ({ children }) => {
  const { isAuthenticated, isAuthLoading } = useAuth();

  const [achievements, setAchievements] = useState([]);
  const [summary, setSummary] = useState(EMPTY_SUMMARY);

  const [isAchievementsLoading, setIsAchievementsLoading] = useState(true);

  const [achievementsError, setAchievementsError] = useState("");

  const refreshAchievements = useCallback(async () => {
    if (!isAuthenticated || !hasToken()) {
      setAchievements([]);
      setSummary(EMPTY_SUMMARY);
      setAchievementsError("");
      setIsAchievementsLoading(false);

      return null;
    }

    try {
      setIsAchievementsLoading(true);
      setAchievementsError("");

      const data = await apiFetch("/api/user-books/achievements");

      const loadedAchievements = Array.isArray(data?.achievements)
        ? data.achievements
        : [];

      const loadedSummary = {
        total: Number(data?.summary?.total) || 0,
        unlocked: Number(data?.summary?.unlocked) || 0,
        locked: Number(data?.summary?.locked) || 0,
      };

      setAchievements(loadedAchievements);
      setSummary(loadedSummary);

      return {
        achievements: loadedAchievements,
        summary: loadedSummary,
      };
    } catch (error) {
      console.error("Load achievements error:", error);

      setAchievements([]);
      setSummary(EMPTY_SUMMARY);

      setAchievementsError(
        error instanceof Error
          ? error.message
          : "Не вдалося завантажити досягнення",
      );

      return null;
    } finally {
      setIsAchievementsLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthLoading) {
      return;
    }

    if (!isAuthenticated) {
      setAchievements([]);
      setSummary(EMPTY_SUMMARY);
      setAchievementsError("");
      setIsAchievementsLoading(false);

      return;
    }

    refreshAchievements();
  }, [isAuthenticated, isAuthLoading, refreshAchievements]);

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

  const latestAchievement = useMemo(() => {
    return (
      [...achievements].reverse().find((achievement) => achievement.unlocked) ??
      null
    );
  }, [achievements]);

  const closestAchievement = useMemo(() => {
    return (
      achievements
        .filter((achievement) => !achievement.unlocked)
        .sort(
          (a, b) => (Number(b.percent) || 0) - (Number(a.percent) || 0),
        )[0] ?? null
    );
  }, [achievements]);

  const featuredAchievement = latestAchievement ?? closestAchievement ?? null;

  const value = useMemo(
    () => ({
      achievements,
      summary,

      previewAchievements,
      latestAchievement,
      closestAchievement,
      featuredAchievement,

      isAchievementsLoading,
      achievementsError,

      refreshAchievements,
    }),
    [
      achievements,
      summary,
      previewAchievements,
      latestAchievement,
      closestAchievement,
      featuredAchievement,
      isAchievementsLoading,
      achievementsError,
      refreshAchievements,
    ],
  );

  return (
    <AchievementsContext.Provider value={value}>
      {children}
    </AchievementsContext.Provider>
  );
};

const useAchievementsContext = () => {
  const context = useContext(AchievementsContext);

  if (!context) {
    throw new Error(
      "useAchievementsContext must be used inside AchievementsProvider",
    );
  }

  return context;
};

export { AchievementsProvider, useAchievementsContext };




