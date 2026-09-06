export const formatEstimatedTime = (seconds) => {
  if (
    seconds === null ||
    seconds === undefined ||
    seconds <= 0
  ) {
    return "—";
  }

  const totalMinutes = Math.ceil(seconds / 60);
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
