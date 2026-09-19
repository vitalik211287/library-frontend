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
          <Icon name="chevron-right" />
        </button>
      </div>

      {/* =========================
          THIS WEEK
      ========================= */}

      <div className="reading-week">
        <div className="reading-week__title">
          <Icon name="calendar" />

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
              <Icon name="clock" />
            </div>

            <div className="reading-week__content">
              <strong>{formatReadingTime(selectedWeek?.seconds || 0)}</strong>

              <span>Час читання</span>
            </div>
          </div>

          {/* PAGES */}

          <div className="reading-week__stat">
            <div className="reading-week__icon">
              <Icon name="pages" />
            </div>

            <div className="reading-week__content">
              <strong>{selectedWeek?.pages || 0} стор.</strong>

              <span>Сторінки</span>
            </div>
          </div>

          {/* SESSIONS */}

          <div className="reading-week__stat">
            <div className="reading-week__icon">
              <Icon name="activity" />
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
