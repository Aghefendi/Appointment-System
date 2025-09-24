import { useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import auth from "@react-native-firebase/auth";
import moment from "moment";
import "moment/locale/tr";
import Animated, {
  FadeInUp,
  FadeInDown,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";
import { useSelector } from "react-redux";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import CustomAlert from "../component/CustomAlert";
import { addAppointment } from "../services/appointmentService";
import DatePicker from "react-native-date-picker";

const AddAppointmentScreen = ({ navigation }) => {
  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [appointmentDate, setAppointmentDate] = useState(null);
  const [loading, setLoading] = useState(false);
  const theme = useSelector((state) => state.theme.theme);
  const [alertInfo, setAlertInfo] = useState({
    title: "",
    message: "",
    type: "info",
  });
  const [alertVisible, setAlertVisible] = useState(false);

  // DatePicker için state
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState(new Date());

  moment.locale("tr");

  const btnScale = useSharedValue(1);
  const btnStyle = useAnimatedStyle(() => ({
    transform: [{ scale: btnScale.value }],
  }));

  const onPressIn = () => {
    btnScale.value = withSpring(0.95, { stiffness: 200, damping: 15 });
  };
  const onPressOut = () => {
    btnScale.value = withSpring(1, { stiffness: 200, damping: 15 });
  };

  const handleSaveAppointment = async () => {
    if (!title.trim() || !appointmentDate) {
      setAlertInfo({
        title: "Hata",
        message:
          "Eksik Bilgi, Lütfen randevu başlığı ve tarihi alanlarını doldurun.",
        type: "error",
      });
      setAlertVisible(true);
      return;
    }
    const user = auth().currentUser;
    if (!user) {
      setAlertInfo({
        title: "Hata",
        message: "Geçerli bir kullanıcı oturumu bulunamadı",
        type: "error",
      });
      setAlertVisible(true);
      return;
    }

    setLoading(true);
    try {
      const appointmentData = {
        title: title,
        notes: notes,
        appointmentDate: appointmentDate,
      };
      await addAppointment(user.uid, appointmentData);

      setAlertInfo({
        title: "Başarılı",
        message: "Randevunuz başarıyla oluşturuldu.",
        type: "success",
      });
      setAlertVisible(true);
      navigation.goBack();
    } catch (err) {
      console.error("Randevu kaydetme hatası:", err);
      setAlertInfo({
        title: "Hata",
        message: err.message || "Randevu kaydedilirken bir sorun oluştu.",
        type: "error",
      });
      setAlertVisible(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: theme.backgroundColor }]}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <Animated.View
          entering={FadeInDown.duration(400)}
          style={styles.header}
        >
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Icon name="arrow-left" size={24} color={theme.primary} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.color }]}>
            Yeni Randevu
          </Text>
          <View style={{ width: 40 }} />
        </Animated.View>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          <Animated.View entering={FadeInUp.duration(500).delay(100)}>
            <Text style={[styles.label, { color: theme.subtleText }]}>
              Başlık
            </Text>
            <View
              style={[
                styles.inputContainer,
                {
                  backgroundColor: theme.cardBackground,
                  shadowColor: theme.shadowColor,
                },
              ]}
            >
              <Icon
                name="format-title"
                size={22}
                color={theme.subtleText}
                style={styles.inputIcon}
              />
              <TextInput
                style={[styles.input, { color: theme.color }]}
                value={title}
                onChangeText={setTitle}
                placeholder="Örn: Proje Sunumu"
                placeholderTextColor={theme.subtleText}
              />
            </View>
          </Animated.View>

          <Animated.View entering={FadeInUp.duration(500).delay(200)}>
            <Text style={[styles.label, { color: theme.subtleText }]}>
              Notlar (İsteğe Bağlı)
            </Text>
            <View
              style={[
                styles.inputContainer,
                {
                  backgroundColor: theme.cardBackground,
                  shadowColor: theme.shadowColor,
                  height: 120,
                  alignItems: "flex-start",
                },
              ]}
            >
              <Icon
                name="note-text-outline"
                size={22}
                color={theme.subtleText}
                style={[styles.inputIcon, { marginTop: 14 }]}
              />
              <TextInput
                style={[
                  styles.input,
                  { color: theme.color, height: 100, textAlignVertical: "top" },
                ]}
                value={notes}
                onChangeText={setNotes}
                placeholder="Randevu ile ilgili detaylar..."
                placeholderTextColor={theme.subtleText}
                multiline
              />
            </View>
          </Animated.View>

          <Animated.View entering={FadeInUp.duration(500).delay(300)}>
            <Text style={[styles.label, { color: theme.subtleText }]}>
              Tarih ve Saat
            </Text>
            <TouchableOpacity activeOpacity={0.7} onPress={() => setOpen(true)}>
              <View
                style={[
                  styles.inputContainer,
                  {
                    backgroundColor: theme.cardBackground,
                    shadowColor: theme.shadowColor,
                  },
                ]}
              >
                <Icon
                  name="calendar-clock"
                  size={22}
                  color={theme.subtleText}
                  style={styles.inputIcon}
                />
                <View style={styles.dateTextView}>
                  {appointmentDate ? (
                    <>
                      <Text style={[styles.dateText, { color: theme.primary }]}>
                        {moment(appointmentDate).format("DD MMMM YYYY, dddd")}
                      </Text>
                      <Text style={[styles.timeText, { color: theme.color }]}>
                        {moment(appointmentDate).format("HH:mm")}
                      </Text>
                    </>
                  ) : (
                    <Text
                      style={[
                        styles.datePlaceholder,
                        { color: theme.subtleText },
                      ]}
                    >
                      Tarih ve saat seçin
                    </Text>
                  )}
                </View>
              </View>
            </TouchableOpacity>
          </Animated.View>
        </ScrollView>

        <Animated.View
          style={[styles.buttonContainer, btnStyle]}
          entering={FadeInDown.duration(500).delay(400)}
        >
          <TouchableOpacity
            onPressIn={onPressIn}
            onPressOut={onPressOut}
            onPress={handleSaveAppointment}
            disabled={loading}
            activeOpacity={0.8}
            style={[styles.saveButton, { backgroundColor: theme.primary }]}
          >
            {loading ? (
              <ActivityIndicator color={theme.buttonText} />
            ) : (
              <>
                <Icon
                  name="check-circle-outline"
                  size={22}
                  color={theme.buttonText}
                />
                <Text
                  style={[styles.saveButtonText, { color: theme.buttonText }]}
                >
                  Randevuyu Kaydet
                </Text>
              </>
            )}
          </TouchableOpacity>
        </Animated.View>

        {/* DatePicker Modal */}
        <DatePicker
          modal
          open={open}
          date={date}
          mode="datetime"
          locale="tr"
          minimumDate={new Date()}
          title="Randevu Tarihi Seç"
          confirmText="Onayla"
          cancelText="Vazgeç"
          onConfirm={(d) => {
            setOpen(false);
            setDate(d);
            setAppointmentDate(d);
          }}
          onCancel={() => setOpen(false)}
        />

        <CustomAlert
          visible={alertVisible}
          onClose={() => setAlertVisible(false)}
          title={alertInfo.title}
          message={alertInfo.message}
          type={alertInfo.type}
          buttons={[{ text: "Tamam" }]}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default AddAppointmentScreen;

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 10,
    paddingVertical: 15,
  },
  backButton: {
    padding: 10,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "bold",
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 120,
  },
  label: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 8,
    marginLeft: 5,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 16,
    marginBottom: 25,
    paddingHorizontal: 15,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 5,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 16,
  },
  dateTextView: {
    flex: 1,
    paddingVertical: 16,
  },
  datePlaceholder: {
    fontSize: 16,
  },
  dateText: {
    fontSize: 16,
    fontWeight: "600",
  },
  timeText: {
    fontSize: 15,
    marginTop: 2,
  },
  buttonContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    paddingBottom: Platform.OS === "ios" ? 30 : 20,
  },
  saveButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 18,
    borderRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
  },
  saveButtonText: {
    fontSize: 18,
    fontWeight: "bold",
    marginLeft: 10,
  },
});
