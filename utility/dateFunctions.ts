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
