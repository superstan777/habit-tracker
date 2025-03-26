import { SQLiteDatabase, openDatabaseAsync } from "expo-sqlite";

export const DB_NAME = "habit_tracker11111.db";
// export const DB_NAME = "test1111111111.db";

export let database: SQLiteDatabase;

(async () => {
  database = await openDatabaseAsync(DB_NAME);
})();

export const createDbIfNeeded = async (db: SQLiteDatabase) => {
  try {
    await db.execAsync("PRAGMA foreign_keys = ON;");

    await db.execAsync(
      `CREATE TABLE IF NOT EXISTS habits (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        days TEXT NOT NULL,
        created_at INTEGER,
        done_times INTEGER DEFAULT 0 
      );`
    );

    await db.execAsync(
      `CREATE TABLE IF NOT EXISTS habit_events (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        habit_id INTEGER NOT NULL,
        date TEXT NOT NULL,
        completed_at INTEGER DEFAULT NULL,
        FOREIGN KEY (habit_id) REFERENCES habits(id) ON DELETE CASCADE
        UNIQUE (habit_id, date)
      );`
    );

    await db.execAsync(
      `CREATE TABLE IF NOT EXISTS metadata (
        key TEXT PRIMARY KEY,
        value TEXT
      )`
    );

    console.log("Database initialized successfully.");
  } catch (error) {
    console.error("Error initializing database:", error);
  }
};
