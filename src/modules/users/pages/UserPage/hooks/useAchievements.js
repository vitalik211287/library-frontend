import { useMemo } from "react";

import { useAchievementsContext } from "../../../../stats/context/AchievementsContext.jsx";

const useAchievements = () => {
  const { achievements, summary, isAchievementsLoading, achievementsError } =
    useAchievementsContext();

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
    isLoading: isAchievementsLoading,
    error: achievementsError,
  };
};

export default useAchievements;



