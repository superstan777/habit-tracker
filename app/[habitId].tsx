import { useState, useEffect } from "react";
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
import { useLocalSearchParams } from "expo-router";
import { useStore } from "@/utility/store";
import { habitType } from "@/types/types";

export const HabitDetailsScreen = () => {
  const { currentDate } = useStore();

  const habitId = Number(useLocalSearchParams().habitId);

  const database = useSQLiteContext();
  const [habitName, setHabitName] = useState("");
  const [selectedDays, setSelectedDays] = useState<boolean[]>([]);

  useEffect(() => {
    const fetchHabit = async () => {
      try {
        const result: habitType | null = await database.getFirstAsync(
          "SELECT * FROM habits WHERE id = ?",
          [habitId]
        );

        if (!result) {
          console.error(`Habit with ID ${habitId} not found.`);
          router.back();
          return;
        }

        setHabitName(result.name || "");
        setSelectedDays(
          result.days
            ? JSON.parse(result.days)
            : [false, false, false, false, false, false, false]
        );
      } catch (error) {
        console.error("Error fetching habit:", error);
      }
    };

    fetchHabit();
  }, [habitId]);

  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  const toggleDay = (index: number) => {
    setSelectedDays((prev) => {
      const newDays: boolean[] = [...prev];
      newDays[index] = !newDays[index]; // Toggle the boolean value
      return newDays;
    });
  };

  const updateHabit = async () => {
    try {
      const today = new Date(currentDate);
      const todayIndex = today.getDay(); // 0 (Sun) to 6 (Sat)

      const adjustedTodayIndex = todayIndex === 0 ? 6 : todayIndex - 1;

      const updatedDaysJson = JSON.stringify(selectedDays);

      // Update the habit name and selected days
      await database.runAsync(
        "UPDATE habits SET name = ?, days = ? WHERE id = ?",
        [habitName, updatedDaysJson, habitId]
      );

      // Delete existing events for this habit in the current week
      const todayDateString = today.toISOString().split("T")[0]; // Format as YYYY-MM-DD
      await database.runAsync(
        `DELETE FROM habit_events WHERE habit_id = ? AND date >= ?`,
        [habitId, todayDateString] // Use the formatted date string to delete today's and future events
      );

      // Iterate over the next days until Sunday (end of the current week)
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

      console.log("Habit updated successfully!");
      router.back();
    } catch (error) {
      console.error("Error updating habit:", error);
    }
  };

  const deleteHabit = async () => {
    try {
      await database.runAsync("DELETE FROM habits WHERE id = ?", [habitId]);
      // Delete all habit events related to the habit
      await database.runAsync("DELETE FROM habit_events WHERE habit_id = ?", [
        habitId,
      ]);
      router.back();
    } catch (error) {
      console.error("Error deleting habit:", error);
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

      <Button onPress={updateHabit}>Save</Button>
      <Button onPress={deleteHabit}>Delete</Button>
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

export default HabitDetailsScreen;
