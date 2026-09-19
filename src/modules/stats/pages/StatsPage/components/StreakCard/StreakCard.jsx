import Icon from "../../../../../../shared/components/Icon/Icon.jsx";
import AppPanel from "../../../../../../shared/components/AppPanel/AppPanel.jsx";

import "./StreakCard.css";

const StreakCard = ({ streak }) => {
  return (
    <AppPanel className="stats-card stats-card--streak">
      <div className="stats-card__header">
        <div>
          <h2>Серія читання</h2>

          <p>Послідовні дні з читанням</p>
        </div>
      </div>

      <div className="streak-main">
        <div className="streak-main__icon streak-main__icon--flame">
          <Icon name="flame" />
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
    </AppPanel>
  );
};

export default StreakCard;
