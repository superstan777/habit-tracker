import {
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
} from "react-native";
import { HabitItem } from "@/components/HabitItem";
import * as Haptics from "expo-haptics";
import { router, useFocusEffect } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";
import { useState, useCallback } from "react";
import { habitType } from "@/types/types";

function getCurrentWeek() {
  const now = new Date();
  const start = new Date(
    now.setDate(now.getDate() - now.getDay() + (now.getDay() === 0 ? -6 : 1))
  );

  return Array.from(
    { length: 7 },
    (_, i) => new Date(start.getTime() + i * 86400000)
  );
}

function getCurrentDate() {
  return new Date();
}

export default function Index() {
  const database = useSQLiteContext();
  const [habitData, setHabitData] = useState<habitType[]>([]);

  const [currentWeek, setCurrentWeek] = useState(getCurrentWeek());
  const [currentDate, setCurrentDate] = useState(getCurrentDate());

  useFocusEffect(
    useCallback(() => {
      loadData(); // Fetch data when the screen is focused
    }, [])
  );

  const loadData = async () => {
    const result = await database.getAllAsync<habitType>(
      "SELECT * FROM habits"
    );
    setHabitData(result);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>Habit Tracker</Text>
      <FlatList
        data={habitData}
        keyExtractor={(item: habitType) => item.id.toString()}
        renderItem={({ item }) => (
          <HabitItem
            name={item.name}
            currentDate={currentDate}
            currentWeek={currentWeek}
            id={item.id}
          />
        )}
        ListFooterComponent={
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => {
              if (process.env.EXPO_OS === "ios") {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              }
              router.push({
                pathname: "/new-habit",
              });
            }}
          >
            <Text style={styles.addButtonText}>+ New habit</Text>
          </TouchableOpacity>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFF" },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginVertical: 20,
  },
  addButton: {
    marginTop: 20,
    alignSelf: "center",
    padding: 10,
    borderRadius: 5,
    backgroundColor: "#000",
  },
  addButtonText: { color: "#FFF", fontSize: 16, fontWeight: "bold" },
});
