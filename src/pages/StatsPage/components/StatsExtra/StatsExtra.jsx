import { formatReadingTime } from "../../utils/statsHelpers.js";

import "./StatsExtra.css";

const StatsExtra = ({ summary }) => {
  return (
    <section className="stats-extra">
      <article>
        <span>Сесій читання</span>

        <strong>{summary.sessions}</strong>
      </article>

      <article>
        <span>Середня сесія</span>

        <strong>{formatReadingTime(summary.averageSessionSeconds)}</strong>
      </article>

      <article>
        <span>Сторінок / год</span>

        <strong>{summary.pagesPerHour}</strong>
      </article>
    </section>
  );
};

export default StatsExtra;
