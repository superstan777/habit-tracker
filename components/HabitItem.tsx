import { Pressable, StyleSheet, Text, View, Dimensions } from "react-native";
import { useState, useCallback, useMemo } from "react";
import { useSQLiteContext } from "expo-sqlite";
import { useFocusEffect } from "expo-router";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  useSharedValue,
  withTiming,
  useAnimatedStyle,
  runOnJS,
} from "react-native-reanimated";
import { router } from "expo-router";
import { eventType } from "@/types/types";

const SCREEN_WIDTH = Dimensions.get("window").width;

interface Props {
  name: string;
  currentDate: Date;
  currentWeek: Date[];
  id: number;
}

const colorCompleted = "#34C759";
const colorPending = "#A5D6A7";
const colorNotCompleted = "#FF3B30";
const colorDefaultText = "black";

export const HabitItem: React.FC<Props> = ({
  name,
  currentDate,
  currentWeek,
  id,
}) => {
  const [events, setEvents] = useState<eventType[]>([]);
  const database = useSQLiteContext();
  const position = useSharedValue(0);

  useFocusEffect(
    useCallback(() => {
      loadEvents();
    }, [])
  );

  const loadEvents = async () => {
    const result = await database.getAllAsync<eventType>(
      "SELECT * FROM habit_events WHERE habit_id = ? AND date BETWEEN ? AND ?",
      [
        id,
        currentWeek[0].toISOString().split("T")[0],
        currentWeek[6].toISOString().split("T")[0],
      ]
    );
    setEvents(result);
  };

  const updateHabitEvent = async () => {
    const today = new Date().toISOString().split("T")[0];
    await database.runAsync(
      `UPDATE habit_events SET completed_at = ? WHERE habit_id = ? AND date = ?`,
      [Date.now(), id, today]
    );
  };

  const memoizedEvents = useMemo(() => events, [events]);

  const renderFrequency = useMemo(() => {
    return memoizedEvents.length === 7
      ? "everyday"
      : `${memoizedEvents.length} times a week`;
  }, [memoizedEvents]);

  const renderDays = (index: number) => {
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    return days[index] || "";
  };

  const panGesture = Gesture.Pan()
    .onUpdate((e) => {
      position.value = e.translationX;
    })
    .onEnd(() => {
      if (position.value > SCREEN_WIDTH / 2) {
        position.value = withTiming(SCREEN_WIDTH, { duration: 300 }, () => {
          runOnJS(loadEvents)();
        });
        runOnJS(updateHabitEvent)();
      } else {
        position.value = withTiming(0, { duration: 300 });
      }
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: position.value }],
  }));

  return (
    <GestureDetector gesture={panGesture}>
      <Animated.View style={[styles.habitCard, animatedStyle]}>
        <Pressable
          onPress={() =>
            router.push({ pathname: "/[habitId]", params: { habitId: id } })
          }
        >
          <View style={styles.habitHeader}>
            <Text style={styles.habitTitle}>{name}</Text>
            <Text style={styles.habitText}>{renderFrequency}</Text>
          </View>
          <View style={styles.daysRow}>
            {currentWeek.map((date, index) => {
              const dateString = date.toISOString().split("T")[0];
              const event = memoizedEvents.find((e) => e.date === dateString);
              let bgColor = "transparent";
              let textColor = colorDefaultText;

              if (!event) {
                bgColor = "transparent";
              } else if (event.completed_at) {
                bgColor = colorCompleted;
                textColor = "white";
              } else if (date < currentDate) {
                bgColor = colorNotCompleted;
                textColor = "white";
              } else {
                bgColor = colorPending;
                textColor = "white";
              }

              return (
                <View key={index} style={styles.daysContainer}>
                  <Text style={styles.habitText}>{renderDays(index)}</Text>
                  <View
                    style={[
                      styles.dayCircle,
                      {
                        backgroundColor: bgColor,
                        borderWidth:
                          date.getDate() === currentDate.getDate() ? 4 : 0,
                        borderColor: colorCompleted,
                      },
                    ]}
                  >
                    <Text style={[styles.dayText, { color: textColor }]}>
                      {date.getDate()}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        </Pressable>
      </Animated.View>
    </GestureDetector>
  );
};

const styles = StyleSheet.create({
  habitCard: {
    backgroundColor: "#F9F9F9",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    margin: 16,
  },
  habitHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  habitTitle: { fontSize: 18, fontWeight: "bold" },
  habitText: { fontSize: 12, color: "gray" },
  daysRow: { flexDirection: "row", justifyContent: "space-between" },
  dayCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  dayText: { fontSize: 14, fontWeight: "bold" },
  daysContainer: {
    justifyContent: "center",
    gap: 12,
    alignItems: "center",
  },
});
