import { SQLiteDatabase } from "expo-sqlite";

// export const DB_NAME = "habit_tracker.db";
export const DB_NAME = "test1111111111.db";

export const createDbIfNeeded = async (db: SQLiteDatabase) => {
  try {
    await db.execAsync("PRAGMA foreign_keys = ON;");

    await db.execAsync(
      `CREATE TABLE IF NOT EXISTS habits (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        days TEXT NOT NULL,
        created_at INTEGER
      );`
    );

    await db.execAsync(
      `CREATE TABLE IF NOT EXISTS habit_events (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        habit_id INTEGER NOT NULL,
        date TEXT NOT NULL,
        completed_at INTEGER DEFAULT NULL,
        FOREIGN KEY (habit_id) REFERENCES habits(id) ON DELETE CASCADE
      );`
    );

    console.log("Database initialized successfully.");
  } catch (error) {
    console.error("Error initializing database:", error);
  }
};
