import { Pressable, StyleSheet, Text, View, Dimensions } from "react-native";
import { useState, useCallback, useMemo, useEffect } from "react";
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
import { eventType, habitType } from "@/types/types";
import { convertUTCToLocal } from "@/utility/dateFunctions";

const SCREEN_WIDTH = Dimensions.get("window").width;

interface Props {
  name: string;
  currentDate: string; // UTC stored as "YYYY-MM-DD"
  currentWeek: string[]; // Array of UTC dates as "YYYY-MM-DD"
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
  const [isReadyToComplete, setIsReadyToComplete] = useState(false);

  const [events, setEvents] = useState<eventType[]>([]);
  const [doneTimes, setDoneTimes] = useState<number>(0);
  const database = useSQLiteContext();
  const position = useSharedValue(0);

  const localCurrentDate = useMemo(
    () => convertUTCToLocal(currentDate),
    [currentDate]
  );
  const localCurrentWeek = useMemo(
    () => currentWeek.map(convertUTCToLocal),
    [currentWeek]
  );

  useFocusEffect(
    useCallback(() => {
      loadEvents();
      getDoneTimes();
    }, [])
  );

  useEffect(() => {
    if (events.length > 0) {
      checkIfReadyToComplete();
    }
  }, [events]);

  const checkIfReadyToComplete = () => {
    const todayUTC = new Date().toISOString().split("T")[0]; // Get today's UTC date
    const todayEvent = events.find((event) => event.date === todayUTC);

    if (todayEvent && !todayEvent.completed_at) {
      setIsReadyToComplete(true);
    } else {
      setIsReadyToComplete(false);
    }
  };

  const getDoneTimes = async () => {
    const result = await database.getFirstAsync<habitType>(
      "SELECT done_times FROM habits WHERE id = ?",
      [id]
    );
    setDoneTimes(result!.done_times);
  };

  const loadEvents = async () => {
    const result = await database.getAllAsync<eventType>(
      "SELECT * FROM habit_events WHERE habit_id = ? ",
      // "SELECT * FROM habit_events WHERE habit_id = ? AND date BETWEEN ? AND ?",
      // [id, currentWeek[0], currentWeek[6]]
      [id]
    );
    setEvents(result);
  };

  const updateDoneTimes = async () => {
    await database.runAsync(
      "UPDATE habits SET done_times = ? WHERE id = ?",

      [doneTimes + 1, id]
    );
  };

  const updateHabitEvent = async () => {
    const todayUTC = new Date().toISOString().split("T")[0];
    await database.runAsync(
      `UPDATE habit_events SET completed_at = ? WHERE habit_id = ? AND date = ?`,
      [Date.now(), id, todayUTC]
    );
  };

  const memoizedEvents = useMemo(() => events, [events]);

  const renderDoneTimes = useMemo(() => {
    return `Done ${doneTimes} times`;
  }, [memoizedEvents]);

  const renderDays = (index: number) => {
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    return days[index] || "";
  };

  const resetPosition = () => {
    position.value = -SCREEN_WIDTH;
    position.value = withTiming(0, { duration: 300 });
  };

  const panGesture = Gesture.Pan()
    .enabled(isReadyToComplete)
    .onUpdate((e) => {
      position.value = e.translationX;
    })
    .onEnd(() => {
      if (position.value > SCREEN_WIDTH / 2) {
        position.value = withTiming(SCREEN_WIDTH, { duration: 300 }, () => {
          runOnJS(resetPosition)();
        });

        runOnJS(updateHabitEvent)();
        runOnJS(updateDoneTimes)();
        runOnJS(loadEvents)();
        runOnJS(getDoneTimes)();
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
            <Text style={styles.habitText}>{renderDoneTimes}</Text>
          </View>
          <View style={styles.daysRow}>
            {localCurrentWeek.map((date, index) => {
              const dateString = currentWeek[index]; // Still compare with stored UTC
              const event = memoizedEvents.find((e) => e.date === dateString);
              let bgColor = "transparent";
              let textColor = colorDefaultText;

              if (!event) {
                bgColor = "transparent";
              } else if (event.completed_at) {
                bgColor = colorCompleted;
                textColor = "white";
              } else if (date < localCurrentDate) {
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
                          date.getDate() === localCurrentDate.getDate() ? 4 : 0,
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
