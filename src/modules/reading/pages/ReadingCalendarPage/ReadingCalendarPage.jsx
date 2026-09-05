import { useMemo, useState } from "react";

import { useLocation, useNavigate } from "react-router-dom";

import CalendarGrid from "./components/CalendarGrid/CalendarGrid.jsx";
import CalendarHeader from "./components/CalendarHeader/CalendarHeader.jsx";
import CalendarLegend from "./components/CalendarLegend/CalendarLegend.jsx";

import useReadingCalendar from "./hooks/useReadingCalendar.js";

import {
  getCalendarDays,
  getNextMonth,
  getPreviousMonth,
  getReadingByDay,
} from "./utils/readingCalendarHelpers.js";

import "./ReadingCalendarPage.css";

const ReadingCalendarPage = () => {
  const navigate = useNavigate();

  const location = useLocation();

  const now = new Date();

  const [year, setYear] = useState(now.getFullYear());

  const [month, setMonth] = useState(now.getMonth() + 1);

  const { calendar, isLoading, error } = useReadingCalendar({
    year,
    month,
  });

  const days = useMemo(() => getCalendarDays(year, month), [year, month]);

  const readingByDay = useMemo(() => getReadingByDay(calendar), [calendar]);

  const handleClose = () => {
    if (location.state?.fromReadingModal) {
      navigate(-1);

      return;
    }

    navigate("/home");
  };

  const handlePreviousMonth = () => {
    const previous = getPreviousMonth({
      year,
      month,
    });

    setYear(previous.year);

    setMonth(previous.month);
  };

  const handleNextMonth = () => {
    const next = getNextMonth({
      year,
      month,
    });

    setYear(next.year);

    setMonth(next.month);
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

        <CalendarHeader
          month={month}
          booksCount={calendar?.booksCount ?? 0}
          onPreviousMonth={handlePreviousMonth}
          onNextMonth={handleNextMonth}
        />

        {isLoading ? (
          <p className="reading-calendar__message">Завантаження...</p>
        ) : error ? (
          <p className="reading-calendar__message">{error}</p>
        ) : (
          <CalendarGrid days={days} readingByDay={readingByDay} />
        )}

        <CalendarLegend />
      </section>
    </main>
  );
};

export default ReadingCalendarPage;

