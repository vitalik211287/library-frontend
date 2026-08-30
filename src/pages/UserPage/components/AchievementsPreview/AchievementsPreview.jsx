import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import "./AchievementsPreview.css";

const API_URL = "https://library-backend-production-5d60.up.railway.app";

const ArrowIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="m9 6 6 6-6 6" />
  </svg>
);

const AchievementsPreview = ({ readingBookId }) => {
  const navigate = useNavigate();

  const [achievements, setAchievements] = useState([]);

  const [summary, setSummary] = useState({
    total: 0,
    unlocked: 0,
    locked: 0,
  });

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadAchievements = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError("");

        const response = await fetch(
          `${API_URL}/api/user-books/achievements`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message || "Не вдалося завантажити досягнення",
          );
        }

        setAchievements(
          Array.isArray(data.achievements) ? data.achievements : [],
        );

        setSummary({
          total: Number(data.summary?.total) || 0,
          unlocked: Number(data.summary?.unlocked) || 0,
          locked: Number(data.summary?.locked) || 0,
        });
      } catch (loadError) {
        console.error("Load achievements error:", loadError);
        setError("Не вдалося завантажити досягнення");
      } finally {
        setIsLoading(false);
      }
    };

    loadAchievements();
  }, [readingBookId]);

  const previewAchievements = [...achievements]
    .sort((a, b) => {
      if (a.unlocked !== b.unlocked) {
        return a.unlocked ? -1 : 1;
      }

      return (Number(b.percent) || 0) - (Number(a.percent) || 0);
    })
    .slice(0, 4);

  const handleOpenAchievements = () => {
    navigate("/achievements");
  };

  return (
    <section className="profile-section profile-section--achievements">
      <div className="profile-section__header">
        <div>
          <h2>Досягнення</h2>

          {!isLoading && !error && summary.total > 0 && (
            <span className="profile-achievements__summary">
              {summary.unlocked} із {summary.total}
            </span>
          )}
        </div>

        <button type="button" onClick={handleOpenAchievements}>
          Усі
          <ArrowIcon />
        </button>
      </div>

      {isLoading ? (
        <div className="profile-empty">Завантаження досягнень...</div>
      ) : error ? (
        <div className="profile-empty">{error}</div>
      ) : previewAchievements.length === 0 ? (
        <div className="profile-empty">Досягнень поки немає</div>
      ) : (
        <div className="profile-achievements">
          {previewAchievements.map((achievement) => (
            <button
              key={achievement.id}
              type="button"
              className={
                achievement.unlocked
                  ? "profile-achievement profile-achievement--unlocked"
                  : "profile-achievement profile-achievement--locked"
              }
              onClick={handleOpenAchievements}
            >
              <span className="profile-achievement__medal">
                {achievement.category === "books" && "📚"}
                {achievement.category === "pages" && "📜"}
                {achievement.category === "time" && "⏱️"}
                {achievement.category === "streak" && "🔥"}
              </span>

              <span className="profile-achievement__content">
                <strong>{achievement.title}</strong>

                <small>
                  {achievement.unlocked
                    ? "Отримано"
                    : `${achievement.percent}%`}
                </small>
              </span>

              {!achievement.unlocked && (
                <span className="profile-achievement__lock">🔒</span>
              )}
            </button>
          ))}
        </div>
      )}
    </section>
  );
};

export default AchievementsPreview;
