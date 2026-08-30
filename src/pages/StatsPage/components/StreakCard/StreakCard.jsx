
import "./StreakCard.css";

const StreakCard = ({ streak }) => {
  return (
    <article className="stats-card stats-card--streak">
      <div className="stats-card__header">
        <div>
          <h2>Серія читання</h2>

          <p>Послідовні дні з читанням</p>
        </div>
      </div>

      <div className="streak-main">
        <div className="streak-main__icon">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M13 2s1 4-2 7c-2 2-4 4-4 7a5 5 0 0 0 10 0c0-2-1-4-2-5 0 3-2 4-3 4 1-3-1-5-1-5" />
          </svg>
        </div>

        <div>
          <strong>{streak.current}</strong>

          <span>днів поспіль</span>
        </div>
      </div>

      <div className="streak-details">
        <div>
          <span>Найдовша серія</span>

          <strong>{streak.longest} дн.</strong>
        </div>

        <div>
          <span>Сьогодні</span>

          <strong>{streak.readToday ? "Прочитано" : "Ще ні"}</strong>
        </div>
      </div>
    </article>
  );
};

export default StreakCard;
