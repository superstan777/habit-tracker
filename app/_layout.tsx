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

  useEffect(() => {
    addHabitEventsForNextWeek(database);
  }, []);

  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (appState.match(/inactive|background/) && nextAppState === "active") {
        setCurrentDate(); // Update current date when app becomes active
        addHabitEventsForNextWeek(database);
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
