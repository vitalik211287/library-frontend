import "./CalendarLegend.css";

const CalendarLegend = () => {
  return (
    <div className="reading-calendar__legend">
      <div>
        <span className="legend-dot legend-dot--read" />

        <small>1 сек+</small>
      </div>

      <div>
        <span className="legend-dot legend-dot--10" />

        <small>10 хв+</small>
      </div>

      <div>
        <span className="legend-dot legend-dot--30" />

        <small>30 хв+</small>
      </div>

      <div>
        <span className="legend-dot legend-dot--hour" />

        <small>1 год+</small>
      </div>
    </div>
  );
};

export default CalendarLegend;
