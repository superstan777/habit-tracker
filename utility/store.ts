import { create } from "zustand";

interface AppState {
  currentDate: string; // Store as UTC string "YYYY-MM-DD"
  currentWeek: string[]; // Store week dates as UTC strings
  setCurrentDate: () => void;
}

// Utility to get UTC date as "YYYY-MM-DD"
const formatToUTCDate = (date: Date) =>
  new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
    .toISOString()
    .split("T")[0];

// Get the start of the week in UTC and return an array of UTC-formatted dates
const getCurrentWeekUTC = (currentDate: Date): string[] => {
  const start = new Date(
    Date.UTC(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      currentDate.getDate()
    )
  );
  start.setUTCDate(
    currentDate.getUTCDate() -
      currentDate.getUTCDay() +
      (currentDate.getUTCDay() === 0 ? -6 : 1) // Adjust for Monday start
  );

  return Array.from({ length: 7 }, (_, i) =>
    formatToUTCDate(new Date(start.getTime() + i * 86400000))
  );
};

export const useStore = create<AppState>((set, get) => ({
  currentDate: formatToUTCDate(new Date()), // Store UTC date

  currentWeek: getCurrentWeekUTC(new Date()), // Store week in UTC

  setCurrentDate: () =>
    set(() => {
      const now = new Date();
      const todayUTC = formatToUTCDate(now);

      // Prevent unnecessary updates
      if (get().currentDate === todayUTC) return {};

      return { currentDate: todayUTC, currentWeek: getCurrentWeekUTC(now) };
    }),
}));
