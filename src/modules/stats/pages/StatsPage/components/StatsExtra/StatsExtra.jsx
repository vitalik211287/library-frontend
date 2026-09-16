import AppPanel from "../../../../../../shared/components/AppPanel/AppPanel.jsx";
import { formatReadingTime } from "../../utils/statsHelpers.js";

import "./StatsExtra.css";

const StatsExtra = ({ summary, onOpenSessions }) => {
  return (
    <section className="stats-extra">
      <AppPanel
        as="button"
        type="button"
        variant="secondary"
        clickable
        className="stats-extra__item stats-extra__item--button"
        onClick={onOpenSessions}
      >
        <span>Сесій читання</span>

        <strong>{summary.sessions}</strong>
      </AppPanel>

      <AppPanel className="stats-extra__item" variant="secondary">
        <span>Середня сесія</span>

        <strong>{formatReadingTime(summary.averageSessionSeconds)}</strong>
      </AppPanel>

      <AppPanel className="stats-extra__item" variant="secondary">
        <span>Сторінок / год</span>

        <strong>{summary.pagesPerHour}</strong>
      </AppPanel>
    </section>
  );
};

export default StatsExtra;
