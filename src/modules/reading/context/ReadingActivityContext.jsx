import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from "react";

import { apiFetch, hasToken } from "../../../shared/api/apiClient.js";

const ReadingActivityContext = createContext(null);

const getActivityKey = (year, month) => `${year}-${month}`;

const ReadingActivityProvider = ({ children }) => {
  const [activityByMonth, setActivityByMonth] = useState({});

  const [loadingByMonth, setLoadingByMonth] = useState({});

  const [errorByMonth, setErrorByMonth] = useState({});

  /*
   * Ref містить актуальний cache незалежно
   * від циклу React render.
   *
   * Це важливо, бо два ensureActivity()
   * можуть викликатися до наступного render.
   */
  const activityCacheRef = useRef({});

  /*
   * key -> Promise
   *
   * Якщо запит за цей місяць уже виконується,
   * наступний ensureActivity() використовує
   * той самий Promise.
   */
  const requestsInFlightRef = useRef(new Map());

  const saveActivity = useCallback((key, activity) => {
    activityCacheRef.current[key] = activity;

    setActivityByMonth((current) => ({
      ...current,
      [key]: activity,
    }));
  }, []);

  /*
   * force = true:
   * дані завжди перечитуються з backend.
   *
   * Використовується після reading mutation.
   *
   * Навіть force-запити дедуплікуються,
   * якщо однаковий request уже in-flight.
   */
  const loadActivity = useCallback(
    async (year, month, force = false) => {
      const key = getActivityKey(year, month);

      if (!hasToken()) {
        saveActivity(key, null);

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

      if (
        !force &&
        Object.prototype.hasOwnProperty.call(activityCacheRef.current, key)
      ) {
        return activityCacheRef.current[key];
      }

      const existingRequest = requestsInFlightRef.current.get(key);

      if (existingRequest) {
        return existingRequest;
      }

      const request = (async () => {
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

          saveActivity(key, activity);

          return activity;
        } catch (error) {
          console.error("Load reading activity error:", error);

          saveActivity(key, null);

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

          requestsInFlightRef.current.delete(key);
        }
      })();

      requestsInFlightRef.current.set(key, request);

      return request;
    },
    [saveActivity],
  );

  /*
   * Звичайне читання.
   *
   * Якщо cache є — HTTP-запиту немає.
   * Якщо request уже виконується —
   * повертається існуючий Promise.
   */
  const ensureActivity = useCallback(
    (year, month) => loadActivity(year, month, false),
    [loadActivity],
  );

  /*
   * Примусове оновлення після зміни
   * reading data.
   */
  const refreshActivity = useCallback(
    (year, month) => loadActivity(year, month, true),
    [loadActivity],
  );

  const getActivity = useCallback((year, month) => {
    const key = getActivityKey(year, month);

    return activityCacheRef.current[key] ?? null;
  }, []);

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



