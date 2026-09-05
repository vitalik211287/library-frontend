import { useNavigate } from "react-router-dom";

import useAchievements from "../../hooks/useAchievements.js";

import "./AchievementsPreview.css";

const ArrowIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="m9 6 6 6-6 6" />
  </svg>
);

const AchievementsPreview = ({ readingBookId }) => {
  const navigate = useNavigate();

  const { previewAchievements, summary, isLoading, error } = useAchievements();

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

