import useReadingActivity from "../../hooks/useReadingActivity.js";

import {
  createEmptyWeeks,
  formatReadingTime,
} from "../../utils/activityHelpers.js";

import ReadingActivityChart from "./components/ReadingActivityChart.jsx";

import "./ReadingActivity.css";

/* =========================
   ICONS
========================= */

const BookIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H11a2 2 0 0 1 2 2v16a2 2 0 0 0-2-2H6.5A2.5 2.5 0 0 0 4 21.5v-16Z" />

    <path d="M20 5.5A2.5 2.5 0 0 0 17.5 3H13v18a2 2 0 0 1 2-2h2.5a2.5 2.5 0 0 1 2.5 2.5v-16Z" />
  </svg>
);

const ArrowIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="m9 6 6 6-6 6" />
  </svg>
);

/* =========================
   COMPONENT
========================= */

const ReadingActivity = ({ onDetails }) => {
  const { readingActivity, isLoading, error } = useReadingActivity();
  const chartData =
    readingActivity.weeks.length > 0
      ? readingActivity.weeks
      : [...createEmptyWeeks(4, false), ...createEmptyWeeks(5, true)];

  const today = new Date();

  const monthNames = [
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

  const currentMonthName = monthNames[today.getMonth()];

  const previousMonthName = monthNames[(today.getMonth() + 11) % 12];

  /* =========================
     LOADING / ERROR
  ========================= */

  if (isLoading) {
    return (
      <div className="reading-chart-card">
        <div className="profile-empty">Завантаження активності...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="reading-chart-card">
        <div className="profile-empty">{error}</div>
      </div>
    );
  }

  /* =========================
     RENDER
  ========================= */

  return (
    <div className="reading-chart-card">
      <div className="reading-chart-card__header">
        <div>
          <h2>Активність читання</h2>

          <p>
            {currentMonthName}

            <span>
              {" "}
              · {formatReadingTime(readingActivity.currentMonthSeconds)}
            </span>
          </p>
        </div>

        <button
          type="button"
          className="reading-chart-card__details"
          onClick={onDetails}
        >
          Детальніше
          <ArrowIcon />
        </button>
      </div>

      {/* =========================
          THIS WEEK
      ========================= */}

      <div className="reading-week">
        <div className="reading-week__title">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <rect x="3" y="5" width="18" height="16" rx="3" />

            <path d="M8 3v4" />
            <path d="M16 3v4" />
            <path d="M3 10h18" />
          </svg>

          <span>Цього тижня</span>
        </div>

        <div className="reading-week__stats">
          {/* TIME */}

          <div className="reading-week__stat">
            <div className="reading-week__icon">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <circle cx="12" cy="12" r="9" />

                <path d="M12 7v5l3 2" />
              </svg>
            </div>

            <div className="reading-week__content">
              <strong>
                {formatReadingTime(readingActivity.currentWeek.seconds)}
              </strong>

              <span>Час читання</span>
            </div>
          </div>

          {/* PAGES */}

          <div className="reading-week__stat">
            <div className="reading-week__icon">
              <BookIcon />
            </div>

            <div className="reading-week__content">
              <strong>{readingActivity.currentWeek.pages} стор.</strong>

              <span>Сторінки</span>
            </div>
          </div>

          {/* SESSIONS */}

          <div className="reading-week__stat">
            <div className="reading-week__icon">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M4 17 9 12l4 3 7-8" />

                <path d="M15 7h5v5" />
              </svg>
            </div>

            <div className="reading-week__content">
              <strong>{readingActivity.currentWeek.sessions}</strong>

              <span>Сесії</span>
            </div>
          </div>
        </div>
      </div>

      {/* =========================
          CHART
      ========================= */}

      <ReadingActivityChart
        chartData={chartData}
        previousMonthName={previousMonthName}
        currentMonthName={currentMonthName}
      />
    </div>
  );
};

export default ReadingActivity;

