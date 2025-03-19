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
import { useState, useCallback, useMemo } from "react";
import { habitType } from "@/types/types";
import { useStore } from "@/utility/store";

export default function Index() {
  const { currentDate, currentWeek } = useStore();
  const database = useSQLiteContext();
  const [habits, setHabits] = useState<habitType[]>([]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const loadData = async () => {
    const result = await database.getAllAsync<habitType>(
      "SELECT * FROM habits"
    );
    setHabits(result);
  };

  const memoizedHabits = useMemo(() => habits, [habits]);

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>Habit Tracker</Text>
      <FlatList
        data={memoizedHabits}
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
