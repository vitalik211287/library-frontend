import { useState } from "react";

import { getChartScale } from "../../../utils/activityHelpers.js";

const MONTH_NAMES = [
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

const getMonday = (date) => {
  const result = new Date(date);

  result.setHours(0, 0, 0, 0);

  const day = result.getDay();

  const daysFromMonday = day === 0 ? 6 : day - 1;

  result.setDate(result.getDate() - daysFromMonday);

  return result;
};

const getMonthMarkers = (chartData) => {
  if (chartData.length === 0) {
    return [];
  }

  const weeksWithDates = chartData.filter((item) => item.monday);

  if (weeksWithDates.length === 0) {
    return [];
  }

  const firstMonday = new Date(weeksWithDates[0].monday);

  const lastMonday = new Date(weeksWithDates[weeksWithDates.length - 1].monday);

  const lastSunday = new Date(lastMonday);

  lastSunday.setDate(lastSunday.getDate() + 6);

  const today = new Date();

  const markers = [];

  const cursor = new Date(firstMonday.getFullYear(), firstMonday.getMonth(), 1);

  while (cursor <= lastSunday) {
    const monthStart = new Date(cursor);

    /*
     * Знаходимо понеділок тижня,
     * в якому знаходиться 1 число місяця.
     *
     * Наприклад:
     * 1 вересня 2026 -> тиждень
     * починається 31 серпня.
     */
    const firstWeekMonday = getMonday(monthStart);

    const index = chartData.findIndex((item) => {
      if (!item.monday) {
        return false;
      }

      return new Date(item.monday).getTime() === firstWeekMonday.getTime();
    });

    /*
     * Показуємо місяць тільки якщо
     * його перший тиждень реально
     * потрапляє у видиму область графіка.
     */
    if (index >= 0) {
      markers.push({
        key: `${monthStart.getFullYear()}-${monthStart.getMonth()}`,

        name: MONTH_NAMES[monthStart.getMonth()],

        index,

        current:
          monthStart.getFullYear() === today.getFullYear() &&
          monthStart.getMonth() === today.getMonth(),
      });
    }

    cursor.setMonth(cursor.getMonth() + 1);
  }

  return markers;
};

const formatChartValue = (minutes, maxValue) => {
  if (maxValue >= 120) {
    return `${Math.round(minutes / 60)} год`;
  }

  return `${Math.round(minutes)} хв`;
};
const ReadingActivityChart = ({ chartData }) => {
  const width = 760;
  const height = 240;

  const paddingTop = 28;
  const paddingBottom = 8;

  const chartHeight = height - paddingTop - paddingBottom;

  const { maxValue, yTicks } = getChartScale(chartData);

  const getX = (index) => {
    if (chartData.length <= 1) {
      return width / 2;
    }

    return (width / (chartData.length - 1)) * index;
  };

  const getY = (value) => {
    const safeValue = Number(value) || 0;

    return paddingTop + chartHeight - (safeValue / maxValue) * chartHeight;
  };

  /*
   * =========================
   * LINE
   * =========================
   */

  const linePoints = chartData
    .map((item, index) => `${getX(index)},${getY(item.value)}`)
    .join(" ");

  /*
   * =========================
   * AREA
   * =========================
   */

  const areaPath =
    chartData.length > 0
      ? [
          `M ${getX(0)} ${getY(chartData[0].value)}`,

          ...chartData
            .slice(1)
            .map((item, index) => `L ${getX(index + 1)} ${getY(item.value)}`),

          `L ${getX(chartData.length - 1)} ${height}`,

          `L ${getX(0)} ${height}`,

          "Z",
        ].join(" ")
      : "";

  /*
   * =========================
   * PEAK
   * =========================
   */

  const peakValue = Math.max(
    ...chartData.map((item) => Number(item.value) || 0),
    0,
  );

  const peakIndex = chartData.findIndex(
    (item) => Number(item.value) === peakValue,
  );

  /*
   * =========================
   * CURRENT WEEK
   * =========================
   *
   * Останній елемент масиву =
   * поточний тиждень.
   */

  const currentWeekIndex = chartData.length - 1;

  const [selectedWeekIndex, setSelectedWeekIndex] = useState(currentWeekIndex);

  const safeSelectedWeekIndex =
    selectedWeekIndex >= 0 && selectedWeekIndex < chartData.length
      ? selectedWeekIndex
      : currentWeekIndex;

  const selectedWeek =
    safeSelectedWeekIndex >= 0
      ? chartData[safeSelectedWeekIndex]
      : null;

  const selectedWeekValue = Number(selectedWeek?.value) || 0;

  const selectedWeekLeft =
    chartData.length > 1
      ? (safeSelectedWeekIndex / (chartData.length - 1)) * 100
      : 50;
/*
   * =========================
   * MONTHS
   * =========================
   */

  const monthMarkers = getMonthMarkers(chartData);

  return (
    <div className="reading-chart">
      <div className="reading-chart__body">
        {/* =========================
            Y SCALE
        ========================= */}

        <div className="reading-chart__scale">
          {[...yTicks].reverse().map((tick) => (
            <span key={tick}>{formatChartValue(tick, maxValue)}</span>
          ))}
        </div>

        {/* =========================
            GRAPH
        ========================= */}

        <div className="reading-chart__plot">
          {/* =========================
              CURRENT WEEK VALUE
          ========================= */}

          {selectedWeek && (
            <div
              className="reading-chart__current-value"
              style={{
                left: `${selectedWeekLeft}%`,

                top: `${paddingTop}px`,
              }}
            >
              {selectedWeekValue} хв
            </div>
          )}

          <svg
            className="reading-chart__svg"
            viewBox={`0 0 ${width} ${height}`}
            preserveAspectRatio="none"
            role="img"
            aria-label="Графік активності читання у хвилинах"
          >
            <defs>
              <linearGradient
                id="readingAreaGradient"
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop offset="0%" stopColor="#9b5cff" stopOpacity="0.38" />

                <stop offset="100%" stopColor="#9b5cff" stopOpacity="0.04" />
              </linearGradient>

              <linearGradient
                id="readingLineGradient"
                x1="0"
                y1="0"
                x2="1"
                y2="0"
              >
                <stop offset="0%" stopColor="#a56cff" />

                <stop offset="100%" stopColor="#9b5cff" />
              </linearGradient>
            </defs>

            {/* =========================
                HORIZONTAL GRID
            ========================= */}

            {yTicks.map((tick) => (
              <line
                key={`horizontal-${tick}`}
                x1="0"
                x2={width}
                y1={getY(tick)}
                y2={getY(tick)}
                className="reading-chart__horizontal-line"
              />
            ))}

            {/* =========================
                WEEK VERTICALS
            ========================= */}

            {chartData.map((item, index) => {
              const isSelected = index === safeSelectedWeekIndex;

              return (
                <line
                  key={`vertical-${item.label}-${index}`}
                  onClick={() => setSelectedWeekIndex(index)}
                  x1={getX(index)}
                  x2={getX(index)}
                  y1={paddingTop}
                  y2={height}
                  className={
                    isSelected
                      ? "reading-chart__grid-line reading-chart__grid-line--current"
                      : "reading-chart__grid-line"
                  }
                />
              );
            })}

            {/* =========================
                AREA + LINE
            ========================= */}

            {chartData.length > 0 && (
              <>
                <path d={areaPath} fill="url(#readingAreaGradient)" />

                <polyline
                  points={linePoints}
                  fill="none"
                  stroke="url(#readingLineGradient)"
                  className="reading-chart__line"
                />
              </>
            )}
          </svg>

          {/* =========================
              DOTS
          ========================= */}

          {chartData.map((item, index) => {
            const isSelected = index === safeSelectedWeekIndex;

            const isPeak = index === peakIndex && peakValue > 0;

            const left =
              chartData.length > 1
                ? (index / (chartData.length - 1)) * 100
                : 50;

            const top = (getY(item.value) / height) * 100;

            let className = "reading-chart__html-dot";

            if (isPeak) {
              className += " reading-chart__html-dot--peak";
            }

            if (isSelected) {
              className += " reading-chart__html-dot--current";
            }

            return (
              <span
                key={`dot-${index}`}
                className={className}
                style={{
                  left: `${left}%`,
                  top: `${top}%`,
                }}
              />
            );
          })}
        </div>
      </div>

      {/* =========================
          MONTHS
      ========================= */}

      <div className="reading-chart__periods">
        {monthMarkers.map((marker) => {
          const left =
            chartData.length > 1
              ? (marker.index / (chartData.length - 1)) * 100
              : 0;

          return (
            <span
              key={marker.key}
              className={
                marker.current
                  ? "reading-chart__period reading-chart__period--current"
                  : "reading-chart__period"
              }
              style={{
                left: `${left}%`,
              }}
            >
              {marker.name}
            </span>
          );
        })}
      </div>
    </div>
  );
};

export default ReadingActivityChart;
