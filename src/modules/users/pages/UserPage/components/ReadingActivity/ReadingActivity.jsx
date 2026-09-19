import Icon from "../../../../../../shared/components/Icon/Icon.jsx";
import { useState } from "react";

import useReadingActivity from "../../hooks/useReadingActivity.js";

import {
  createEmptyWeeks,
  formatReadingTime,
} from "../../utils/activityHelpers.js";

import ReadingActivityChart from "./components/ReadingActivityChart.jsx";
import AppPanel from "../../../../../../shared/components/AppPanel/AppPanel.jsx";

import "./ReadingActivity.css";

/* =========================
   ICONS
========================= */

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

  const [selectedWeekIndex, setSelectedWeekIndex] = useState(null);

  const currentWeekIndex = chartData.length - 1;

  const safeSelectedWeekIndex =
    selectedWeekIndex !== null &&
    selectedWeekIndex >= 0 &&
    selectedWeekIndex < chartData.length
      ? selectedWeekIndex
      : currentWeekIndex;

  const selectedWeek =
    safeSelectedWeekIndex >= 0 ? chartData[safeSelectedWeekIndex] : null;

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
      <AppPanel className="reading-chart-card">
        <div className="profile-empty">Завантаження активності...</div>
      </AppPanel>
    );
  }

  if (error) {
    return (
      <AppPanel className="reading-chart-card">
        <div className="profile-empty">{error}</div>
      </AppPanel>
    );
  }

  /* =========================
     RENDER
  ========================= */

  return (
    <AppPanel className="reading-chart-card">
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

          <span>
            {selectedWeek?.current
              ? "Цього тижня"
              : selectedWeek?.label || "Цього тижня"}
          </span>
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
              <strong>{formatReadingTime(selectedWeek?.seconds || 0)}</strong>

              <span>Час читання</span>
            </div>
          </div>

          {/* PAGES */}

          <div className="reading-week__stat">
            <div className="reading-week__icon">
              <Icon name="book" />
            </div>

            <div className="reading-week__content">
              <strong>{selectedWeek?.pages || 0} стор.</strong>

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
              <strong>{selectedWeek?.sessions || 0}</strong>

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
        selectedWeekIndex={safeSelectedWeekIndex}
        onSelectWeek={setSelectedWeekIndex}
        previousMonthName={previousMonthName}
        currentMonthName={currentMonthName}
      />
    </AppPanel>
  );
};

export default ReadingActivity;
