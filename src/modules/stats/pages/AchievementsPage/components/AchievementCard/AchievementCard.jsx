import {
  formatAchievementValue,
  getAchievementIcon,
} from "../../utils/achievementHelpers.js";

import "./AchievementCard.css";

const AchievementCard = ({ achievement }) => {
  const icon = getAchievementIcon(achievement);

  const safePercent = Math.min(
    Math.max(Number(achievement.percent) || 0, 0),
    100,
  );

  return (
    <article
      className={`achievement-card ${
        achievement.unlocked
          ? "achievement-card--unlocked"
          : "achievement-card--locked"
      }`}
    >
      <div className="achievement-card__top">
        <div className="achievement-medal">
          <div className="achievement-medal__circle">
            <span className="achievement-medal__icon" aria-hidden="true">
              {icon}
            </span>
          </div>

          <div className="achievement-medal__ribbons">
            <span />
            <span />
          </div>
        </div>

        <div
          className={`achievement-card__status ${
            achievement.unlocked ? "achievement-card__status--unlocked" : ""
          }`}
        >
          {achievement.unlocked ? "Отримано" : "🔒"}
        </div>
      </div>

      <div className="achievement-card__content">
        <h2>{achievement.title}</h2>

        <p>{achievement.description}</p>
      </div>

      <div className="achievement-card__progress">
        <div className="achievement-card__numbers">
          <span>
            {formatAchievementValue(achievement, achievement.current)}
          </span>

          <span>{formatAchievementValue(achievement, achievement.target)}</span>
        </div>

        <div className="achievement-card__track">
          <div
            className="achievement-card__bar"
            style={{
              width: `${safePercent}%`,
            }}
          />
        </div>

        <div className="achievement-card__percent">
          {achievement.unlocked
            ? "Досягнення відкрито"
            : `${safePercent}% виконано`}
        </div>
      </div>
    </article>
  );
};

export default AchievementCard;

