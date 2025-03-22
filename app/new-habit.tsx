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
  const [selectedDays, setSelectedDays] = useState(
    Array(7).fill(false) // Initialize with 7 `false` values
  );

  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  const toggleDay = (index: number) => {
    setSelectedDays((prev) => {
      const newDays = [...prev];
      newDays[index] = !newDays[index]; // Toggle the selected day
      return newDays;
    });
  };

  const getWeekStartDate = (date: Date) => {
    const dayOfWeek = date.getDay(); // 0 (Sun) to 6 (Sat)
    const adjustedDayOfWeek = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Adjust to our Mon-Sun format
    const startDate = new Date(date);
    startDate.setDate(date.getDate() - adjustedDayOfWeek);
    return startDate;
  };

  const createHabit = async () => {
    try {
      const createdAt = Date.now();
      const habitId = await database
        .runAsync(
          `INSERT INTO habits (name, days, created_at) VALUES (?, ?, ?)`,
          [habitName, JSON.stringify(selectedDays), createdAt]
        )
        .then((result) => result.lastInsertRowId);

      const today = new Date();
      const currentWeekStart = getWeekStartDate(today);
      const nextWeekStart = new Date(currentWeekStart);
      nextWeekStart.setDate(currentWeekStart.getDate() + 7); // Move to next week

      const addEventsForWeek = async (weekStart: Date) => {
        for (let i = 0; i < 7; i++) {
          if (selectedDays[i]) {
            const eventDate = new Date(weekStart);
            eventDate.setDate(weekStart.getDate() + i);
            const formattedDate = eventDate.toISOString().split("T")[0];

            await database.runAsync(
              `INSERT INTO habit_events (habit_id, date, completed_at) VALUES (?, ?, NULL)`,
              [habitId, formattedDate, null]
            );
          }
        }
      };

      await addEventsForWeek(currentWeekStart);
      await addEventsForWeek(nextWeekStart);

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
