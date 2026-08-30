import { useEffect, useState } from "react";

import "./ReadingActivity.css";

const API_URL = "https://library-backend-production-5d60.up.railway.app";

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
   HELPERS
========================= */

const createEmptyWeeks = (count, current) =>
  Array.from({ length: count }, (_, index) => ({
    label: `Тиждень ${index + 1}`,
    value: 0,
    current,
  }));

const buildPreviousMonthWeeks = (days) => {
  const weeks = createEmptyWeeks(4, false);

  days.forEach((day) => {
    const dayNumber = Number(day.day) || 0;
    const seconds = Number(day.seconds) || 0;

    let weekIndex = 0;

    if (dayNumber <= 7) {
      weekIndex = 0;
    } else if (dayNumber <= 14) {
      weekIndex = 1;
    } else if (dayNumber <= 21) {
      weekIndex = 2;
    } else {
      weekIndex = 3;
    }

    weeks[weekIndex].value += seconds / 60;
  });

  return weeks.map((week) => ({
    ...week,
    value: Math.round(week.value),
  }));
};

const buildCurrentMonthWeeks = (days) => {
  const weeks = createEmptyWeeks(5, true);

  days.forEach((day) => {
    const dayNumber = Number(day.day) || 0;
    const seconds = Number(day.seconds) || 0;

    let weekIndex = Math.floor((dayNumber - 1) / 7);

    weekIndex = Math.min(Math.max(weekIndex, 0), 4);

    weeks[weekIndex].value += seconds / 60;
  });

  return weeks.map((week) => ({
    ...week,
    value: Math.round(week.value),
  }));
};

const getCurrentMonthSeconds = (days) =>
  days.reduce((total, day) => total + (Number(day.seconds) || 0), 0);

const getCurrentWeekStats = ({
  previousDays,
  currentDays,
  previousYear,
  previousMonth,
  currentYear,
  currentMonth,
}) => {
  const now = new Date();

  const dayOfWeek = now.getDay();
  const daysFromMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;

  const monday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() - daysFromMonday,
  );

  monday.setHours(0, 0, 0, 0);

  const tomorrow = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() + 1,
  );

  tomorrow.setHours(0, 0, 0, 0);

  const daysWithDates = [
    ...previousDays.map((day) => ({
      ...day,
      date: new Date(previousYear, previousMonth - 1, Number(day.day)),
    })),

    ...currentDays.map((day) => ({
      ...day,
      date: new Date(currentYear, currentMonth - 1, Number(day.day)),
    })),
  ];

  return daysWithDates.reduce(
    (total, day) => {
      if (day.date < monday || day.date >= tomorrow) {
        return total;
      }

      return {
        seconds: total.seconds + (Number(day.seconds) || 0),
        pages: total.pages + (Number(day.pages) || 0),
        sessions: total.sessions + (Number(day.sessions) || 0),
      };
    },
    {
      seconds: 0,
      pages: 0,
      sessions: 0,
    },
  );
};

const formatReadingTime = (totalSeconds) => {
  const totalMinutes = Math.floor(totalSeconds / 60);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours === 0) {
    return `${minutes} хв`;
  }

  if (minutes === 0) {
    return `${hours} год`;
  }

  return `${hours} год ${minutes} хв`;
};

const getChartScale = (chartData) => {
  const highestValue = Math.max(...chartData.map((item) => item.value), 0);

  let step = 10;

  if (highestValue <= 30) {
    step = 10;
  } else if (highestValue <= 60) {
    step = 20;
  } else if (highestValue <= 120) {
    step = 40;
  } else if (highestValue <= 180) {
    step = 60;
  } else if (highestValue <= 360) {
    step = 120;
  } else {
    step = Math.ceil(highestValue / 3 / 60) * 60;
  }

  return {
    maxValue: step * 3,
    yTicks: [0, step, step * 2, step * 3],
  };
};

/* =========================
   COMPONENT
========================= */

const ReadingActivity = ({ readingBookId, onDetails }) => {
  const [readingActivity, setReadingActivity] = useState({
    weeks: [],
    currentMonthSeconds: 0,
    currentWeek: {
      seconds: 0,
      pages: 0,
      sessions: 0,
    },
  });

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadReadingActivity = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
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

        const [previousResponse, currentResponse] = await Promise.all([
          fetch(
            `${API_URL}/api/user-books/activity?year=${previousYear}&month=${previousMonth}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            },
          ),

          fetch(
            `${API_URL}/api/user-books/activity?year=${currentYear}&month=${currentMonth}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            },
          ),
        ]);

        if (!previousResponse.ok || !currentResponse.ok) {
          throw new Error("Failed to load reading activity");
        }

        const previousData = await previousResponse.json();
        const currentData = await currentResponse.json();

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

        setError("Не вдалося завантажити активність читання");
      } finally {
        setIsLoading(false);
      }
    };

    loadReadingActivity();
  }, [readingBookId]);

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

  const getY = (value) =>
    paddingTop + chartHeight - (value / maxValue) * chartHeight;

  const linePoints = chartData
    .map((item, index) => `${getX(index)},${getY(item.value)}`)
    .join(" ");

  const areaPath = [
    `M ${getX(0)} ${getY(chartData[0].value)}`,

    ...chartData
      .slice(1)
      .map((item, index) => `L ${getX(index + 1)} ${getY(item.value)}`),

    `L ${getX(chartData.length - 1)} ${height}`,
    `L ${getX(0)} ${height}`,
    "Z",
  ].join(" ");

  const peakValue = Math.max(
    ...chartData.map((item) => Number(item.value) || 0),
    0,
  );

  const peakIndex = chartData.findIndex(
    (item) => Number(item.value) === peakValue,
  );

  const peakLeft =
    chartData.length > 1 && peakIndex >= 0
      ? (peakIndex / (chartData.length - 1)) * 100
      : 0;

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

          <div className="reading-week__stat">
            <div className="reading-week__icon">
              <BookIcon />
            </div>

            <div className="reading-week__content">
              <strong>{readingActivity.currentWeek.pages} стор.</strong>

              <span>Сторінки</span>
            </div>
          </div>

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

      <div className="reading-chart">
        <div className="reading-chart__body">
          <div className="reading-chart__scale">
            {[...yTicks].reverse().map((tick) => (
              <span key={tick}>{tick} хв</span>
            ))}
          </div>

          <div className="reading-chart__plot">
            {peakValue > 0 && (
              <div
                className="reading-chart__peak-value"
                style={{
                  left: `${peakLeft}%`,
                  top: `${Math.max((getY(peakValue) / height) * 100 - 8, 0)}%`,
                }}
              >
                {peakValue} хв
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

              {chartData.map((item, index) => (
                <line
                  key={`vertical-${item.label}-${index}`}
                  x1={getX(index)}
                  x2={getX(index)}
                  y1={paddingTop}
                  y2={height}
                  className="reading-chart__grid-line"
                />
              ))}

              <path d={areaPath} fill="url(#readingAreaGradient)" />

              <polyline
                points={linePoints}
                fill="none"
                stroke="url(#readingLineGradient)"
                className="reading-chart__line"
              />
            </svg>

            {chartData.map((item, index) => {
              const isPeak = index === peakIndex && peakValue > 0;

              const left =
                chartData.length > 1
                  ? (index / (chartData.length - 1)) * 100
                  : 50;

              const top = (getY(item.value) / height) * 100;

              return (
                <span
                  key={`dot-${index}`}
                  className={
                    isPeak
                      ? "reading-chart__html-dot reading-chart__html-dot--peak"
                      : "reading-chart__html-dot"
                  }
                  style={{
                    left: `${left}%`,
                    top: `${top}%`,
                  }}
                />
              );
            })}
          </div>
        </div>

        <div className="reading-chart__periods">
          <span>{previousMonthName}</span>
          <span>{currentMonthName}</span>
        </div>
      </div>
    </div>
  );
};

export default ReadingActivity;
