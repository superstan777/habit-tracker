import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { useSQLiteContext } from "expo-sqlite";
import { router } from "expo-router";
import Button from "@/components/Button";

export const NewHabitScreen = () => {
  const database = useSQLiteContext();
  const [habitName, setHabitName] = useState("");
  const [selectedDays, setSelectedDays] = useState([
    false,
    false,
    false,
    false,
    false,
    false,
    false,
  ]);

  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  const toggleDay = (index: number) => {
    setSelectedDays((prev) => {
      const newDays = [...prev];
      newDays[index] = !newDays[index]; // Toggle the boolean value
      return newDays;
    });
  };

  // const createHabit = async () => {
  //   try {
  //     const createdAt = Date.now();
  //     await database.runAsync(
  //       `INSERT INTO habits (name, days, created_at) VALUES (?, ?, ?)`,
  //       [habitName, JSON.stringify(selectedDays), createdAt]
  //     );
  //     router.back();
  //   } catch (error) {
  //     console.error("Error saving item:", error);
  //   }
  // };

  const createHabit = async () => {
    try {
      const createdAt = Date.now();
      const habitId = await database
        .runAsync(
          `INSERT INTO habits (name, days, created_at) VALUES (?, ?, ?)`,
          [habitName, JSON.stringify(selectedDays), createdAt]
        )
        .then((result) => result.lastInsertRowId); // Get the inserted habit's ID

      // Get today's date and day index
      const today = new Date();
      const todayIndex = today.getDay(); // 0 (Sun) to 6 (Sat)

      // Adjust todayIndex to match our `selectedDays` array (Mon = 0, Sun = 6)
      const adjustedTodayIndex = todayIndex === 0 ? 6 : todayIndex - 1;

      // Iterate over the next days until Sunday (end of current week)
      for (let i = adjustedTodayIndex; i < 7; i++) {
        if (selectedDays[i]) {
          const nextDate = new Date();
          nextDate.setDate(today.getDate() + (i - adjustedTodayIndex)); // Move forward only within this week

          // Format the date in YYYY-MM-DD format
          const formattedDate = nextDate.toISOString().split("T")[0];

          await database.runAsync(
            `INSERT INTO habit_events (habit_id, date, completed_at) VALUES (?, ?, NULL)`,
            [habitId, formattedDate, null]
          );
        }
      }

      router.back();
    } catch (error) {
      console.error("Error saving habit:", error);
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Habit name"
        value={habitName}
        onChangeText={setHabitName}
      />

      <Text style={styles.sectionTitle}>Select Days</Text>
      <View style={styles.daysRow}>
        {days.map((day, index) => (
          <TouchableOpacity
            key={day}
            style={[
              styles.dayButton,
              selectedDays[index] && styles.selectedDay,
            ]}
            onPress={() => toggleDay(index)}
          >
            <Text
              style={[
                styles.dayText,
                selectedDays[index] && styles.selectedDayText,
              ]}
            >
              {day}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Button onPress={createHabit}>Create</Button>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#FFF" },
  input: {
    backgroundColor: "#F6F6F6",
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
  },
  sectionTitle: { fontSize: 16, fontWeight: "bold", marginTop: 20 },
  daysRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 10,
  },
  dayButton: {
    padding: 10,
    borderRadius: 8,
    backgroundColor: "#F6F6F6",
  },
  selectedDay: { backgroundColor: "#4CAF50" },
  dayText: { fontSize: 14, fontWeight: "bold" },
  selectedDayText: { color: "#FFF" },
});

export default NewHabitScreen;
