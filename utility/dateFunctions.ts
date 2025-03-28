export const getWeekNumber = (date: Date): number => {
  const oneJan = new Date(date.getFullYear(), 0, 1);
  const diff = date.getTime() - oneJan.getTime();
  return Math.floor(diff / (7 * 24 * 60 * 60 * 1000)) + 1;
};

export const convertUTCToLocal = (utcDate: string): Date => {
  const [year, month, day] = utcDate.split("-").map(Number);
  const utcDateObj = new Date(Date.UTC(year, month - 1, day));
  return new Date(
    utcDateObj.getTime() + utcDateObj.getTimezoneOffset() * 60000
  );
};

export const getWeekStartDateUTC = (date: Date) => {
  const dayOfWeek = date.getUTCDay();
  const adjustedDayOfWeek = dayOfWeek === 0 ? 6 : dayOfWeek - 1;

  const startDate = new Date(
    Date.UTC(
      date.getUTCFullYear(),
      date.getUTCMonth(),
      date.getUTCDate() - adjustedDayOfWeek,
      0,
      0,
      0,
      0
    )
  );

  return startDate;
};
