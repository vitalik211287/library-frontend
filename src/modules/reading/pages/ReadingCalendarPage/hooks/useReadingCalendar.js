import { useEffect, useState } from "react";

import { apiFetch, hasToken } from "../../../../../shared/api/apiClient.js";

const useReadingCalendar = ({ year, month }) => {
  const [calendar, setCalendar] = useState(null);

  const [isLoading, setIsLoading] = useState(true);

  const [error, setError] = useState("");

  useEffect(() => {
    const loadCalendar = async () => {
      if (!hasToken()) {
        setCalendar(null);

        setError("Потрібна авторизація");

        setIsLoading(false);

        return;
      }

      try {
        setIsLoading(true);
        setError("");

        const data = await apiFetch(
          `/api/reading/calendar?year=${year}&month=${month}`,
        );

        setCalendar(data);
      } catch (loadError) {
        console.error("Calendar fetch error:", loadError);

        setCalendar(null);

        setError(
          loadError instanceof Error
            ? loadError.message
            : "Не вдалося завантажити календар",
        );
      } finally {
        setIsLoading(false);
      }
    };

    loadCalendar();
  }, [year, month]);

  return {
    calendar,
    isLoading,
    error,
  };
};

export default useReadingCalendar;



