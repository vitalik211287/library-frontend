import {
  API_URL,
} from "../../../../utils/apiClient.js";

import {
  getIntensityClass,
  WEEK_DAYS,
} from "../../utils/readingCalendarHelpers.js";

import "./CalendarGrid.css";

const CalendarGrid = ({
  days,
  readingByDay,
}) => {
  return (
    <>
      <div className="reading-calendar__weekdays">
        {WEEK_DAYS.map(
          (
            day,
            index,
          ) => (
            <span
              key={`${day}-${index}`}
            >
              {day}
            </span>
          ),
        )}
      </div>

      <div className="reading-calendar__grid">
        {days.map(
          (
            day,
            index,
          ) => {
            if (!day) {
              return (
                <div
                  key={`empty-${index}`}
                  className="calendar-day calendar-day--empty"
                />
              );
            }

            const readingDay =
              readingByDay.get(
                day,
              );

            const firstBook =
              readingDay
                ?.books?.[0];

            const coverUrl =
              firstBook?.coverUrl
                ? firstBook.coverUrl.startsWith(
                    "/uploads",
                  )
                  ? `${API_URL}${firstBook.coverUrl}`
                  : firstBook.coverUrl
                : null;

            return (
              <div
                key={day}
                className={`calendar-day ${getIntensityClass(
                  readingDay?.durationSeconds,
                )}`}
              >
                <div className="calendar-day__media">
                  {coverUrl && (
                    <img
                      src={
                        coverUrl
                      }
                      alt={
                        firstBook?.title ||
                        "Обкладинка книги"
                      }
                    />
                  )}

                  {readingDay
                    ?.books
                    ?.length >
                    1 && (
                    <span className="calendar-day__books-count">
                      +
                      {readingDay
                        .books
                        .length -
                        1}
                    </span>
                  )}
                </div>

                <span className="calendar-day__number">
                  {day}
                </span>
              </div>
            );
          },
        )}
      </div>
    </>
  );
};

export default CalendarGrid;