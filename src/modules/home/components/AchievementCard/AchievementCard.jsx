import { TrophyIcon } from "../HomeIcons.jsx";

const AchievementCard = ({
  latestAchievement,
  featuredAchievement,
  onOpen,
}) => {
  const handleKeyDown = (event) => {
    if (event.key !== "Enter" && event.key !== " ") {
      return;
    }

    event.preventDefault();
    onOpen();
  };

  return (
    <section
      className="home-panel achievement-card home-panel--clickable"
      role="button"
      tabIndex={0}
      onClick={onOpen}
      onKeyDown={handleKeyDown}
    >
      <div className="achievement-card__inner">
        <div className="achievement-card__icon">
          <TrophyIcon />
        </div>

        <div className="achievement-card__content">
          <span className="home-section__kicker">
            {latestAchievement ? "Останнє досягнення" : "Найближче досягнення"}
          </span>

          <h2>
            {featuredAchievement
              ? featuredAchievement.title
              : "Ще один крок попереду"}
          </h2>

          <p>
            {featuredAchievement
              ? featuredAchievement.description
              : "Продовжуй читати, щоб отримувати нові досягнення."}
          </p>

          {featuredAchievement && !featuredAchievement.unlocked && (
            <div className="achievement-card__progress">
              <div className="achievement-card__progress-info">
                <span>
                  {featuredAchievement.current} / {featuredAchievement.target}
                </span>

                <strong>{featuredAchievement.percent}%</strong>
              </div>

              <div className="home-progress">
                <div
                  className="home-progress__bar"
                  style={{
                    width: `${featuredAchievement.percent}%`,
                  }}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default AchievementCard;
