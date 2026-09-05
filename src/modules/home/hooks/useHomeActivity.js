import { useEffect, useMemo } from "react";

import {
  WEEK_DAYS,
  getMonday,
  getDateKey,
} from "../utils/homeHelpers.js";

const useHomeActivity = ({
  now,
  activityByMonth,
  ensureActivity,
}) => {
  const activityMonths = useMemo(() => {
    const monday = getMonday(now);

    const sunday = new Date(monday);

    sunday.setDate(monday.getDate() + 6);

    const monthRequests = new Map();

    const addMonth = (date) => {
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      const key = `${year}-${month}`;

      monthRequests.set(key, {
        year,
        month,
      });
    };

    addMonth(monday);
    addMonth(sunday);
    addMonth(now);

    return [...monthRequests.values()];
  }, [now]);

  useEffect(() => {
    activityMonths.forEach(({ year, month }) => {
      ensureActivity(year, month);
    });
  }, [activityMonths, ensureActivity]);

  const activityData = useMemo(() => {
    const activityMap = new Map();

    activityMonths.forEach(({ year, month }) => {
      const key = `${year}-${month}`;
      const activity = activityByMonth[key];
      const days = Array.isArray(activity?.days)
        ? activity.days
        : [];

      days.forEach((day) => {
        const date = new Date(
          year,
          month - 1,
          day.day,
        );

        activityMap.set(
          getDateKey(date),
          day,
        );
      });
    });

    return activityMap;
  }, [activityByMonth, activityMonths]);

  const weeklyActivity = useMemo(() => {
    const monday = getMonday(now);

    return WEEK_DAYS.map((day, index) => {
      const date = new Date(monday);

      date.setDate(
        monday.getDate() + index,
      );

      const activity =
        activityData instanceof Map
          ? activityData.get(
              getDateKey(date),
            )
          : null;

      return {
        day,
        date: date.getDate(),
        active:
          (activity?.sessions ?? 0) > 0,
        today:
          getDateKey(date) ===
          getDateKey(now),
        activity:
          activity ?? {
            seconds: 0,
            pages: 0,
            sessions: 0,
          },
      };
    });
  }, [activityData, now]);

  return {
    activityData,
    weeklyActivity,
  };
};

export default useHomeActivity;
