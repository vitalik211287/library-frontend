import GoalProgress from "./GoalProgress.jsx";
import LibraryGoalProgress from "../LibraryGoalProgress/LibraryGoalProgress.jsx";

import { formatGoalMinutes } from "../../utils/statsHelpers.js";

import "./StatsGoals.css";

const StatsGoals = ({ year, goal, onOpen }) => {
  const goals = goal?.goal || {};
  const progress = goal?.progress || {};
  const percent = goal?.percent || {};

  const handleKeyDown = (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onOpen?.();
    }
  };

  return (
    <section className="stats-goals">
      <div className="stats-goals__header">
        <div>
          <h2>Цілі на {year}</h2>
          <p>Прогрес виконання річної мети</p>
        </div>
      </div>

      <div
        className="reading-goals reading-goals--clickable"
        role="button"
        tabIndex={0}
        onClick={onOpen}
        onKeyDown={handleKeyDown}
      >
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

      <LibraryGoalProgress year={year} />
    </section>
  );
};

export default StatsGoals;