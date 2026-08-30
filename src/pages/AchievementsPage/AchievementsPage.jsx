import { useCallback, useMemo, useState } from "react";

import { useNavigate } from "react-router-dom";

import AchievementCard from "./components/AchievementCard/AchievementCard.jsx";
import AchievementsFilters from "./components/AchievementsFilters/AchievementsFilters.jsx";
import AchievementsHero from "./components/AchievementsHero/AchievementsHero.jsx";

import useAchievements from "./hooks/useAchievements.js";

import "./AchievementsPage.css";

const AchievementsPage = () => {
  const navigate = useNavigate();

  const [activeCategory, setActiveCategory] = useState("all");

  const handleUnauthorized = useCallback(() => {
    navigate("/login", {
      replace: true,
    });
  }, [navigate]);

  const { achievements, summary, isLoading, error } = useAchievements({
    onUnauthorized: handleUnauthorized,
  });

  const filteredAchievements = useMemo(() => {
    if (activeCategory === "all") {
      return achievements;
    }

    return achievements.filter(
      (achievement) => achievement.category === activeCategory,
    );
  }, [achievements, activeCategory]);

  return (
    <main className="achievements-page">
      <AchievementsHero summary={summary} />

      <AchievementsFilters
        activeCategory={activeCategory}
        onCategoryChange={setActiveCategory}
      />

      {isLoading && (
        <div className="achievements-state">Завантажуємо досягнення...</div>
      )}

      {!isLoading && error && (
        <div className="achievements-state achievements-state--error">
          {error}
        </div>
      )}

      {!isLoading && !error && filteredAchievements.length === 0 && (
        <div className="achievements-state">
          У цій категорії поки немає досягнень
        </div>
      )}

      {!isLoading && !error && filteredAchievements.length > 0 && (
        <section className="achievements-grid">
          {filteredAchievements.map((achievement) => (
            <AchievementCard key={achievement.id} achievement={achievement} />
          ))}
        </section>
      )}
    </main>
  );
};

export default AchievementsPage;
