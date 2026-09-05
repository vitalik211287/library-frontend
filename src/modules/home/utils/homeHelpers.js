export const WEEK_DAYS = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Нд"];

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

export const getMonday = (date) => {
  const result = new Date(date);

  result.setHours(0, 0, 0, 0);

  const day = result.getDay();

  const difference = day === 0 ? -6 : 1 - day;

  result.setDate(result.getDate() + difference);

  return result;
};

export const getDateKey = (date) => {
  const year = date.getFullYear();

  const month = String(date.getMonth() + 1).padStart(2, "0");

  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

export const getGreeting = () => {
  const hour = new Date().getHours();

  if (hour < 12) {
    return "Доброго ранку";
  }

  if (hour < 18) {
    return "Добрий день";
  }

  return "Добрий вечір";
};

export const getFirstName = (name) => {
  if (!name) {
    return "";
  }

  return name.trim().split(/\s+/)[0];
};

export const getProgress = (currentPage, pages) => {
  if (!pages || pages <= 0) {
    return 0;
  }

  return Math.min(100, Math.max(0, Math.round((currentPage / pages) * 100)));
};

export const formatReadingTime = (seconds) => {
  const totalMinutes = Math.round((seconds ?? 0) / 60);

  const hours = Math.floor(totalMinutes / 60);

  const minutes = totalMinutes % 60;

  if (hours === 0) {
    return `${minutes} хв`;
  }

  if (minutes === 0) {
    return `${hours} год`;
  }

  return `${hours} год ${minutes} хв`;
};
