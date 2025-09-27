import React, { useState, useEffect } from "react";
import { View, Text, FlatList, Button, Modal, StyleSheet } from "react-native";
import { Calendar } from "react-native-calendars";
import AsyncStorage from "@react-native-async-storage/async-storage";
import TaskForm from "./components/TaskForm";

export default function App() {
  const [selectedDate, setSelectedDate] = useState("");
  const [tasks, setTasks] = useState({});
  const [modalVisible, setModalVisible] = useState(false);

  // Load tasks on app start
  useEffect(() => {
    (async () => {
      const saved = await AsyncStorage.getItem("tasks");
      if (saved) setTasks(JSON.parse(saved));
    })();
  }, []);

  // Save tasks whenever changed
  useEffect(() => {
    AsyncStorage.setItem("tasks", JSON.stringify(tasks));
  }, [tasks]);

  // Add new task
  const addTask = (task) => {
    setTasks((prev) => {
      const newTasks = { ...prev };
      if (!newTasks[selectedDate]) newTasks[selectedDate] = [];
      newTasks[selectedDate].push(task);
      return newTasks;
    });
    setModalVisible(false);
  };

  return (
    <View style={{ flex: 1, padding: 10 }}>
      {/* Calendar */}
      <Calendar
        onDayPress={(day) => setSelectedDate(day.dateString)}
        markedDates={{
          ...Object.keys(tasks).reduce(
            (acc, date) => ({
              ...acc,
              [date]: { marked: true, dotColor: "red" },
            }),
            {}
          ),
          ...(selectedDate && {
            [selectedDate]: {
              selected: true,
              marked: true,
              selectedColor: "blue",
            },
          }),
        }}
      />

      {/* Show tasks for selected date */}
      <Text style={styles.heading}>
        Tasks for {selectedDate || "Select a date"}
      </Text>
      <FlatList
        data={tasks[selectedDate] || []}
        keyExtractor={(_, index) => index.toString()}
        renderItem={({ item }) => (
          <View style={styles.taskItem}>
            <Text style={styles.taskTitle}>{item.title}</Text>
            <Text>{item.time}</Text>
            <Text>{item.notes}</Text>
          </View>
        )}
      />

      <Button 
        title="Add Task"
        onPress ={() => {        
          if (selectedDate) {
             setModalVisible(true);
          } else {
            Alert.alert("please select a date first"); 
          }
        }}
      />

      {/* Task Form Modal */}
      <Modal visible={modalVisible} animationType="slide">
        <TaskForm
          onSave={addTask}
          onClose={() => setModalVisible(false)}
          date={selectedDate}
        />
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  heading: {
    fontSize: 18,
    fontWeight: "bold",
    marginVertical: 10,
  },
  taskItem: {
    padding: 10,
    marginVertical: 5,
    backgroundColor: "#f0f0f0",
    borderRadius: 5,
  },
  taskTitle: {
    fontWeight: "bold",
  },
});