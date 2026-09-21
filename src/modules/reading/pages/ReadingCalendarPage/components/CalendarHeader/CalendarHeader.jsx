import { MONTHS } from "../../utils/readingCalendarHelpers.js";
import Icon from "../../../../../../shared/components/Icon/Icon.jsx";

import "./CalendarHeader.css";

const CalendarHeader = ({
  month,
  booksCount,
  onPreviousMonth,
  onNextMonth,
}) => {
  return (
    <div className="reading-calendar__header">
      <button
        type="button"
        className="reading-calendar__month-button"
        onClick={onPreviousMonth}
        aria-label="Попередній місяць"
      >
        <Icon name="chevron-right" className="reading-calendar__month-icon--previous" />
      </button>

      <div className="reading-calendar__title">
        <h1>{MONTHS[month - 1]}</h1>

        <p>
          {booksCount ?? 0} {booksCount === 1 ? "книга" : "книг"}
        </p>
      </div>

      <button
        type="button"
        className="reading-calendar__month-button"
        onClick={onNextMonth}
        aria-label="Наступний місяць"
      >
        <Icon name="chevron-right" />
      </button>
    </div>
  );
};

export default CalendarHeader;
