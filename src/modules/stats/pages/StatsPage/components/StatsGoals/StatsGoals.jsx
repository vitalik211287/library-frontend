import GoalProgress from "./GoalProgress.jsx";

import { formatGoalMinutes } from "../../utils/statsHelpers.js";

import "./StatsGoals.css";

const StatsGoals = ({ year, goal }) => {
  const goals = goal?.goal || {};

  const progress = goal?.progress || {};

  const percent = goal?.percent || {};

  const hasGoals =
    goals.books != null || goals.pages != null || goals.minutes != null;

  return (
    <section className="stats-goals">
      <div className="stats-goals__header">
        <div>
          <h2>Цілі на {year}</h2>

          <p>Прогрес виконання річної мети</p>
        </div>
      </div>

      {hasGoals ? (
        <div className="reading-goals">
          <GoalProgress
            label="Книги"
            current={progress.books}
            target={goals.books}
            percent={percent.books}
          />

          <GoalProgress
            label="Сторінки"
            current={progress.pages}
            target={goals.pages}
            percent={percent.pages}
          />

          <GoalProgress
            label="Час читання"
            current={progress.minutes}
            target={goals.minutes}
            percent={percent.minutes}
            formatter={formatGoalMinutes}
          />
        </div>
      ) : (
        <div className="stats-empty">Цілі на цей рік ще не встановлені</div>
      )}
    </section>
  );
};

export default StatsGoals;

