import {
  useEffect,
  useMemo,
  useState,
} from "react";

import { useNavigate } from "react-router-dom";

import "./ReadingCalendarPage.css";

const API_URL =
  "https://library-backend-production-5d60.up.railway.app";

// const API_URL = "http://localhost:4000";

const MONTHS = [
  "Січень",
  "Лютий",
  "Березень",
  "Квітень",
  "Травень",
  "Червень",
  "Липень",
  "Серпень",
  "Вересень",
  "Жовтень",
  "Листопад",
  "Грудень",
];

const WEEK_DAYS = [
  "П",
  "В",
  "С",
  "Ч",
  "П",
  "С",
  "Н",
];

function ReadingCalendarPage() {
  const navigate = useNavigate();

  const now = new Date();

  const [year, setYear] = useState(
    now.getFullYear(),
  );

  const [month, setMonth] = useState(
    now.getMonth() + 1,
  );

  const [calendar, setCalendar] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [message, setMessage] =
    useState("");

  useEffect(() => {
    const fetchCalendar = async () => {
      const token =
        localStorage.getItem("token");

      if (!token) {
        setMessage(
          "Потрібна авторизація",
        );

        setLoading(false);

        return;
      }

      try {
        setLoading(true);
        setMessage("");

        const response = await fetch(
          `${API_URL}/api/reading/calendar?year=${year}&month=${month}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        const data =
          await response.json();

        if (!response.ok) {
          setMessage(
            data.message ||
              "Не вдалося завантажити календар",
          );

          return;
        }

        setCalendar(data);
      } catch (error) {
        console.error(
          "Calendar fetch error:",
          error,
        );

        setMessage(
          "Не вдалося з'єднатися із сервером",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchCalendar();
  }, [year, month]);

  const days = useMemo(() => {
    const daysInMonth =
      new Date(
        year,
        month,
        0,
      ).getDate();

    const firstDay =
      new Date(
        year,
        month - 1,
        1,
      ).getDay();

    const mondayIndex =
      firstDay === 0
        ? 6
        : firstDay - 1;

    const result = [];

    for (
      let i = 0;
      i < mondayIndex;
      i += 1
    ) {
      result.push(null);
    }

    for (
      let day = 1;
      day <= daysInMonth;
      day += 1
    ) {
      result.push(day);
    }

    return result;
  }, [year, month]);

  const readingByDay = useMemo(() => {
    const map = new Map();

    for (
      const day of calendar?.days ?? []
    ) {
      const dayNumber = Number(
        day.date.slice(-2),
      );

      map.set(
        dayNumber,
        day,
      );
    }

    return map;
  }, [calendar]);

  const handleClose = () => {
    navigate("/");
  };

  const handlePreviousMonth = () => {
    if (month === 1) {
      setMonth(12);

      setYear(
        (current) => current - 1,
      );

      return;
    }

    setMonth(
      (current) => current - 1,
    );
  };

  const handleNextMonth = () => {
    if (month === 12) {
      setMonth(1);

      setYear(
        (current) => current + 1,
      );

      return;
    }

    setMonth(
      (current) => current + 1,
    );
  };

  const getIntensityClass = (
    seconds = 0,
  ) => {
    if (seconds >= 3600) {
      return "calendar-day--hour";
    }

    if (seconds >= 1800) {
      return "calendar-day--30";
    }

    if (seconds >= 600) {
      return "calendar-day--10";
    }

    if (seconds > 0) {
      return "calendar-day--read";
    }

    return "";
  };

  return (
    <main className="reading-calendar-page">
      <section className="reading-calendar">
        <button
          type="button"
          className="reading-calendar__close"
          onClick={handleClose}
          aria-label="Закрити календар"
          title="Закрити"
        >
          ×
        </button>

        <div className="reading-calendar__header">
          <button
            type="button"
            className="reading-calendar__month-button"
            onClick={
              handlePreviousMonth
            }
            aria-label="Попередній місяць"
          >
            ‹
          </button>

          <div className="reading-calendar__title">
            <h1>
              {MONTHS[month - 1]}
            </h1>

            <p>
              {calendar?.booksCount ??
                0}{" "}
              {calendar?.booksCount ===
              1
                ? "книга"
                : "книг"}
            </p>
          </div>

          <button
            type="button"
            className="reading-calendar__month-button"
            onClick={
              handleNextMonth
            }
            aria-label="Наступний місяць"
          >
            ›
          </button>
        </div>

        <div className="reading-calendar__weekdays">
          {WEEK_DAYS.map(
            (day, index) => (
              <span
                key={`${day}-${index}`}
              >
                {day}
              </span>
            ),
          )}
        </div>

        {loading ? (
          <p className="reading-calendar__message">
            Завантаження...
          </p>
        ) : message ? (
          <p className="reading-calendar__message">
            {message}
          </p>
        ) : (
          <div className="reading-calendar__grid">
            {days.map(
              (day, index) => {
                if (!day) {
                  return (
                    <div
                      key={`empty-${index}`}
                      className="calendar-day calendar-day--empty"
                    />
                  );
                }

                const readingDay =
                  readingByDay.get(
                    day,
                  );

                const firstBook =
                  readingDay
                    ?.books?.[0];

                const coverUrl =
                  firstBook?.coverUrl
                    ? firstBook.coverUrl.startsWith(
                        "/uploads",
                      )
                      ? `${API_URL}${firstBook.coverUrl}`
                      : firstBook.coverUrl
                    : null;

                return (
                  <div
                    key={day}
                    className={`calendar-day ${getIntensityClass(
                      readingDay?.durationSeconds,
                    )}`}
                  >
                    <div className="calendar-day__media">
                      {coverUrl && (
                        <img
                          src={
                            coverUrl
                          }
                          alt={
                            firstBook?.title ||
                            "Обкладинка книги"
                          }
                        />
                      )}

                      {readingDay
                        ?.books
                        ?.length >
                        1 && (
                        <span className="calendar-day__books-count">
                          +
                          {readingDay
                            .books
                            .length -
                            1}
                        </span>
                      )}
                    </div>

                    <span className="calendar-day__number">
                      {day}
                    </span>
                  </div>
                );
              },
            )}
          </div>
        )}

        <div className="reading-calendar__legend">
          <div>
            <span className="legend-dot legend-dot--read" />

            <small>
              1 сек+
            </small>
          </div>

          <div>
            <span className="legend-dot legend-dot--10" />

            <small>
              10 хв+
            </small>
          </div>

          <div>
            <span className="legend-dot legend-dot--30" />

            <small>
              30 хв+
            </small>
          </div>

          <div>
            <span className="legend-dot legend-dot--hour" />

            <small>
              1 год+
            </small>
          </div>
        </div>
      </section>
    </main>
  );
}

export default ReadingCalendarPage;