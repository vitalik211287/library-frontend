import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

import { apiFetch, hasToken } from "../utils/apiClient.js";

const ReadingActivityContext = createContext(null);

const getActivityKey = (year, month) => `${year}-${month}`;

const ReadingActivityProvider = ({ children }) => {
  const [activityByMonth, setActivityByMonth] = useState({});
  const [loadingByMonth, setLoadingByMonth] = useState({});
  const [errorByMonth, setErrorByMonth] = useState({});

  const refreshActivity = useCallback(async (year, month) => {
    const key = getActivityKey(year, month);

    if (!hasToken()) {
      setActivityByMonth((current) => ({
        ...current,
        [key]: null,
      }));

      setLoadingByMonth((current) => ({
        ...current,
        [key]: false,
      }));

      setErrorByMonth((current) => ({
        ...current,
        [key]: "",
      }));

      return null;
    }

    try {
      setLoadingByMonth((current) => ({
        ...current,
        [key]: true,
      }));

      setErrorByMonth((current) => ({
        ...current,
        [key]: "",
      }));

      const data = await apiFetch(
        `/api/user-books/activity?year=${year}&month=${month}`,
      );

      const activity = data?.activity ?? null;

      setActivityByMonth((current) => ({
        ...current,
        [key]: activity,
      }));

      return activity;
    } catch (error) {
      console.error("Load reading activity error:", error);

      setActivityByMonth((current) => ({
        ...current,
        [key]: null,
      }));

      setErrorByMonth((current) => ({
        ...current,
        [key]:
          error instanceof Error
            ? error.message
            : "Не вдалося завантажити активність читання",
      }));

      return null;
    } finally {
      setLoadingByMonth((current) => ({
        ...current,
        [key]: false,
      }));
    }
  }, []);

  const ensureActivity = useCallback(
    async (year, month) => {
      const key = getActivityKey(year, month);

      if (Object.prototype.hasOwnProperty.call(activityByMonth, key)) {
        return activityByMonth[key];
      }

      return refreshActivity(year, month);
    },
    [activityByMonth, refreshActivity],
  );

  const getActivity = useCallback(
    (year, month) => {
      const key = getActivityKey(year, month);

      return activityByMonth[key] ?? null;
    },
    [activityByMonth],
  );

  const value = useMemo(
    () => ({
      activityByMonth,
      loadingByMonth,
      errorByMonth,

      getActivity,
      ensureActivity,
      refreshActivity,

      getActivityKey,
    }),
    [
      activityByMonth,
      loadingByMonth,
      errorByMonth,
      getActivity,
      ensureActivity,
      refreshActivity,
    ],
  );

  return (
    <ReadingActivityContext.Provider value={value}>
      {children}
    </ReadingActivityContext.Provider>
  );
};

const useReadingActivityContext = () => {
  const context = useContext(ReadingActivityContext);

  if (!context) {
    throw new Error(
      "useReadingActivityContext must be used inside ReadingActivityProvider",
    );
  }

  return context;
};

export { ReadingActivityProvider, useReadingActivityContext };
