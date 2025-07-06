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
import moment from "moment"; // Tarihi formatlamak için moment'ı burada da import ediyoruz
import "moment/locale/tr"; // Tarihleri Türkçe göstermek için (isteğe bağlı)

const AppointmentsScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(true);
  const [appointments, setAppointments] = useState([]);

  useEffect(() => {
    moment.locale("tr"); // Moment'ı Türkçe'ye ayarla
    const user = auth().currentUser;
    const subscriber = firestore()
      .collection("users")
      .doc(user.uid)
      .collection("appointments")
      .orderBy("appointmentDate", "asc") // Randevuları tarihe göre sıralayalım (en yakın olan en üstte)
      .onSnapshot((querySnapshot) => {
        const appointmentsData = [];
        querySnapshot.forEach((documentSnapshot) => {
          appointmentsData.push({
            ...documentSnapshot.data(),
            id: documentSnapshot.id,
          });
        });

        setAppointments(appointmentsData);
        setLoading(false);
      });

    return () => subscriber();
  }, []);

  const handleDelete = (appointmentId) => {
    // ... Silme fonksiyonu aynı kalabilir ...
    Alert.alert(
      "Randevuyu Sil",
      "Bu randevuyu silmek istediğinizden emin misiniz?",
      [
        { text: "İptal", style: "cancel" },
        {
          text: "Sil",
          onPress: () => {
            const userId = auth().currentUser.uid;
            firestore()
              .collection("users")
              .doc(userId)
              .collection("appointments")
              .doc(appointmentId)
              .delete();
          },
          style: "destructive",
        },
      ]
    );
  };

  // === RENDER FONKSİYONUNU GÜNCELLEYELİM ===
  const renderAppointment = ({ item }) => {
    // Firestore'dan gelen Timestamp objesini JavaScript Date objesine çeviriyoruz.
    const date = item.appointmentDate ? item.appointmentDate.toDate() : null;

    return (
      <View style={styles.itemContainer}>
        <View style={{ flex: 1 }}>
          {/* Tarihi formatlayarak gösteriyoruz */}
          {date && (
            <Text style={styles.itemDate}>
              {moment(date).format("DD MMMM YYYY, HH:mm")}
            </Text>
          )}
          <Text style={styles.itemTitle}>{item.title}</Text>
          <Text style={styles.itemNotes}>{item.notes}</Text>
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
      </View>
    );
  };

  if (loading) {
    return <ActivityIndicator size="large" />;
  }

  return (
    <View style={styles.container}>
      <Button
        title="+ Yeni Randevu Ekle"
        onPress={() => navigation.navigate("AddAppointment")}
      />
      <FlatList
        data={appointments}
        renderItem={renderAppointment}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={
          <Text style={styles.emptyText}>Henüz randevunuz bulunmuyor.</Text>
        }
        contentContainerStyle={{ paddingTop: 20 }}
      />
    </View>
  );
};

export default AppointmentsScreen;

// === STYLESHEET'İ GÜNCELLEYELİM ===
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: "#f5f5f5",
    marginTop: 30,
  },
  itemContainer: {
    backgroundColor: "white",
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    elevation: 3,
  },
  itemDate: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#2980b9",
    marginBottom: 5,
  },
  itemTitle: { fontSize: 18, fontWeight: "bold", color: "#34495e" },
  itemNotes: { fontSize: 14, color: "#7f8c8d", marginTop: 5 },
  emptyText: { textAlign: "center", marginTop: 50, fontSize: 16 },
  buttonsContainer: {
    flexDirection: "row",
    marginTop: 15,
    justifyContent: "flex-end",
  },
  actionButton: {
    marginLeft: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 5,
  },
  editButton: { backgroundColor: "#3498db" },
  deleteButton: { backgroundColor: "#e74c3c" },
  actionButtonText: { color: "white", fontWeight: "bold" },
});
