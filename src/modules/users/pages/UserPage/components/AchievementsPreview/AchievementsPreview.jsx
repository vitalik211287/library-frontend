import { useNavigate } from "react-router-dom";

import useAchievements from "../../hooks/useAchievements.js";
import { getAchievementIcon } from "../../../../../stats/pages/AchievementsPage/utils/achievementHelpers.js";

import AppPanel from "../../../../../../shared/components/AppPanel/AppPanel.jsx";

import "./AchievementsPreview.css";
import Icon from "../../../../../../shared/components/Icon/Icon.jsx";

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
          <Icon name="chevron-right" />
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
            <AppPanel
              as="button"
              key={achievement.id}
              type="button"
              variant="secondary"
              clickable
              className={
                achievement.unlocked
                  ? "profile-achievement profile-achievement--unlocked"
                  : "profile-achievement profile-achievement--locked"
              }
              onClick={handleOpenAchievements}
            >
              <span className="profile-achievement__medal">
                <Icon name={getAchievementIcon(achievement)} />
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
                <span className="profile-achievement__lock">
                  <Icon name="lock" />
                </span>
              )}
            </AppPanel>
          ))}
        </div>
      )}
    </section>
  );
};

export default AchievementsPreview;
