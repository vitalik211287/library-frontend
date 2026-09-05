import { useMemo } from "react";

const useHomeStats = ({
  stats,
  readingGoal,
  currentMonth,
}) => {
  const streak = stats?.streak?.current ?? 0;

  const goalBooks = readingGoal?.books ?? 0;
  const goalPages = readingGoal?.pages ?? 0;
  const goalMinutes = readingGoal?.minutes ?? 0;

  const hasReadingGoal =
    goalBooks > 0 ||
    goalPages > 0 ||
    goalMinutes > 0;

  const finishedBooks =
    stats?.summary?.finishedBooks ?? 0;

  const pagesRead =
    stats?.summary?.pagesRead ?? 0;

  const totalReadingMinutes = Math.round(
    (stats?.summary?.readingSeconds ?? 0) / 60,
  );

  const goalProgress = useMemo(() => {
    if (goalBooks > 0) {
      return {
        current: finishedBooks,
        goal: goalBooks,
        unit: "книг",
        label: "Прочитано цього року",
      };
    }

    if (goalPages > 0) {
      return {
        current: pagesRead,
        goal: goalPages,
        unit: "стор.",
        label: "Прочитано цього року",
      };
    }

    if (goalMinutes > 0) {
      return {
        current: totalReadingMinutes,
        goal: goalMinutes,
        unit: "хв",
        label: "Час читання цього року",
      };
    }

    return null;
  }, [
    finishedBooks,
    goalBooks,
    goalMinutes,
    goalPages,
    pagesRead,
    totalReadingMinutes,
  ]);

  const goalPercent = goalProgress
    ? Math.min(
        100,
        Math.round(
          (goalProgress.current /
            goalProgress.goal) *
            100,
        ),
      )
    : 0;

  const monthStats =
    stats?.months?.[currentMonth - 1] ?? null;

  const monthSeconds =
    monthStats?.seconds ?? 0;

  const monthPages =
    monthStats?.pages ?? 0;

  const monthBooks =
    monthStats?.books ?? 0;

  return {
    streak,
    hasReadingGoal,
    goalProgress,
    goalPercent,
    monthSeconds,
    monthPages,
    monthBooks,
  };
};

export default useHomeStats;
