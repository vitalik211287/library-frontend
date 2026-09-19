import Icon from "../../../../../../shared/components/Icon/Icon.jsx";
import AppPanel from "../../../../../../shared/components/AppPanel/AppPanel.jsx";
import { formatReadingTime } from "../../utils/statsHelpers.js";
import "./StatsSummary.css";

const StatsSummary = ({ summary, streak }) => {
  return (
    <section className="stats-summary">
      <AppPanel className="stats-summary-card" variant="secondary">
        <div className="stats-summary-card__icon">
          <Icon name="book-finished" />
        </div>

        <div>
          <strong>{summary.finishedBooks}</strong>

          <span>прочитано книг</span>
        </div>
      </AppPanel>

      <AppPanel className="stats-summary-card" variant="secondary">
        <div className="stats-summary-card__icon">
          <Icon name="pages" />
        </div>

        <div>
          <strong>{summary.pagesRead}</strong>

          <span>сторінок</span>
        </div>
      </AppPanel>

      <AppPanel className="stats-summary-card" variant="secondary">
        <div className="stats-summary-card__icon">
          <Icon name="clock" />
        </div>

        <div>
          <strong>{formatReadingTime(summary.readingSeconds)}</strong>

          <span>час читання</span>
        </div>
      </AppPanel>

      <AppPanel className="stats-summary-card" variant="secondary">
        <div className="stats-summary-card__icon stats-summary-card__icon--flame">
          <Icon name="flame" />
        </div>

        <div>
          <strong>{streak.current}</strong>

          <span>днів поспіль</span>
        </div>
      </AppPanel>
    </section>
  );
};

export default StatsSummary;
