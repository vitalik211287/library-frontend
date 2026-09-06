export const isValidIsbn13 = (value) => {
  if (!/^\d{13}$/.test(value)) {
    return false;
  }

  if (
    !value.startsWith("978") &&
    !value.startsWith("979")
  ) {
    return false;
  }

  let sum = 0;

  for (let index = 0; index < 12; index += 1) {
    const digit = Number(value[index]);

    sum += index % 2 === 0
      ? digit
      : digit * 3;
  }

  const checkDigit =
    (10 - (sum % 10)) % 10;

  return checkDigit === Number(value[12]);
};
