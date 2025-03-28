import { useEffect, useState } from "react";
import { AppState, AppStateStatus } from "react-native";
import { Stack, router } from "expo-router";
import Button from "@/components/Button";
import { SQLiteProvider } from "expo-sqlite";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useStore } from "@/utility/store";
import { DB_NAME, createDbIfNeeded } from "@/utility/db";
import { addHabitEventsForNextWeek } from "@/utility/dbFunctions";
import { database } from "@/utility/db";

export default function RootLayout() {
  const [appState, setAppState] = useState<AppStateStatus>(
    AppState.currentState
  );
  const { setCurrentDate } = useStore();
  let midnightTimeout: NodeJS.Timeout | null = null; // Store the timeout reference

  // Function to calculate time until midnight and set a timeout
  const scheduleMidnightUpdate = () => {
    if (midnightTimeout) clearTimeout(midnightTimeout); // Clear any existing timeout

    const now = new Date();

    // Calculate next local midnight
    const nextMidnight = new Date(now);
    nextMidnight.setDate(now.getDate() + 1); // Move to next day
    nextMidnight.setHours(0, 0, 0, 0); // Reset time to midnight

    const timeUntilMidnight = nextMidnight.getTime() - now.getTime(); // Time left until next midnight

    midnightTimeout = setTimeout(() => {
      setCurrentDate(); // Update UI for new date
      scheduleMidnightUpdate(); // Reschedule for the next midnight
    }, timeUntilMidnight);
  };

  useEffect(() => {
    addHabitEventsForNextWeek(database); // Ensure next week's events are added
    scheduleMidnightUpdate(); // Schedule the midnight update
  }, []);

  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (appState.match(/inactive|background/) && nextAppState === "active") {
        setCurrentDate(); // Update current date when app becomes active
        addHabitEventsForNextWeek(database);
        scheduleMidnightUpdate(); // Reset the midnight update
      }

      if (nextAppState !== "active" && midnightTimeout) {
        clearTimeout(midnightTimeout); // Clear timeout to avoid memory leaks
      }

      setAppState(nextAppState);
    };

    const subscription = AppState.addEventListener(
      "change",
      handleAppStateChange
    );

    return () => {
      subscription.remove();
      if (midnightTimeout) clearTimeout(midnightTimeout); // Cleanup on unmount
    };
  }, [appState, setCurrentDate]);

  return (
    <GestureHandlerRootView>
      <SQLiteProvider databaseName={DB_NAME} onInit={createDbIfNeeded}>
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
