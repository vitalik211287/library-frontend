import { useMemo } from "react";

const getPercent = (current, goal) => {
  if (!goal || goal <= 0) {
    return 0;
  }

  return Math.min(
    100,
    Math.round((current / goal) * 100),
  );
};

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
    const goals = [];

    if (goalBooks > 0) {
      goals.push({
        type: "books",
        current: finishedBooks,
        goal: goalBooks,
        unit: "книг",
        label: "Прочитано цього року",
        percent: getPercent(finishedBooks, goalBooks),
      });
    }

    if (goalPages > 0) {
      goals.push({
        type: "pages",
        current: pagesRead,
        goal: goalPages,
        unit: "стор.",
        label: "Прочитано сторінок",
        percent: getPercent(pagesRead, goalPages),
      });
    }

    if (goalMinutes > 0) {
      goals.push({
        type: "time",
        current: totalReadingMinutes,
        goal: goalMinutes,
        unit: "хв",
        label: "Час читання",
        percent: getPercent(
          totalReadingMinutes,
          goalMinutes,
        ),
      });
    }

    return goals;
  }, [
    finishedBooks,
    goalBooks,
    goalMinutes,
    goalPages,
    pagesRead,
    totalReadingMinutes,
  ]);

  const goalPercent = goalProgress.length
    ? Math.round(
        goalProgress.reduce(
          (sum, item) => sum + item.percent,
          0,
        ) / goalProgress.length,
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
