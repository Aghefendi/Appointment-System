import React, { useEffect } from "react";
import {
  View,
  Text,
  SafeAreaView,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import auth from "@react-native-firebase/auth";
import firestore from "@react-native-firebase/firestore";
import { useSelector, useDispatch } from "react-redux";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  FadeInDown,
  FadeInUp,
  FadeIn,
} from "react-native-reanimated";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import LinearGradient from "react-native-linear-gradient";
import {
  setLoading,
  setUserData,
  setAppointmentCount,
  setDocumentCount,
} from "../store/profileSlice";

const { width, height } = Dimensions.get("window");

const processFirestoreData = (data) => {
  if (!data) return null;
  const processedData = { ...data };
  for (const key in processedData) {
    if (processedData[key] && typeof processedData[key].toDate === "function") {
      processedData[key] = processedData[key].toDate().toISOString();
    }
  }
  return processedData;
};

const ProfileScreen = () => {
  const theme = useSelector((state) => state.theme.theme);
  const dispatch = useDispatch();
  const { loading, userData, appointmentCount, documentCount } = useSelector(
    (state) => state.profile
  );

  const scale = useSharedValue(1);
  const animatedBtnStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const onPressIn = () => {
    scale.value = withSpring(0.96, { stiffness: 220, damping: 12 });
  };
  const onPressOut = () => {
    scale.value = withSpring(1, { stiffness: 220, damping: 12 });
  };

  useEffect(() => {
    const user = auth().currentUser;
    if (!user) return;

    const userDocRef = firestore().collection("users").doc(user.uid);
    const appointmentsColRef = userDocRef.collection("appointments");
    const documentsColRef = userDocRef.collection("documents");

    const unsubscribeUser = userDocRef.onSnapshot((snap) => {
      if (snap.exists) {
        const rawData = snap.data();
        dispatch(setUserData(processFirestoreData(rawData)));
      } else {
        dispatch(setUserData(null));
      }
      dispatch(setLoading(false));
    });

    const unsubscribeAppointments = appointmentsColRef.onSnapshot((snap) => {
      dispatch(setAppointmentCount(snap.size));
    });

    const unsubscribeDocuments = documentsColRef.onSnapshot((snap) => {
      dispatch(setDocumentCount(snap.size));
    });

    return () => {
      unsubscribeUser();
      unsubscribeAppointments();
      unsubscribeDocuments();
    };
  }, [dispatch]);

  const handleLogout = () => {
    auth()
      .signOut()
      .catch((e) => console.error("Çıkış yaparken hata oluştu:", e));
  };

  if (loading) {
    return (
      <SafeAreaView
        style={[
          styles.safe,
          { backgroundColor: theme?.backgroundColor || "#f8f9fa" },
        ]}
      >
        <ActivityIndicator size="large" color={theme?.primary || "#007AFF"} />
      </SafeAreaView>
    );
  }

  const initials = userData?.fullName
    ? userData.fullName
        .split(" ")
        .map((s) => s[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : null;

  return (
    <SafeAreaView
      style={[
        styles.safe,
        { backgroundColor: theme?.backgroundColor || "#f8f9fa" },
      ]}
    >
      <Animated.View
        entering={FadeIn.duration(600)}
        style={[
          styles.headerBackground,
          { backgroundColor: theme?.primary || "#007AFF" },
        ]}
      />

      <Animated.View
        entering={FadeInDown.duration(500).delay(200)}
        style={styles.header}
      >
        <Text style={[styles.title, { color: theme?.buttonText || "#fff" }]}>
          Profilim
        </Text>
      </Animated.View>

      <Animated.View
        entering={FadeInUp.duration(600).delay(400)}
        style={[
          styles.card,
          {
            backgroundColor: theme?.cardBackground || "#fff",
            shadowColor: theme?.shadowColor || "#000",
          },
        ]}
      >
        <View
          style={[
            styles.avatarContainer,
            { backgroundColor: theme?.cardBackground || "#fff" },
          ]}
        >
          {initials ? (
            <LinearGradient
              colors={[`${theme?.primary}E0`, `${theme?.primary}B3`]} // Hafif gradient
              style={styles.avatar}
            >
              <Text style={styles.avatarText}>{initials}</Text>
            </LinearGradient>
          ) : (
            <View
              style={[
                styles.avatar,
                { backgroundColor: theme?.primary || "#007AFF" },
              ]}
            >
              <Icon name="account" size={48} color="#fff" />
            </View>
          )}
        </View>

        <View style={styles.userInfoSection}>
          <Text style={[styles.name, { color: theme?.color || "#000" }]}>
            {userData?.fullName || "İsim Belirtilmemiş"}
          </Text>
          <Text
            style={[styles.subtle, { color: theme?.subtleText || "#6c757d" }]}
          >
            {userData?.role || "Kullanıcı"}
          </Text>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Icon
              name="calendar-check"
              size={24}
              color={theme?.primary || "#007AFF"}
            />
            <Text
              style={[
                styles.statNumber,
                { color: theme?.primary || "#007AFF" },
              ]}
            >
              {appointmentCount}
            </Text>
            <Text
              style={[
                styles.statLabel,
                { color: theme?.subtleText || "#6c757d" },
              ]}
            >
              Randevu
            </Text>
          </View>
          <View style={styles.statSeparator} />
          <View style={styles.statCard}>
            <Icon
              name="file-document-outline"
              size={24}
              color={theme?.primary || "#007AFF"}
            />
            <Text
              style={[
                styles.statNumber,
                { color: theme?.primary || "#007AFF" },
              ]}
            >
              {documentCount}
            </Text>
            <Text
              style={[
                styles.statLabel,
                { color: theme?.subtleText || "#6c757d" },
              ]}
            >
              Dosya
            </Text>
          </View>
        </View>

        <View style={styles.infoSection}>
          <View style={styles.infoRow}>
            <Icon
              name="email-outline"
              size={22}
              color={theme?.primary || "#007AFF"}
              style={styles.infoIcon}
            />
            <View>
              <Text
                style={[
                  styles.infoLabel,
                  { color: theme?.subtleText || "#6c757d" },
                ]}
              >
                E-posta
              </Text>
              <Text
                style={[styles.infoText, { color: theme?.color || "#000" }]}
              >
                {userData?.email}
              </Text>
            </View>
          </View>
          <View style={[styles.infoRow, { marginTop: 18 }]}>
            <Icon
              name="phone-outline"
              size={22}
              color={theme?.primary || "#007AFF"}
              style={styles.infoIcon}
            />
            <View>
              <Text
                style={[
                  styles.infoLabel,
                  { color: theme?.subtleText || "#6c757d" },
                ]}
              >
                Telefon
              </Text>
              <Text
                style={[styles.infoText, { color: theme?.color || "#000" }]}
              >
                {userData?.phone || "Belirtilmemiş"}
              </Text>
            </View>
          </View>
        </View>
      </Animated.View>

      <Animated.View
        entering={FadeInDown.duration(600).delay(600)}
        style={[animatedBtnStyle, styles.logoutButtonContainer]}
      >
        <TouchableOpacity
          onPress={handleLogout}
          onPressIn={onPressIn}
          onPressOut={onPressOut}
          activeOpacity={0.9}
        >
          <LinearGradient
            colors={[`${theme?.primary}E0`, theme?.primary || "#007AFF"]}
            style={[
              styles.logoutInnerContainer,
              { shadowColor: theme?.primary || "#000" },
            ]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Icon
              name="logout"
              size={20}
              color={theme?.buttonText || "#fff"}
              style={{ marginRight: 10 }}
            />
            <Text
              style={[
                styles.logoutText,
                { color: theme?.buttonText || "#fff" },
              ]}
            >
              Çıkış Yap
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
    </SafeAreaView>
  );
};

export default ProfileScreen;

const styles = StyleSheet.create({
  safe: { flex: 1, justifyContent: "center" },
  headerBackground: {
    width: width * 1.5,
    height: height * 0.4,
    position: "absolute",
    top: -height * 0.15,
    left: -(width * 0.25),
    borderBottomLeftRadius: width,
    borderBottomRightRadius: width,
  },
  header: {
    position: "absolute",
    top: 20,
    left: 0,
    right: 0,
    alignItems: "center",
  },
  title: {
    fontSize: 30,
    fontWeight: "bold",
  },
  card: {
    marginHorizontal: 20,
    borderRadius: 24,
    padding: 20,
    shadowOpacity: 0.1,
    shadowRadius: 15,
    shadowOffset: { width: 0, height: 8 },
    elevation: 10,
    alignItems: "center",
  },
  avatarContainer: {
    position: "absolute",
    top: -50,
    padding: 6,
    borderRadius: 999,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 15,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { color: "#fff", fontSize: 36, fontWeight: "bold" },
  userInfoSection: {
    alignItems: "center",
    marginTop: 60,
    marginBottom: 20,
  },
  name: { fontSize: 24, fontWeight: "bold" },
  subtle: { fontSize: 15, marginTop: 4 },
  statsRow: {
    flexDirection: "row",
    width: "100%",
    justifyContent: "space-around",
    paddingVertical: 15,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#eee",
    marginBottom: 20,
  },
  statCard: { alignItems: "center", flex: 1 },
  statSeparator: { width: 1, backgroundColor: "#eee" },
  statNumber: { fontSize: 24, fontWeight: "bold", marginTop: 8 },
  statLabel: { fontSize: 13, marginTop: 4 },
  infoSection: {
    width: "100%",
    paddingHorizontal: 10,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
  },
  infoIcon: {
    marginRight: 15,
  },
  infoLabel: { fontSize: 13, marginBottom: 2 },
  infoText: { fontSize: 16, fontWeight: "600" },
  logoutButtonContainer: {
    alignSelf: "center",
    marginTop: 30,
  },
  logoutInnerContainer: {
    width: width * 0.7,
    paddingVertical: 16,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 8,
  },
  logoutText: { fontSize: 16, fontWeight: "bold" },
});
