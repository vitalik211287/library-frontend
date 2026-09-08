export const createEmptyWeeks = (
  count,
  current,
) =>
  Array.from(
    { length: count },
    (_, index) => ({
      label: `Тиждень ${index + 1}`,
      value: 0,
      current,
    }),
  );

const getMonday = (date) => {
  const result = new Date(date);

  result.setHours(0, 0, 0, 0);

  const dayOfWeek = result.getDay();

  const daysFromMonday =
    dayOfWeek === 0
      ? 6
      : dayOfWeek - 1;

  result.setDate(
    result.getDate() -
      daysFromMonday,
  );

  return result;
};

const formatWeekLabel = (monday) => {
  const sunday = new Date(monday);

  sunday.setDate(
    sunday.getDate() + 6,
  );

  const formatDate = (date) =>
    `${String(date.getDate()).padStart(2, "0")}.${String(
      date.getMonth() + 1,
    ).padStart(2, "0")}`;

  return `${formatDate(monday)}?${formatDate(sunday)}`;
};

export const buildCalendarWeeks = ({
  previousDays,
  currentDays,
  previousYear,
  previousMonth,
  currentYear,
  currentMonth,
}) => {
  const now = new Date();

  const firstMonday = getMonday(
    new Date(
      previousYear,
      previousMonth - 1,
      1,
    ),
  );

  const currentMonday =
    getMonday(now);

  const weeks = [];

  const weekMap = new Map();

  for (
    let cursor = new Date(firstMonday);
    cursor <= currentMonday;
    cursor.setDate(
      cursor.getDate() + 7,
    )
  ) {
    const monday =
      new Date(cursor);

    const key =
      monday.getTime();

    const week = {
      label:
        formatWeekLabel(monday),

      value: 0,

      current:
        key ===
        currentMonday.getTime(),

      monday,
    };

    weeks.push(week);

    weekMap.set(
      key,
      week,
    );
  }

  const daysWithDates = [
    ...previousDays.map(
      (day) => ({
        ...day,

        date: new Date(
          previousYear,
          previousMonth - 1,
          Number(day.day),
        ),
      }),
    ),

    ...currentDays.map(
      (day) => ({
        ...day,

        date: new Date(
          currentYear,
          currentMonth - 1,
          Number(day.day),
        ),
      }),
    ),
  ];

  daysWithDates.forEach(
    (day) => {
      const monday =
        getMonday(day.date);

      const week =
        weekMap.get(
          monday.getTime(),
        );

      if (!week) {
        return;
      }

      week.value +=
        (Number(
          day.seconds,
        ) || 0) / 60;
    },
  );

  return weeks.map(
    ({
      monday,
      ...week
    }) => ({
      ...week,

      value:
        Math.round(
          week.value,
        ),
    }),
  );
};

export const getCurrentMonthSeconds = (
  days,
) =>
  days.reduce(
    (total, day) =>
      total +
      (Number(day.seconds) || 0),
    0,
  );

export const getCurrentWeekStats = ({
  previousDays,
  currentDays,
  previousYear,
  previousMonth,
  currentYear,
  currentMonth,
}) => {
  const now = new Date();

  const dayOfWeek = now.getDay();

  const daysFromMonday =
    dayOfWeek === 0
      ? 6
      : dayOfWeek - 1;

  const monday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() -
      daysFromMonday,
  );

  monday.setHours(
    0,
    0,
    0,
    0,
  );

  const tomorrow = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() + 1,
  );

  tomorrow.setHours(
    0,
    0,
    0,
    0,
  );

  const daysWithDates = [
    ...previousDays.map(
      (day) => ({
        ...day,

        date: new Date(
          previousYear,
          previousMonth - 1,
          Number(day.day),
        ),
      }),
    ),

    ...currentDays.map(
      (day) => ({
        ...day,

        date: new Date(
          currentYear,
          currentMonth - 1,
          Number(day.day),
        ),
      }),
    ),
  ];

  return daysWithDates.reduce(
    (total, day) => {
      if (
        day.date < monday ||
        day.date >= tomorrow
      ) {
        return total;
      }

      return {
        seconds:
          total.seconds +
          (Number(
            day.seconds,
          ) || 0),

        pages:
          total.pages +
          (Number(
            day.pages,
          ) || 0),

        sessions:
          total.sessions +
          (Number(
            day.sessions,
          ) || 0),
      };
    },

    {
      seconds: 0,
      pages: 0,
      sessions: 0,
    },
  );
};

export const formatReadingTime = (
  totalSeconds,
) => {
  const totalMinutes =
    Math.floor(
      totalSeconds / 60,
    );

  const hours =
    Math.floor(
      totalMinutes / 60,
    );

  const minutes =
    totalMinutes % 60;

  if (hours === 0) {
    return `${minutes} хв`;
  }

  if (minutes === 0) {
    return `${hours} год`;
  }

  return `${hours} год ${minutes} хв`;
};

export const getChartScale = (
  chartData,
) => {
  const highestValue = Math.max(
    ...chartData.map(
      (item) =>
        Number(item.value) || 0,
    ),
    0,
  );

  let step = 10;

  if (highestValue <= 30) {
    step = 10;
  } else if (
    highestValue <= 60
  ) {
    step = 20;
  } else if (
    highestValue <= 120
  ) {
    step = 40;
  } else if (
    highestValue <= 180
  ) {
    step = 60;
  } else if (
    highestValue <= 360
  ) {
    step = 120;
  } else {
    step =
      Math.ceil(
        highestValue /
          3 /
          60,
      ) * 60;
  }

  return {
    maxValue: step * 3,
    yTicks: [
      0,
      step,
      step * 2,
      step * 3,
    ],
  };
};
