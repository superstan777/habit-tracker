// import { StyleSheet, Text, View } from "react-native";
// import { useState } from "react";

// interface Props {
//   name: string;
//   color: string;
//   days: boolean[];
// }

// export const DayItem: React.FC<Props> = ({ name, color, days }) => {

//     const [active,setActive] = useState(false)

//   return (
//     <View key={index} style={styles.daysContainer}>
//     <Text style={styles.habitText}>{renderDays(index)}</Text>

//     <View
//       style={[
//         styles.dayCircle,
//         {
//           backgroundColor:
//             days[index] && firstDay + index < today
//               ? color
//               : "transparent",
//           borderWidth: days[index] && firstDay + index >= today ? 4 : 0,
//           borderColor: color,
//         },
//       ]}
//     >
//       <Text
//         style={[
//           styles.dayText,

//           { color: days[index] ? "white" : "black" },
//         ]}
//       >
//         {firstDay + index}
//       </Text>
//     </View>
//   </View>
//   );
// };

// const styles = StyleSheet.create({
//   habitCard: {
//     backgroundColor: "#F9F9F9",
//     padding: 15,
//     borderRadius: 10,
//     marginBottom: 10,
//     margin: 16,
//   },
//   habitHeader: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     marginBottom: 24,
//   },
//   habitTitle: { fontSize: 18, fontWeight: "bold" },
//   habitText: { fontSize: 12, color: "gray" },
//   daysRow: { flexDirection: "row", justifyContent: "space-between" },
//   dayCircle: {
//     width: 36,
//     height: 36,
//     borderRadius: 18,
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   dayCircleDone: {},
//   dayText: { fontSize: 14, fontWeight: "bold" },

//   daysContainer: {
//     justifyContent: "center",
//     gap: 12,
//     alignItems: "center",
//   },
// });
