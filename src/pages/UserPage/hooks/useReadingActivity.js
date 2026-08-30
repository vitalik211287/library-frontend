import { useEffect, useState } from "react";

import { apiFetch } from "../../../utils/apiClient.js";

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

const useReadingActivity = ({ readingBookId }) => {
  const [readingActivity, setReadingActivity] = useState(INITIAL_ACTIVITY);

  const [isLoading, setIsLoading] = useState(true);

  const [error, setError] = useState("");

  useEffect(() => {
    const loadReadingActivity = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        setReadingActivity(INITIAL_ACTIVITY);

        setError("");
        setIsLoading(false);

        return;
      }

      try {
        setIsLoading(true);
        setError("");

        const now = new Date();

        const currentYear = now.getFullYear();

        const currentMonth = now.getMonth() + 1;

        const previousDate = new Date(currentYear, currentMonth - 2, 1);

        const previousYear = previousDate.getFullYear();

        const previousMonth = previousDate.getMonth() + 1;

        const [previousData, currentData] = await Promise.all([
          apiFetch(
            `/api/user-books/activity?year=${previousYear}&month=${previousMonth}`,
          ),

          apiFetch(
            `/api/user-books/activity?year=${currentYear}&month=${currentMonth}`,
          ),
        ]);

        const previousDays = Array.isArray(previousData?.activity?.days)
          ? previousData.activity.days
          : [];

        const currentDays = Array.isArray(currentData?.activity?.days)
          ? currentData.activity.days
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

        setReadingActivity({
          weeks: [...previousWeeks, ...currentWeeks],

          currentMonthSeconds,

          currentWeek,
        });
      } catch (loadError) {
        console.error("Load reading activity error:", loadError);

        setReadingActivity(INITIAL_ACTIVITY);

        setError("Не вдалося завантажити активність читання");
      } finally {
        setIsLoading(false);
      }
    };

    loadReadingActivity();
  }, [readingBookId]);

  return {
    readingActivity,
    isLoading,
    error,
  };
};

export default useReadingActivity;
