import { useEffect, useState } from "react";
import { AppState, AppStateStatus } from "react-native";
import { Stack, router } from "expo-router";
import Button from "@/components/Button";
import { SQLiteProvider, SQLiteDatabase } from "expo-sqlite";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useStore } from "@/utility/store";

export default function RootLayout() {
  const [appState, setAppState] = useState<AppStateStatus>(
    AppState.currentState
  );

  const { setCurrentDate, currentDate } = useStore();

  console.log(appState);
  console.log(currentDate);

  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (appState.match(/inactive|background/) && nextAppState === "active") {
        setCurrentDate(); // Update current date when app becomes active
      }
      setAppState(nextAppState);
    };

    const subscription = AppState.addEventListener(
      "change",
      handleAppStateChange
    );

    return () => {
      subscription.remove();
    };
  }, [appState, setCurrentDate]);

  const createDbIfNeeded = async (db: SQLiteDatabase) => {
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

      console.log("Database loaded");
    } catch (error) {
      console.error("Error creating database:", error);
    }
  };

  return (
    <GestureHandlerRootView>
      <SQLiteProvider
        databaseName="test1111111111.db"
        onInit={createDbIfNeeded}
      >
        <Stack>
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen
            name="new-habit"
            options={{
              presentation: "modal",
              headerTitle: "Add habit",
              headerLeft: () => (
                <Button variant="ghost" onPress={() => router.back()}>
                  Cancel
                </Button>
              ),
              headerRight: () => (
                <Button variant="ghost" onPress={() => router.back()}>
                  Done
                </Button>
              ),
            }}
          />

          <Stack.Screen
            name="[habitId]"
            options={{
              presentation: "modal",
              headerTitle: "Edit habit",
            }}
          />
        </Stack>
      </SQLiteProvider>
    </GestureHandlerRootView>
  );
}
