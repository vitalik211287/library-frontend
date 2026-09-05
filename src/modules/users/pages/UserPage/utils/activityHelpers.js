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

export const buildPreviousMonthWeeks = (
  days,
) => {
  const weeks = createEmptyWeeks(
    4,
    false,
  );

  days.forEach((day) => {
    const dayNumber =
      Number(day.day) || 0;

    const seconds =
      Number(day.seconds) || 0;

    let weekIndex = 0;

    if (dayNumber <= 7) {
      weekIndex = 0;
    } else if (dayNumber <= 14) {
      weekIndex = 1;
    } else if (dayNumber <= 21) {
      weekIndex = 2;
    } else {
      weekIndex = 3;
    }

    weeks[weekIndex].value +=
      seconds / 60;
  });

  return weeks.map((week) => ({
    ...week,
    value: Math.round(week.value),
  }));
};

export const buildCurrentMonthWeeks = (
  days,
) => {
  const weeks = createEmptyWeeks(
    5,
    true,
  );

  days.forEach((day) => {
    const dayNumber =
      Number(day.day) || 0;

    const seconds =
      Number(day.seconds) || 0;

    let weekIndex = Math.floor(
      (dayNumber - 1) / 7,
    );

    weekIndex = Math.min(
      Math.max(weekIndex, 0),
      4,
    );

    weeks[weekIndex].value +=
      seconds / 60;
  });

  return weeks.map((week) => ({
    ...week,
    value: Math.round(week.value),
  }));
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
