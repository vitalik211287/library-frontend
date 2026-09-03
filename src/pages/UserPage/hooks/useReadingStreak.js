import { useReadingStatsContext } from "../../../context/ReadingStatsContext.jsx";

const useReadingStreak = () => {
  const { stats, isStatsLoading } = useReadingStatsContext();

  const currentStreak = Number(stats?.streak?.current) || 0;

  return {
    currentStreak,
    isStreakLoading: isStatsLoading,
  };
};

export default useReadingStreak;
