import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  Alert,
  TouchableOpacity,
} from "react-native";
import firestore from "@react-native-firebase/firestore";
import auth from "@react-native-firebase/auth";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import moment from "moment";

const AddAppointmentScreen = ({ navigation }) => {
  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [appointmentDate, setAppointmentDate] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);

  const showDatePicker = () => setDatePickerVisibility(true);
  const hideDatePicker = () => setDatePickerVisibility(false);

  const handleConfirm = (date) => {
    setAppointmentDate(date);
    hideDatePicker();
  };

  const handleSaveAppointment = () => {
    if (!title || !appointmentDate) {
      Alert.alert("Hata", "Lütfen randevu başlığı ve tarihi giriniz.");
      return;
    }

    const user = auth().currentUser;
    if (!user) {
      Alert.alert("Hata", "Kullanıcı oturumu bulunamadı.");
      return;
    }

    setLoading(true);

    firestore()
      .collection("users")
      .doc(user.uid)
      .collection("appointments")
      .add({
        title,
        notes,
        appointmentDate: firestore.Timestamp.fromDate(appointmentDate),
        createdAt: firestore.FieldValue.serverTimestamp(),
        isCompleted: false,
      })
      .then(() => {
        setLoading(false);
        Alert.alert("Başarılı", "Randevunuz kaydedildi.");
        navigation.goBack();
      })
      .catch((error) => {
        console.error(error);
        setLoading(false);
        Alert.alert("Hata", "Randevu kaydedilirken bir sorun oluştu.");
      });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Randevu Başlığı</Text>
      <TextInput
        style={styles.input}
        value={title}
        onChangeText={setTitle}
        placeholder="Örn: Diş Hekimi Kontrolü"
      />

      <Text style={styles.label}>Notlar</Text>
      <TextInput
        style={[styles.input, { height: 100 }]}
        value={notes}
        onChangeText={setNotes}
        placeholder="Randevu ile ilgili detaylar"
        multiline
      />

      <Text style={styles.label}>Randevu Tarihi</Text>
      <TouchableOpacity
        onPress={showDatePicker}
        style={styles.datePickerButton}
      >
        <Text style={styles.datePickerText}>
          {appointmentDate
            ? moment(appointmentDate).format("LLL")
            : "Tarih seç"}
        </Text>
      </TouchableOpacity>

      <DateTimePickerModal
        isVisible={isDatePickerVisible}
        mode="datetime"
        onConfirm={handleConfirm}
        onCancel={hideDatePicker}
        minimumDate={new Date()}
      />

      <Button
        title={loading ? "Kaydediliyor..." : "Randevuyu Kaydet"}
        onPress={handleSaveAppointment}
        disabled={loading}
      />
    </View>
  );
};

export default AddAppointmentScreen;

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  label: { fontSize: 16, marginBottom: 5, fontWeight: "500" },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    marginBottom: 20,
    borderRadius: 5,
    fontSize: 16,
  },
  datePickerButton: {
    padding: 12,
    backgroundColor: "#f0f0f0",
    borderRadius: 6,
    marginBottom: 20,
  },
  datePickerText: {
    fontSize: 16,
    color: "#333",
  },
});
