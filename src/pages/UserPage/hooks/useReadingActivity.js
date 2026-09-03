import { useEffect, useMemo } from "react";

import { useReadingActivityContext } from "../../../context/ReadingActivityContext.jsx";

import {
  buildCurrentMonthWeeks,
  buildPreviousMonthWeeks,
  getCurrentMonthSeconds,
  getCurrentWeekStats,
} from "../utils/activityHelpers.js";

const INITIAL_ACTIVITY = {
  weeks: [],

  currentMonthSeconds: 0,

  currentWeek: {
    seconds: 0,
    pages: 0,
    sessions: 0,
  },
};

const useReadingActivity = () => {
  const { activityByMonth, loadingByMonth, errorByMonth, ensureActivity } =
    useReadingActivityContext();

  const now = useMemo(() => new Date(), []);

  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;

  const previousDate = useMemo(
    () => new Date(currentYear, currentMonth - 2, 1),
    [currentYear, currentMonth],
  );

  const previousYear = previousDate.getFullYear();
  const previousMonth = previousDate.getMonth() + 1;

  const currentKey = `${currentYear}-${currentMonth}`;

  const previousKey = `${previousYear}-${previousMonth}`;

  useEffect(() => {
    ensureActivity(previousYear, previousMonth);

    ensureActivity(currentYear, currentMonth);
  }, [previousYear, previousMonth, currentYear, currentMonth, ensureActivity]);

  const readingActivity = useMemo(() => {
    const previousData = activityByMonth[previousKey] ?? null;

    const currentData = activityByMonth[currentKey] ?? null;

    const previousDays = Array.isArray(previousData?.days)
      ? previousData.days
      : [];

    const currentDays = Array.isArray(currentData?.days)
      ? currentData.days
      : [];

    const previousWeeks = buildPreviousMonthWeeks(previousDays);

    const currentWeeks = buildCurrentMonthWeeks(currentDays);

    const currentMonthSeconds = getCurrentMonthSeconds(currentDays);

    const currentWeek = getCurrentWeekStats({
      previousDays,
      currentDays,
      previousYear,
      previousMonth,
      currentYear,
      currentMonth,
    });

    return {
      weeks: [...previousWeeks, ...currentWeeks],

      currentMonthSeconds,

      currentWeek,
    };
  }, [
    activityByMonth,
    previousKey,
    currentKey,
    previousYear,
    previousMonth,
    currentYear,
    currentMonth,
  ]);

  const isLoading =
    (loadingByMonth[previousKey] ?? false) ||
    (loadingByMonth[currentKey] ?? false);

  const error = errorByMonth[previousKey] || errorByMonth[currentKey] || "";

  return {
    readingActivity: readingActivity ?? INITIAL_ACTIVITY,

    isLoading,
    error,
  };
};

export default useReadingActivity;
