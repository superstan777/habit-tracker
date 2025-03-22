export const getWeekNumber = (date: Date): number => {
  const oneJan = new Date(date.getFullYear(), 0, 1);
  const diff = date.getTime() - oneJan.getTime();
  return Math.floor(diff / (7 * 24 * 60 * 60 * 1000)) + 1;
};
