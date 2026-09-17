import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";

import PageBackButton from "../../../../shared/components/PageBackButton/PageBackButton.jsx";
import { apiFetch } from "../../../../shared/api/apiClient.js";

import AchievementCard from "../../../stats/pages/AchievementsPage/components/AchievementCard/AchievementCard.jsx";
import AchievementsFilters from "../../../stats/pages/AchievementsPage/components/AchievementsFilters/AchievementsFilters.jsx";
import AchievementsHero from "../../../stats/pages/AchievementsPage/components/AchievementsHero/AchievementsHero.jsx";

import "../../../stats/pages/AchievementsPage/AchievementsPage.css";

const PublicUserAchievementsPage = () => {
  const { userId } = useParams();

  const [achievements, setAchievements] = useState([]);
  const [summary, setSummary] = useState({
    total: 0,
    unlocked: 0,
    locked: 0,
  });
  const [activeCategory, setActiveCategory] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isActive = true;

    const loadAchievements = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

        const data = await apiFetch(
          `/api/users/${userId}/achievements?timeZone=${encodeURIComponent(timeZone)}`,
        );

        if (!isActive) return;

        setAchievements(
          Array.isArray(data?.achievements) ? data.achievements : [],
        );

        setSummary({
          total: Number(data?.summary?.total) || 0,
          unlocked: Number(data?.summary?.unlocked) || 0,
          locked: Number(data?.summary?.locked) || 0,
        });
      } catch (requestError) {
        console.error("Load public achievements error:", requestError);

        if (isActive) {
          setError(requestError);
          setAchievements([]);
        }
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    };

    if (userId) {
      loadAchievements();
    }

    return () => {
      isActive = false;
    };
  }, [userId]);

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
      <PageBackButton label="Досягнення читача" />

      <AchievementsHero summary={summary} />

      <AchievementsFilters
        activeCategory={activeCategory}
        onCategoryChange={setActiveCategory}
      />

      {isLoading && (
        <div className="achievements-state">Завантажуємо досягнення...</div>
      )}

      {!isLoading && error && (
        <div className="achievements-state">
          Не вдалося завантажити досягнення.
        </div>
      )}

      {!isLoading && !error && filteredAchievements.length === 0 && (
        <div className="achievements-state">Досягнень поки немає.</div>
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

export default PublicUserAchievementsPage;
