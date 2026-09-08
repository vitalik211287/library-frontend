export const createEmptyWeeks = (count, current) =>
  Array.from({ length: count }, (_, index) => ({
    label: `Тиждень ${index + 1}`,
    value: 0,
      seconds: 0,
      pages: 0,
      sessions: 0,
    current,
  }));

const getMonday = (date) => {
  const result = new Date(date);

  result.setHours(0, 0, 0, 0);

  const dayOfWeek = result.getDay();

  const daysFromMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;

  result.setDate(result.getDate() - daysFromMonday);

  return result;
};

const formatWeekLabel = (monday) => {
  const sunday = new Date(monday);

  sunday.setDate(sunday.getDate() + 6);

  const formatDate = (date) =>
    `${String(date.getDate()).padStart(2, "0")}.${String(
      date.getMonth() + 1,
    ).padStart(2, "0")}`;

  return `${formatDate(monday)}–${formatDate(sunday)}`;
};

export const buildCalendarWeeks = ({ months, weeksCount = 12 }) => {
  const currentMonday = getMonday(new Date());

  const firstMonday = new Date(currentMonday);

  firstMonday.setDate(firstMonday.getDate() - (weeksCount - 1) * 7);

  const weeks = [];
  const weekMap = new Map();

  for (let index = 0; index < weeksCount; index += 1) {
    const monday = new Date(firstMonday);

    monday.setDate(firstMonday.getDate() + index * 7);

    const key = monday.getTime();

    const week = {
      label: formatWeekLabel(monday),

      value: 0,
      seconds: 0,
      pages: 0,
      sessions: 0,

      current: key === currentMonday.getTime(),

      monday,
    };

    weeks.push(week);

    weekMap.set(key, week);
  }

  months.forEach(({ year, month, days }) => {
    days.forEach((day) => {
      const date = new Date(year, month - 1, Number(day.day));

      const monday = getMonday(date);

      const week = weekMap.get(monday.getTime());

      if (!week) {
        return;
      }

      week.seconds += Number(day.seconds) || 0;
      week.pages += Number(day.pages) || 0;
      week.sessions += Number(day.sessions) || 0;
    });
  });

  return weeks.map((week) => ({
    ...week,

    value: Math.round(week.seconds / 60),
  }));
};

export const getCurrentMonthSeconds = (days) =>
  days.reduce((total, day) => total + (Number(day.seconds) || 0), 0);

export const getCurrentWeekStats = ({ months }) => {
  const now = new Date();

  const monday = getMonday(now);

  const tomorrow = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() + 1,
  );

  tomorrow.setHours(0, 0, 0, 0);

  const result = {
    seconds: 0,
    pages: 0,
    sessions: 0,
  };

  months.forEach(({ year, month, days }) => {
    days.forEach((day) => {
      const date = new Date(year, month - 1, Number(day.day));

      if (date < monday || date >= tomorrow) {
        return;
      }

      result.seconds += Number(day.seconds) || 0;

      result.pages += Number(day.pages) || 0;

      result.sessions += Number(day.sessions) || 0;
    });
  });

  return result;
};

export const formatReadingTime = (totalSeconds) => {
  const totalMinutes = Math.floor(totalSeconds / 60);

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

const getNiceChartStep = (rawStep) => {
  if (!Number.isFinite(rawStep) || rawStep <= 0) {
    return 1;
  }

  const exponent = Math.floor(Math.log10(rawStep));
  const power = 10 ** exponent;
  const fraction = rawStep / power;

  let niceFraction = 1;

  if (fraction <= 1) {
    niceFraction = 1;
  } else if (fraction <= 2) {
    niceFraction = 2;
  } else if (fraction <= 2.5) {
    niceFraction = 2.5;
  } else if (fraction <= 5) {
    niceFraction = 5;
  } else {
    niceFraction = 10;
  }

  return niceFraction * power;
};

export const getChartScale = (chartData) => {
  const highestValue = Math.max(
    ...chartData.map((item) => Number(item.value) || 0),
    0,
  );

  if (highestValue <= 0) {
    return {
      maxValue: 30,
      yTicks: [0, 10, 20, 30],
    };
  }

  const useHours = highestValue >= 120;

  const rawStep = useHours
    ? highestValue / 60 / 3
    : highestValue / 3;

  const niceStep = getNiceChartStep(rawStep);

  const step = useHours
    ? niceStep * 60
    : niceStep;

  const maxValue = step * 3;

  return {
    maxValue,
    yTicks: [0, step, step * 2, maxValue],
  };
};
