import { CATEGORIES } from "../../utils/achievementHelpers.js";

import "./AchievementsFilters.css";

const AchievementsFilters = ({ activeCategory, onCategoryChange }) => {
  return (
    <section className="achievements-filters">
      {CATEGORIES.map((category) => (
        <button
          key={category.id}
          type="button"
          className={
            activeCategory === category.id
              ? "achievements-filter achievements-filter--active"
              : "achievements-filter"
          }
          onClick={() => onCategoryChange(category.id)}
        >
          {category.label}
        </button>
      ))}
    </section>
  );
};

export default AchievementsFilters;
