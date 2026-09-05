import { useMemo } from "react";

import { MONTH_NAMES } from "../../utils/statsHelpers.js";

import "./YearActivity.css";

const YearActivity = ({ months = [] }) => {
  const maxMonthPages = useMemo(() => {
    if (!months.length) {
      return 1;
    }

    return Math.max(...months.map((month) => month.pages || 0), 1);
  }, [months]);

  return (
    <article className="stats-card stats-card--activity">
      <div className="stats-card__header">
        <div>
          <h2>Активність за рік</h2>

          <p>Прочитані сторінки по місяцях</p>
        </div>
      </div>

      <div className="stats-month-chart">
        {months.map((month) => {
          const height =
            month.pages === 0
              ? 3
              : Math.max((month.pages / maxMonthPages) * 100, 8);

          return (
            <div className="stats-month" key={month.month}>
              <div className="stats-month__value">{month.pages || ""}</div>

              <div className="stats-month__bar-track">
                <div
                  className="stats-month__bar"
                  style={{
                    height: `${height}%`,
                  }}
                  title={`${month.pages} сторінок`}
                />
              </div>

              <span>{MONTH_NAMES[month.month - 1]}</span>
            </div>
          );
        })}
      </div>
    </article>
  );
};

export default YearActivity;

