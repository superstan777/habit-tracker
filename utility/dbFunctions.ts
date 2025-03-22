// import { SQLiteDatabase } from "expo-sqlite";

// export const addHabitEventsForNextWeek = async (database: SQLiteDatabase) => {
//   const today = new Date();
//   const dayOfWeek = today.getDay();

//   const daysUntilNextMonday = dayOfWeek === 0 ? 1 : 8 - dayOfWeek;
//   const nextMonday = new Date(today);
//   nextMonday.setDate(today.getDate() + daysUntilNextMonday);

//   const nextWeekDates = Array.from({ length: 7 }, (_, i) => {
//     const nextDate = new Date(nextMonday);
//     nextDate.setDate(nextMonday.getDate() + i);
//     return nextDate.toISOString().split("T")[0];
//   });

//   try {
//     const habits = await database.getAllAsync<{ id: number; days: string }>(
//       "SELECT id, days FROM habits"
//     );

//     if (!habits.length) return;

//     for (const habit of habits) {
//       const days = JSON.parse(habit.days);

//       for (let i = 0; i < 7; i++) {
//         if (days[i]) {
//           await database.runAsync(
//             `INSERT OR IGNORE INTO habit_events (habit_id, date) VALUES (?, ?)`,
//             [habit.id, nextWeekDates[i]]
//           );
//         }
//       }
//     }

//     console.log("Habit events for next week created!");
//   } catch (error) {
//     console.error("Error creating habit events for next week:", error);
//   }
// };

import { SQLiteDatabase } from "expo-sqlite";
import { getWeekNumber } from "./dateFunctions";

// Get last updated week from DB
export const getLastUpdatedWeek = async (
  database: SQLiteDatabase
): Promise<number | null> => {
  const result = await database.getFirstAsync<{ value: string }>(
    "SELECT value FROM metadata WHERE key = 'lastUpdatedWeek'"
  );
  return result ? parseInt(result.value, 10) : null;
};

// Set last updated week in DB
export const setLastUpdatedWeek = async (
  database: SQLiteDatabase,
  week: number
) => {
  await database.runAsync(
    "INSERT OR REPLACE INTO metadata (key, value) VALUES ('lastUpdatedWeek', ?)",
    [week.toString()]
  );
};

export const addHabitEventsForNextWeek = async (database: SQLiteDatabase) => {
  const today = new Date();
  const currentWeek = getWeekNumber(today);
  const lastUpdatedWeek = await getLastUpdatedWeek(database);

  console.log(currentWeek);
  console.log(lastUpdatedWeek);

  if (lastUpdatedWeek !== null && lastUpdatedWeek >= currentWeek) {
    console.log("Habit events already added.");
    return;
  }

  console.log("Adding habit events for next week...");

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
