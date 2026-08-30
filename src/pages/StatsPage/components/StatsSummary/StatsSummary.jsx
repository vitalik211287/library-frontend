import { formatReadingTime } from "../../utils/statsHelpers.js";
import "./StatsSummary.css";

const StatsSummary = ({ summary, streak }) => {
  return (
    <section className="stats-summary">
      <article className="stats-summary-card">
        <div className="stats-summary-card__icon">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H11a2 2 0 0 1 2 2v16a2 2 0 0 0-2-2H6.5A2.5 2.5 0 0 0 4 21.5v-16Z" />

            <path d="M20 5.5A2.5 2.5 0 0 0 17.5 3H13v18a2 2 0 0 1 2-2h2.5a2.5 2.5 0 0 1 2.5 2.5v-16Z" />
          </svg>
        </div>

        <div>
          <strong>{summary.finishedBooks}</strong>

          <span>прочитано книг</span>
        </div>
      </article>

      <article className="stats-summary-card">
        <div className="stats-summary-card__icon">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M6 3h12a2 2 0 0 1 2 2v16l-8-4-8 4V5a2 2 0 0 1 2-2Z" />
          </svg>
        </div>

        <div>
          <strong>{summary.pagesRead}</strong>

          <span>сторінок</span>
        </div>
      </article>

      <article className="stats-summary-card">
        <div className="stats-summary-card__icon">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="12" cy="12" r="9" />

            <path d="M12 7v5l3 2" />
          </svg>
        </div>

        <div>
          <strong>{formatReadingTime(summary.readingSeconds)}</strong>

          <span>час читання</span>
        </div>
      </article>

      <article className="stats-summary-card">
        <div className="stats-summary-card__icon">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M13 2s1 4-2 7c-2 2-4 4-4 7a5 5 0 0 0 10 0c0-2-1-4-2-5 0 3-2 4-3 4 1-3-1-5-1-5" />
          </svg>
        </div>

        <div>
          <strong>{streak.current}</strong>

          <span>днів поспіль</span>
        </div>
      </article>
    </section>
  );
};

export default StatsSummary;
