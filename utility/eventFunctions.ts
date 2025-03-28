import { SQLiteDatabase } from "expo-sqlite";
import { getWeekNumber } from "./dateFunctions";
import { getLastUpdatedWeek, setLastUpdatedWeek } from "./metadataFunctions";

export const addAllEventsForNextWeek = async (database: SQLiteDatabase) => {
  const today = new Date();
  const currentWeek = getWeekNumber(today);
  const lastUpdatedWeek = await getLastUpdatedWeek(database);

  if (lastUpdatedWeek !== null && lastUpdatedWeek >= currentWeek) {
    console.log("Habit events already added.");
    return;
  }

  const nextMonday = new Date(today);
  nextMonday.setDate(today.getDate() + ((8 - today.getDay()) % 7)); // Get next Monday

  const nextWeekDates = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(nextMonday);
    date.setDate(nextMonday.getDate() + i);
    return date.toISOString().split("T")[0];
  });

  try {
    const habits = await database.getAllAsync<{ id: number; days: string }>(
      "SELECT id, days FROM habits"
    );

    if (!habits.length) return;

    for (const habit of habits) {
      const days = JSON.parse(habit.days);

      for (let i = 0; i < nextWeekDates.length; i++) {
        if (days[i]) {
          await database.runAsync(
            `INSERT OR IGNORE INTO habit_events (habit_id, date) VALUES (?, ?)`,
            [habit.id, nextWeekDates[i]]
          );
        }
      }
    }

    await setLastUpdatedWeek(database, currentWeek);
    console.log(`Habit events for week ${currentWeek + 1} created!`);
  } catch (error) {
    console.error("Error creating habit events:", error);
  }
};

const today = new Date();

const todayUTC = new Date(
  Date.UTC(
    today.getUTCFullYear(),
    today.getUTCMonth(),
    today.getUTCDate(),
    0,
    0,
    0,
    0
  )
);

export const addEventsForCurrentWeek = async (
  database: SQLiteDatabase,
  habitId: number,
  selectedDays: boolean[],
  weekStart: Date
) => {
  for (let i = 0; i < 7; i++) {
    if (selectedDays[i]) {
      const eventDate = new Date(weekStart);
      eventDate.setUTCDate(weekStart.getUTCDate() + i); // Safely move to the next date
      eventDate.setUTCHours(0, 0, 0, 0); // Normalize time in UTC

      if (eventDate >= todayUTC) {
        const formattedDate = eventDate.toISOString().split("T")[0];

        await database.runAsync(
          `INSERT INTO habit_events (habit_id, date, completed_at) VALUES (?, ?, NULL)`,
          [habitId, formattedDate, null]
        );
      }
    }
  }
};

export const addEventsForNextWeek = async (
  database: SQLiteDatabase,
  habitId: number,
  selectedDays: boolean[],
  weekStart: Date
) => {
  for (let i = 0; i < 7; i++) {
    if (selectedDays[i]) {
      const eventDate = new Date(weekStart);
      eventDate.setUTCDate(weekStart.getUTCDate() + i); // Safely move to the next date
      eventDate.setUTCHours(0, 0, 0, 0); // Normalize time in UTC

      const formattedDate = eventDate.toISOString().split("T")[0];

      await database.runAsync(
        `INSERT INTO habit_events (habit_id, date, completed_at) VALUES (?, ?, NULL)`,
        [habitId, formattedDate, null]
      );
    }
  }
};
