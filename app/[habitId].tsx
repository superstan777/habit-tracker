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

export const HabitDetailsScreen = () => {
  const { habitId } = useLocalSearchParams();

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

  useEffect(() => {
    async function fetchHabit() {
      const result = await database.getFirstAsync(
        "SELECT * FROM habits WHERE id = ?",
        [habitId]
      );

      setHabitName(result.name);
      setSelectedDays(JSON.parse(result.days));
    }

    fetchHabit();
  }, [habitId]);

  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  const toggleDay = (index: number) => {
    setSelectedDays((prev) => {
      const newDays = [...prev];
      newDays[index] = !newDays[index]; // Toggle the boolean value
      return newDays;
    });
  };

  // const updateHabit = async () => {
  //   try {
  //     const today = new Date();
  //     const todayIndex = today.getDay(); // 0 (Sunday) to 6 (Saturday)
  //     const adjustedTodayIndex = todayIndex === 0 ? 6 : todayIndex - 1;

  //     const weekStart = new Date(today);
  //     weekStart.setDate(today.getDate() - todayIndex + 1); // Move to Monday

  //     // Convert selected days array to JSON
  //     const updatedDaysJson = JSON.stringify(selectedDays);

  //     // Update the habit name and selected days
  //     await database.runAsync(
  //       "UPDATE habits SET name = ?, days = ? WHERE id = ?",
  //       [habitName, updatedDaysJson, habitId]
  //     );

  //     // Delete only future events of the current week
  //     const todayDateString = today.toISOString().split("T")[0]; // Format as YYYY-MM-DD
  //     await database.runAsync(
  //       `DELETE FROM habit_events WHERE habitId = ? AND date >= ?`,
  //       [habitId, todayDateString] // Use the formatted date string
  //     );

  //     // Insert new habit events only for the rest of this week
  //     for (let i = adjustedTodayIndex; i < 7; i++) {
  //       const nextDate = new Date(weekStart);
  //       nextDate.setDate(today.getDate() + (i - adjustedTodayIndex)); // Move forward only within this week

  //       const dayIndex = nextDate.getDay(); // Get the day index

  //       if (nextDate >= today && selectedDays[dayIndex]) {
  //         await database.runAsync(
  //           `INSERT INTO habit_events (habitId, date, completed_at) VALUES (?, ?, NULL)`,
  //           [habitId, nextDate.toISOString().split("T")[0]] // Store the date in YYYY-MM-DD format
  //         );
  //       }
  //     }

  //     console.log("Habit updated successfully!");
  //     router.back();
  //   } catch (error) {
  //     console.error("Error updating habit:", error);
  //   }
  // };

  const updateHabit = async () => {
    try {
      // Get today's date and day index
      const today = new Date();
      const todayIndex = today.getDay(); // 0 (Sun) to 6 (Sat)

      // Adjust todayIndex to match our `selectedDays` array (Mon = 0, Sun = 6)
      const adjustedTodayIndex = todayIndex === 0 ? 6 : todayIndex - 1;

      // Convert selected days array to JSON
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
