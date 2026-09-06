import { getChartScale } from "../../../utils/activityHelpers.js";

const ReadingActivityChart = ({
  chartData,
  previousMonthName,
  currentMonthName,
}) => {
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

  return (
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
              <linearGradient id="readingAreaGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#9b5cff" stopOpacity="0.38" />
                <stop offset="100%" stopColor="#9b5cff" stopOpacity="0.04" />
              </linearGradient>

              <linearGradient id="readingLineGradient" x1="0" y1="0" x2="1" y2="0">
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
  );
};

export default ReadingActivityChart;
