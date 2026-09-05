export const MONTHS = [
  "Січень",
  "Лютий",
  "Березень",
  "Квітень",
  "Травень",
  "Червень",
  "Липень",
  "Серпень",
  "Вересень",
  "Жовтень",
  "Листопад",
  "Грудень",
];

export const WEEK_DAYS = ["П", "В", "С", "Ч", "П", "С", "Н"];

export const getCalendarDays = (year, month) => {
  const daysInMonth = new Date(year, month, 0).getDate();

  const firstDay = new Date(year, month - 1, 1).getDay();

  const mondayIndex = firstDay === 0 ? 6 : firstDay - 1;

  const days = [];

  for (let index = 0; index < mondayIndex; index += 1) {
    days.push(null);
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    days.push(day);
  }

  return days;
};

export const getReadingByDay = (calendar) => {
  const map = new Map();

  for (const day of calendar?.days ?? []) {
    const dayNumber = Number(day.date.slice(-2));

    map.set(dayNumber, day);
  }

  return map;
};

export const getIntensityClass = (seconds = 0) => {
  if (seconds >= 3600) {
    return "calendar-day--hour";
  }

  if (seconds >= 1800) {
    return "calendar-day--30";
  }

  if (seconds >= 600) {
    return "calendar-day--10";
  }

  if (seconds > 0) {
    return "calendar-day--read";
  }

  return "";
};

export const getPreviousMonth = ({ year, month }) => {
  if (month === 1) {
    return {
      year: year - 1,
      month: 12,
    };
  }

  return {
    year,
    month: month - 1,
  };
};

export const getNextMonth = ({ year, month }) => {
  if (month === 12) {
    return {
      year: year + 1,
      month: 1,
    };
  }

  return {
    year,
    month: month + 1,
  };
};

