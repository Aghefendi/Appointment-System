import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Alert,
  TouchableWithoutFeedback,
} from "react-native";
import firestore from "@react-native-firebase/firestore";
import auth from "@react-native-firebase/auth";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import moment from "moment";
import "moment/locale/tr";
import Animated, {
  FadeInUp,
  FadeInDown,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";

const AddAppointmentScreen = ({ navigation }) => {
  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [appointmentDate, setAppointmentDate] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);

  moment.locale("tr");

  // Buton için scale animasyonu
  const btnScale = useSharedValue(1);
  const btnStyle = useAnimatedStyle(() => ({
    transform: [{ scale: btnScale.value }],
  }));

  const onPressIn = () => {
    btnScale.value = withSpring(0.9, { stiffness: 200, damping: 10 });
  };
  const onPressOut = () => {
    btnScale.value = withSpring(1, { stiffness: 200, damping: 10 });
  };

  const showDatePicker = () => setDatePickerVisibility(true);
  const hideDatePicker = () => setDatePickerVisibility(false);
  const handleConfirm = (date) => {
    setAppointmentDate(date);
    hideDatePicker();
  };

  const handleSaveAppointment = async () => {
    if (!title || !appointmentDate) {
      Alert.alert("Hata", "Lütfen başlık ve tarih giriniz.");
      return;
    }
    const user = auth().currentUser;
    if (!user) {
      Alert.alert("Hata", "Oturum bulunamadı.");
      return;
    }
    setLoading(true);
    try {
      await firestore()
        .collection("users")
        .doc(user.uid)
        .collection("appointments")
        .add({
          title,
          notes,
          appointmentDate: firestore.Timestamp.fromDate(appointmentDate),
          createdAt: firestore.FieldValue.serverTimestamp(),
          isCompleted: false,
        });
      Alert.alert("Başarılı", "Randevunuz kaydedildi.");
      navigation.goBack();
    } catch (err) {
      console.error(err);
      Alert.alert("Hata", "Kaydederken sorun oluştu.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Animated.View entering={FadeInUp.duration(500)} style={styles.container}>
      <Animated.View entering={FadeInDown.delay(100).duration(300)}>
        <Text style={styles.label}>Randevu Başlığı</Text>
        <TextInput
          style={styles.input}
          value={title}
          onChangeText={setTitle}
          placeholder="Örn: Diş Hekimi Kontrolü"
        />
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(200).duration(300)}>
        <Text style={styles.label}>Notlar</Text>
        <TextInput
          style={[styles.input, { height: 100 }]}
          value={notes}
          onChangeText={setNotes}
          placeholder="Detaylar"
          multiline
        />
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(300).duration(300)}>
        <Text style={styles.label}>Randevu Tarihi</Text>
        <TouchableWithoutFeedback onPress={showDatePicker}>
          <View style={styles.datePickerButton}>
            <Text style={styles.datePickerText}>
              {appointmentDate
                ? moment(appointmentDate).format("LLL")
                : "Tarih seçiniz"}
            </Text>
          </View>
        </TouchableWithoutFeedback>
        <DateTimePickerModal
          isVisible={isDatePickerVisible}
          mode="datetime"
          onConfirm={handleConfirm}
          onCancel={hideDatePicker}
          minimumDate={new Date()}
        />
      </Animated.View>

      <Animated.View
        entering={FadeInDown.delay(400).duration(300)}
        style={[styles.buttonWrapper, btnStyle]}
      >
        <TouchableWithoutFeedback
          onPressIn={onPressIn}
          onPressOut={onPressOut}
          onPress={handleSaveAppointment}
          disabled={loading}
        >
          <View style={styles.saveButton}>
            <Text style={styles.saveButtonText}>
              {loading ? "Kaydediliyor..." : "Randevuyu Kaydet"}
            </Text>
          </View>
        </TouchableWithoutFeedback>
      </Animated.View>
    </Animated.View>
  );
};

export default AddAppointmentScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
  },
  label: {
    fontSize: 16,
    marginBottom: 6,
    fontWeight: "500",
    color: "#333",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 12,
    marginBottom: 20,
    borderRadius: 6,
    fontSize: 16,
    backgroundColor: "#fafafa",
  },
  datePickerButton: {
    padding: 14,
    backgroundColor: "#f0f0f0",
    borderRadius: 6,
    marginBottom: 20,
  },
  datePickerText: {
    fontSize: 16,
    color: "#444",
  },
  buttonWrapper: {
    alignItems: "center",
    marginTop: 10,
  },
  saveButton: {
    backgroundColor: "#2980b9",
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 8,
    elevation: 3,
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
