// import * as SQLite from 'expo-sqlite';

// // Open or create the database
// const db = SQLite.openDatabaseAsync('habitTracker.db');

// // Initialize the database with required tables
// const initDatabase = () => {
//   return new Promise((resolve, reject) => {
//     db.transaction(tx => {
//       // Create habits table
//       tx.executeSql(
//         'CREATE TABLE IF NOT EXISTS habits (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, created_at INTEGER);',
//         [],
//         () => {},
//         (_, error) => { console.error('Error creating habits table:', error); reject(error); return false; }
//       );

//       // Create habit_events table
//       tx.executeSql(
//         'CREATE TABLE IF NOT EXISTS habit_events (id INTEGER PRIMARY KEY AUTOINCREMENT, habit_id INTEGER, date TEXT, completed INTEGER DEFAULT 0, FOREIGN KEY (habit_id) REFERENCES habits (id) ON DELETE CASCADE, UNIQUE(habit_id, date));',
//         [],
//         () => { resolve(); },
//         (_, error) => { console.error('Error creating habit_events table:', error); reject(error); return false; }
//       );
//     });
//   });
// };

// export { db, initDatabase };
