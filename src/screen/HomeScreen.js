import React, { useRef, useEffect, useState } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Animated,
  Easing,
  SafeAreaView,
  Dimensions,
  StatusBar,
  Image,
} from "react-native";
import { useSelector, useDispatch } from "react-redux";
import Octicons from "react-native-vector-icons/Octicons";
import { toggleTheme } from "../store/themeSlice";
import { Calendar } from "react-native-calendars";
import { listenAppointments } from "../services/appointmentService";
import auth from "@react-native-firebase/auth";

const { width, height } = Dimensions.get("window");

const HomeScreen = () => {
  const { theme, mode } = useSelector((state) => state.theme);
  const dispatch = useDispatch();

  const [markedDates, setMarkedDates] = useState({}); // randevular için

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const spinAnim = useRef(new Animated.Value(0)).current;
  const scrollAnim = useRef(new Animated.Value(0)).current;

  // 🔹 Firebase’den randevuları dinle
  useEffect(() => {
    const userId = auth().currentUser?.uid;
    if (!userId) return;

    const unsubscribe = listenAppointments(userId, (appointments) => {
      const marks = {};
      appointments.forEach((item) => {
        const date = item.appointmentDate.toDate();
        const dateStr = date.toISOString().split("T")[0];
        marks[dateStr] = {
          marked: true,
          dotColor: "white",
          selected: true,
          selectedColor: "blue",
        };
      });
      setMarkedDates(marks);
    });

    return () => unsubscribe();
  }, []);

  // 🔹 Fade animasyonu
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      easing: Easing.out(Easing.exp),
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  // 🔹 Arka plan scroll animasyonu
  useEffect(() => {
    Animated.loop(
      Animated.timing(scrollAnim, {
        toValue: -height,
        duration: 30000,
        useNativeDriver: true,
        easing: Easing.linear,
      })
    ).start();
  }, [scrollAnim]);

  // 🔹 Spin animasyonu (sürekli)
  useEffect(() => {
    Animated.loop(
      Animated.timing(spinAnim, {
        toValue: 1,
        duration: 1000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  const spin = spinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  const onToggleTheme = () => {
    dispatch(toggleTheme());
  };

  const calendarThemeStyle = {
    backgroundColor: "transparent",
    calendarBackground: "transparent",
    textSectionTitleColor: theme.color,
    dayTextColor: theme.color,
    todayTextColor: "#FF5722",
    arrowColor: theme.color,
    monthTextColor: theme.color,
    textDisabledColor: theme.color + "80",
  };

  const dynamicStyles = {
    calendarWrapper: {
      backgroundColor:
        mode === "dark" ? "rgba(24, 25, 26, 0.7)" : "rgba(255, 255, 255, 0.7)",
      borderColor: theme.calendarBorder,
    },
    button: {
      backgroundColor: theme.buttonBg,
      borderColor: mode === "dark" ? "#555" : "#ddd",
    },
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.backgroundColor }]}
    >
      <StatusBar
        barStyle={mode === "dark" ? "light-content" : "dark-content"}
      />

      <Animated.View
        style={[
          styles.backgroundContainer,
          { transform: [{ translateY: scrollAnim }] },
        ]}
      >
        <Image
          source={require("../../assets/backgroundhome.jpg")}
          style={styles.background}
          resizeMode="cover"
        />
      </Animated.View>

      <View style={styles.contentContainer}>
        <Animated.View style={[styles.header, { opacity: fadeAnim }]}>
          <Text style={[styles.title, { color: theme.color }]}>
            Randevu ve Dosya Yükleme
          </Text>
          <Text style={[styles.subtitle, { color: theme.color }]}>
            Hoş geldiniz!
          </Text>
        </Animated.View>

        <Animated.View
          style={[
            styles.calendarWrapper,
            dynamicStyles.calendarWrapper,
            { opacity: fadeAnim },
          ]}
        >
          <Calendar theme={calendarThemeStyle} markedDates={markedDates} />
        </Animated.View>
      </View>

      <Pressable
        onPress={onToggleTheme}
        style={[styles.button, dynamicStyles.button]}
        accessibilityRole="button"
        accessibilityLabel="Temayı değiştir"
        accessibilityHint={`${
          mode === "dark" ? "Açık" : "Karanlık"
        } moda geçirir`}
      >
        <Animated.View
          style={{
            width: 32,
            height: 32,
            justifyContent: "center",
            alignItems: "center",
            transform: [{ rotate: spin }],
          }}
        >
          <Octicons
            name={mode === "dark" ? "moon" : "sun"}
            size={32}
            color={theme.color}
          />
        </Animated.View>
      </Pressable>
    </SafeAreaView>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center" },
  backgroundContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    width,
    height: height * 2,
  },
  background: { width: "100%", height: "100%" },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 20,
    justifyContent: "space-around",
    paddingVertical: "15%",
  },
  header: { alignItems: "center" },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    textAlign: "center",
    textShadowColor: "rgba(0, 0, 0, 0.25)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 4,
  },
  subtitle: { fontSize: 18, opacity: 0.9, marginTop: 8 },
  calendarWrapper: { borderRadius: 16, padding: 10, borderWidth: 1 },
  button: {
    position: "absolute",
    bottom: 40,
    right: 30,
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: "center",
    alignItems: "center",
    elevation: 8,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
});
