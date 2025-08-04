import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Button,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
} from "react-native";
import firestore from "@react-native-firebase/firestore";
import auth from "@react-native-firebase/auth";
import moment from "moment";
import "moment/locale/tr";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";

const AppointmentsScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(true);
  const [appointments, setAppointments] = useState([]);

  useEffect(() => {
    moment.locale("tr");
    const user = auth().currentUser;
    const subscriber = firestore()
      .collection("users")
      .doc(user.uid)
      .collection("appointments")
      .orderBy("appointmentDate", "asc")
      .onSnapshot((qs) => {
        const data = [];
        qs.forEach((doc) => data.push({ id: doc.id, ...doc.data() }));
        setAppointments(data);
        setLoading(false);
      });
    return () => subscriber();
  }, []);

  const handleDelete = (appointmentId) => {
    Alert.alert(
      "Randevuyu Sil",
      "Bu randevuyu silmek istediğinizden emin misiniz?",
      [
        { text: "İptal", style: "cancel" },
        {
          text: "Sil",
          style: "destructive",
          onPress: () =>
            firestore()
              .collection("users")
              .doc(auth().currentUser.uid)
              .collection("appointments")
              .doc(appointmentId)
              .delete(),
        },
      ]
    );
  };

  const renderAppointment = ({ item, index }) => {
    const date = item.appointmentDate?.toDate();
    return (
      <Animated.View
        entering={FadeInDown.duration(400).delay(index * 100)}
        style={styles.itemContainer}
      >
        <View style={{ flex: 1 }}>
          {date && (
            <Text style={styles.itemDate}>
              {moment(date).format("DD MMMM YYYY, HH:mm")}
            </Text>
          )}
          <Text style={styles.itemTitle}>{item.title}</Text>
          {item.notes ? (
            <Text style={styles.itemNotes}>{item.notes}</Text>
          ) : null}
        </View>
        <View style={styles.buttonsContainer}>
          <TouchableOpacity
            onPress={() =>
              navigation.navigate("EditAppointment", { appointment: item })
            }
            style={[styles.actionButton, styles.editButton]}
          >
            <Text style={styles.actionButtonText}>Düzenle</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => handleDelete(item.id)}
            style={[styles.actionButton, styles.deleteButton]}
          >
            <Text style={styles.actionButtonText}>Sil</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    );
  };

  if (loading) {
    return <ActivityIndicator size="large" style={styles.loader} />;
  }

  return (
    <Animated.View entering={FadeInUp.duration(500)} style={styles.container}>
      <Button
        title="+ Yeni Randevu Ekle"
        onPress={() => navigation.navigate("AddAppointment")}
      />
      {appointments.length === 0 ? (
        <Text style={styles.emptyText}>Henüz randevunuz bulunmuyor.</Text>
      ) : (
        <FlatList
          data={appointments}
          renderItem={renderAppointment}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingTop: 20, paddingBottom: 30 }}
        />
      )}
    </Animated.View>
  );
};

export default AppointmentsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    marginTop: 30,
    paddingHorizontal: 10,
  },
  loader: { flex: 1, justifyContent: "center" },
  itemContainer: {
    backgroundColor: "white",
    padding: 15,
    borderRadius: 8,
    marginBottom: 12,
    elevation: 3,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  itemDate: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#2980b9",
    marginBottom: 4,
  },
  itemTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#34495e",
  },
  itemNotes: {
    fontSize: 14,
    color: "#7f8c8d",
    marginTop: 6,
  },
  emptyText: {
    textAlign: "center",
    marginTop: 50,
    fontSize: 16,
    color: "#7f8c8d",
  },
  buttonsContainer: {
    flexDirection: "row",
    marginLeft: 10,
  },
  actionButton: {
    marginLeft: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 5,
  },
  editButton: { backgroundColor: "#3498db" },
  deleteButton: { backgroundColor: "#e74c3c" },
  actionButtonText: { color: "white", fontWeight: "bold" },
});
