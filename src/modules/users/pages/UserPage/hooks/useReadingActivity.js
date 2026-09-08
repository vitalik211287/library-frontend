import { useEffect, useMemo } from "react";

import { useReadingActivityContext } from "../../../../reading/context/ReadingActivityContext.jsx";

import {
  buildCalendarWeeks,
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

  const monthDescriptors = useMemo(() => {
    return [2, 1, 0].map((monthsAgo) => {
      const date = new Date(
        now.getFullYear(),
        now.getMonth() - monthsAgo,
        1,
      );

      return {
        year: date.getFullYear(),
        month: date.getMonth() + 1,
        key: `${date.getFullYear()}-${date.getMonth() + 1}`,
      };
    });
  }, [now]);

  useEffect(() => {
    monthDescriptors.forEach(({ year, month }) => {
      ensureActivity(year, month);
    });
  }, [monthDescriptors, ensureActivity]);

  const readingActivity = useMemo(() => {
    const months = monthDescriptors.map(({ year, month, key }) => {
      const data = activityByMonth[key] ?? null;

      return {
        year,
        month,
        days: Array.isArray(data?.days) ? data.days : [],
      };
    });

    const weeks = buildCalendarWeeks({
      months,
      weeksCount: 12,
    });

    const currentDescriptor = monthDescriptors[monthDescriptors.length - 1];

    const currentData = currentDescriptor
      ? activityByMonth[currentDescriptor.key] ?? null
      : null;

    const currentDays = Array.isArray(currentData?.days)
      ? currentData.days
      : [];

    const currentMonthSeconds = getCurrentMonthSeconds(currentDays);

    const currentWeek = getCurrentWeekStats({
      months,
    });

    return {
      weeks,

      currentMonthSeconds,

      currentWeek,
    };
  }, [activityByMonth, monthDescriptors]);

  const isLoading = monthDescriptors.some(
    ({ key }) => loadingByMonth[key] ?? false,
  );

  const error =
    monthDescriptors
      .map(({ key }) => errorByMonth[key])
      .find(Boolean) || "";

  return {
    readingActivity: readingActivity ?? INITIAL_ACTIVITY,

    isLoading,
    error,
  };
};

export default useReadingActivity;