import { formatReadingTime } from "../../utils/statsHelpers.js";

import "./StatsExtra.css";

const StatsExtra = ({ summary, onOpenSessions }) => {
  return (
    <section className="stats-extra">
      <button
        type="button"
        className="stats-extra__item stats-extra__item--button"
        onClick={onOpenSessions}
      >
        <span>Сесій читання</span>

        <strong>{summary.sessions}</strong>
      </button>

      <article className="stats-extra__item">
        <span>Середня сесія</span>

        <strong>{formatReadingTime(summary.averageSessionSeconds)}</strong>
      </article>

      <article className="stats-extra__item">
        <span>Сторінок / год</span>

        <strong>{summary.pagesPerHour}</strong>
      </article>
    </section>
  );
};

export default StatsExtra;
