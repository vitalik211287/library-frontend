import { useCallback } from "react";

import { useReadingGoalContext } from "../context/ReadingGoalContext.jsx";
import { useReadingStatsContext } from "../context/ReadingStatsContext.jsx";
import { useReadingActivityContext } from "../context/ReadingActivityContext.jsx";
import { useAchievementsContext } from "../context/AchievementsContext.jsx";

const useRefreshReadingData = () => {
  const { refreshReadingGoal } = useReadingGoalContext();

  const { refreshReadingStats } = useReadingStatsContext();

  const { refreshActivity } = useReadingActivityContext();

  const { refreshAchievements } = useAchievementsContext();

  const refreshReadingData = useCallback(async () => {
    const now = new Date();

    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;

    const previousDate = new Date(currentYear, currentMonth - 2, 1);

    const previousYear = previousDate.getFullYear();

    const previousMonth = previousDate.getMonth() + 1;

    await Promise.all([
      refreshReadingGoal(currentYear),

      refreshReadingStats(currentYear),

      refreshActivity(currentYear, currentMonth),

      refreshActivity(previousYear, previousMonth),

      refreshAchievements(),
    ]);
  }, [
    refreshReadingGoal,
    refreshReadingStats,
    refreshActivity,
    refreshAchievements,
  ]);

  return refreshReadingData;
};

export default useRefreshReadingData;
