import {
  BookIcon,
  FlameIcon,
  ShareIcon,
} from "../HomeIcons.jsx";

const ReadingStreak = ({
  streak,
  weeklyActivity,
  onShare,
}) => {
  return (
    <section className="streak-card">
      <div className="streak-card__top">
        <div>
          <span className="home-section__kicker">
            Активність
          </span>

          <h2>Твоя серія читання</h2>
        </div>

        <button
          type="button"
          className="streak-card__share"
          onClick={onShare}
        >
          <ShareIcon />

          <span>Поділитися</span>
        </button>
      </div>

      <div className="streak-card__content">
        <div className="streak-card__counter">
          <div className="streak-card__flame">
            <FlameIcon />
          </div>

          <strong>{streak}</strong>

          <span>
            {streak === 1 ? "день" : "днів"}
          </span>
        </div>

        <div className="streak-week">
          {weeklyActivity.map((item) => (
            <div
              className="streak-day"
              key={`${item.day}-${item.date}`}
              title={
                item.active
                  ? `${Math.round(
                      item.activity.seconds / 60,
                    )} хв читання`
                  : "Без читання"
              }
            >
              <span className="streak-day__label">
                {item.day}
              </span>

              <div className="streak-day__marker-wrap">
                {item.today && (
                  <span className="streak-day__today-dot" />
                )}

                <div
                  className={`streak-day__marker ${
                    item.active
                      ? "streak-day__marker--active"
                      : ""
                  }`}
                >
                  {item.active ? (
                    <BookIcon />
                  ) : (
                    <span>{item.date}</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="streak-card__pagination">
        <span className="streak-card__page-dot streak-card__page-dot--active" />
        <span className="streak-card__page-dot" />
        <span className="streak-card__page-dot" />
      </div>
    </section>
  );
};

export default ReadingStreak;
