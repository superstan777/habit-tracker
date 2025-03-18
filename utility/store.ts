import { create } from "zustand";

interface AppState {
  currentDate: Date;
  currentWeek: Date[];
  setCurrentDate: (date: Date) => void;
}

const getCurrentWeek = (currentDate: Date): Date[] => {
  const start = new Date(currentDate);
  start.setDate(
    currentDate.getDate() -
      currentDate.getDay() +
      (currentDate.getDay() === 0 ? -6 : 1)
  );

  return Array.from(
    { length: 7 },
    (_, i) => new Date(start.getTime() + i * 86400000)
  );
};

export const useStore = create<AppState>((set) => ({
  currentDate: new Date(),
  currentWeek: getCurrentWeek(new Date()),

  setCurrentDate: (date: Date) =>
    set((state) => {
      const newCurrentWeek = getCurrentWeek(date);
      return { currentDate: date, currentWeek: newCurrentWeek };
    }),
}));
