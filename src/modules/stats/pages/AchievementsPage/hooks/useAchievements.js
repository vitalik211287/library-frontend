import { useAchievementsContext } from "../../../context/AchievementsContext.jsx";

const useAchievements = () => {
  const {
    achievements,
    summary,
    isAchievementsLoading,
    achievementsError,
    refreshAchievements,
  } = useAchievementsContext();

  return {
    achievements,
    summary,
    isLoading: isAchievementsLoading,
    error: achievementsError,
    refreshAchievements,
  };
};

export default useAchievements;


