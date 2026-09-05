import { useEffect } from "react";

import { useReadingStatsContext } from "../../../context/ReadingStatsContext.jsx";

import { useReadingGoalContext } from "../../../context/ReadingGoalContext.jsx";

const useReadingStats = ({ year }) => {
  const {
    statsByYear,
    loadingByYear: statsLoadingByYear,
    errorByYear: statsErrorByYear,
    ensureReadingStats,
  } = useReadingStatsContext();

  const {
    goalDataByYear,
    loadingByYear: goalLoadingByYear,
    errorByYear: goalErrorByYear,
    ensureReadingGoal,
  } = useReadingGoalContext();

  useEffect(() => {
    ensureReadingStats(year);
    ensureReadingGoal(year);
  }, [year, ensureReadingStats, ensureReadingGoal]);

  const stats = statsByYear[year] ?? null;

  const goal = goalDataByYear[year] ?? null;

  const isLoading =
    (statsLoadingByYear[year] ?? false) || (goalLoadingByYear[year] ?? false);

  const error = statsErrorByYear[year] || goalErrorByYear[year] || "";

  return {
    stats,
    goal,
    isLoading,
    error,
  };
};

export default useReadingStats;


