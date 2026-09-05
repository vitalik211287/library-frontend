import "./MonthlySummary.css";
import HomePanel from "../HomePanel/HomePanel.jsx";
import { CalendarIcon } from "../HomeIcons.jsx";

const MonthlySummary = ({
  monthName,
  monthSeconds,
  monthPages,
  monthBooks,
  formatReadingTime,
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
    <HomePanel
      className="month-panel"
      clickable
      role="button"
      tabIndex={0}
      onClick={onOpen}
      onKeyDown={handleKeyDown}
    >
      <div className="home-panel__header">
        <div>
          <span className="home-section__kicker">Підсумок місяця</span>

          <h2>{monthName}</h2>
        </div>

        <div className="month-panel__icon">
          <CalendarIcon />
        </div>
      </div>

      <div className="monthly-summary">
        <div className="monthly-summary__primary">
          <span>Час читання</span>

          <strong>{formatReadingTime(monthSeconds)}</strong>
        </div>

        <div className="monthly-summary__grid">
          <div>
            <span>Сторінки</span>

            <strong>{monthPages}</strong>
          </div>

          <div>
            <span>Завершено книг</span>

            <strong>{monthBooks}</strong>
          </div>
        </div>
      </div>
    </HomePanel>
  );
};

export default MonthlySummary;
