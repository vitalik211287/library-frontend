import useReadingActivity from "../../hooks/useReadingActivity.js";

import {
  createEmptyWeeks,
  formatReadingTime,
  getChartScale,
} from "../../utils/activityHelpers.js";

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

const ReadingActivity = ({ readingBookId, onDetails }) => {
  const { readingActivity, isLoading, error } = useReadingActivity({
    readingBookId,
  });

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
     CHART SETTINGS
  ========================= */

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

      <div className="reading-chart">
        <div className="reading-chart__body">
          {/* Y SCALE */}

          <div className="reading-chart__scale">
            {[...yTicks].reverse().map((tick) => (
              <span key={tick}>{tick} хв</span>
            ))}
          </div>

          {/* GRAPH */}

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

              {/* HORIZONTAL GRID */}

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

              {/* VERTICAL GRID */}

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

              {/* AREA */}

              <path d={areaPath} fill="url(#readingAreaGradient)" />

              {/* LINE */}

              <polyline
                points={linePoints}
                fill="none"
                stroke="url(#readingLineGradient)"
                className="reading-chart__line"
              />
            </svg>

            {/* POINTS */}

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

        {/* MONTH LABELS */}

        <div className="reading-chart__periods">
          <span>{previousMonthName}</span>

          <span>{currentMonthName}</span>
        </div>
      </div>
    </div>
  );
};

export default ReadingActivity;
