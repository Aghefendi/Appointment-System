import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Button,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from "react-native";
import auth from "@react-native-firebase/auth";
import firestore from "@react-native-firebase/firestore";
import { useSelector } from "react-redux";
import Animated, {
  FadeInDown,
  FadeInUp,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";

const ProfileScreen = () => {
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);
  const theme = useSelector((state) => state.theme.theme);
  const styles = createStyles(theme);

  
  const scale = useSharedValue(1);
  const animatedBtnStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const onPressIn = () => {
    scale.value = withSpring(0.9, { stiffness: 200, damping: 10 });
  };
  const onPressOut = () => {
    scale.value = withSpring(1, { stiffness: 200, damping: 10 });
  };

  useEffect(() => {
    const user = auth().currentUser;
    if (!user) {
      setLoading(false);
      return;
    }
    const sub = firestore()
      .collection("users")
      .doc(user.uid)
      .onSnapshot(
        (snap) => {
          setUserData(snap.exists ? snap.data() : null);
          setLoading(false);
        },
        (err) => {
          console.error(err);
          Alert.alert("Hata", "Kullanıcı verisi alınırken hata oluştu.");
          setLoading(false);
        }
      );
    return () => sub();
  }, []);

  const handleLogout = () => {
    auth()
      .signOut()
      .then(() => console.log("Çıkış yapıldı"))
      .catch(() => Alert.alert("Hata", "Çıkış yaparken sorun oluştu."));
  };

  if (loading) {
    return (
      <ActivityIndicator
        size="large"
        color={theme.primary || "#0000ff"}
        style={{ flex: 1, justifyContent: "center" }}
      />
    );
  }

  return (
    <Animated.View entering={FadeInUp.duration(500)} style={styles.container}>
      <Animated.Text
        entering={FadeInDown.delay(100).duration(400)}
        style={styles.title}
      >
        Profilim
      </Animated.Text>

      {userData ? (
        <Animated.View
          entering={FadeInDown.delay(200).duration(400)}
          style={styles.infoContainer}
        >
          <Text style={styles.label}>E-posta Adresiniz:</Text>
          <Text style={styles.info}>{userData.email}</Text>

          <Text style={styles.label}>Ad Soyad:</Text>
          <Text style={styles.info}>
            {userData.fullName || "Henüz belirtilmemiş"}
          </Text>
        </Animated.View>
      ) : (
        <Text style={styles.errorText}>Kullanıcı bilgileri yüklenemedi.</Text>
      )}

      <Animated.View style={[styles.logoutWrapper, animatedBtnStyle]}>
        <Button
          title="Çıkış Yap"
          onPress={handleLogout}
          color={theme.error || "#e74c3c"}
          onPressIn={onPressIn}
          onPressOut={onPressOut}
        />
      </Animated.View>
    </Animated.View>
  );
};

export default ProfileScreen;

const createStyles = (theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      padding: 20,
      backgroundColor: theme.backgroundColor,
      alignItems: "center",
      justifyContent: "center",
    },
    title: {
      fontSize: 26,
      fontWeight: "700",
      marginBottom: 20,
      color: theme.color,
    },
    infoContainer: {
      width: "100%",
      padding: 20,
      backgroundColor: theme.cardBackground || "#fff",
      borderRadius: 12,
      marginBottom: 30,
      shadowColor: theme.shadowColor || "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 6,
      elevation: 4,
    },
    label: {
      fontSize: 14,
      color: theme.subtleText || "#666",
      marginTop: 10,
    },
    info: {
      fontSize: 18,
      fontWeight: "500",
      color: theme.color,
      marginTop: 4,
    },
    errorText: {
      fontSize: 16,
      color: theme.error || "#e74c3c",
      marginBottom: 30,
    },
    logoutWrapper: {
      width: "60%",
      borderRadius: 8,
      overflow: "hidden",
    },
  });
