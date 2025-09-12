import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Platform,
  Linking,
} from "react-native";
import auth from "@react-native-firebase/auth";
import messaging from "@react-native-firebase/messaging";
import { NavigationContainer } from "@react-navigation/native";
import AppStack from "./src/navigation/AppStack";
import AuthStack from "./src/navigation/AuthStack";
import { Provider } from "react-redux";
import store from "./src/store/store";
import {
  checkMultiple,
  requestMultiple,
  PERMISSIONS,
  RESULTS,
} from "react-native-permissions";

export default function App() {
  const [initializing, setInitializing] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    let unsubscribeAuth = null;
    let unsubscribeOnMessage = null;

    const requestAndroidPermissions = async () => {
      const perms = [PERMISSIONS.ANDROID.CAMERA];

      if (Platform.Version >= 33) {
        perms.push(PERMISSIONS.ANDROID.POST_NOTIFICATIONS);
        perms.push(PERMISSIONS.ANDROID.READ_MEDIA_IMAGES);
      } else {
        perms.push(PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE);
      }

      try {
        const preStatuses = await checkMultiple(perms);
        const toRequest = perms.filter(
          (p) => preStatuses[p] !== RESULTS.GRANTED
        );

        let statuses;
        if (toRequest.length > 0) {
          statuses = await requestMultiple(toRequest);
          statuses = { ...preStatuses, ...statuses };
        } else {
          statuses = preStatuses;
        }

        const notifGranted =
          (Platform.Version >= 33 &&
            statuses[PERMISSIONS.ANDROID.POST_NOTIFICATIONS] ===
              RESULTS.GRANTED) ||
          Platform.Version < 33;

        const cameraOk =
          statuses[PERMISSIONS.ANDROID.CAMERA] === RESULTS.GRANTED;
        const galleryOk =
          (Platform.Version >= 33 &&
            statuses[PERMISSIONS.ANDROID.READ_MEDIA_IMAGES] ===
              RESULTS.GRANTED) ||
          (Platform.Version < 33 &&
            statuses[PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE] ===
              RESULTS.GRANTED);

        console.log("Camera permission:", cameraOk);
        console.log("Gallery permission:", galleryOk);

        return { notifGranted, cameraOk, galleryOk };
      } catch (err) {
        console.warn("requestAndroidPermissions hata:", err);
        return { notifGranted: false, cameraOk: false, galleryOk: false };
      }
    };

    const requestNotificationPermission = async () => {
      if (Platform.OS === "android") {
        return await requestAndroidPermissions();
      } else if (Platform.OS === "ios") {
        const authStatus = await messaging().requestPermission();
        const granted =
          authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
          authStatus === messaging.AuthorizationStatus.PROVISIONAL;

        if (!granted) {
          Alert.alert(
            "Bildirim izni gerekli",
            "Randevu hatırlatmaları için bildirim izni vermelisiniz.",
            [
              { text: "Ayarlar", onPress: () => Linking.openSettings() },
              { text: "İptal", style: "cancel" },
            ]
          );
        }

        console.log("iOS Notification Permission:", granted);
        return { notifGranted: granted };
      }
      return { notifGranted: true };
    };

    const setupFCM = async () => {
      try {
        const permissionInfo = await requestNotificationPermission();

        console.log("Permission info:", permissionInfo);

        if (permissionInfo.notifGranted) {
          try {
            const token = await messaging().getToken();
            if (!token) {
              console.warn("⚠️ FCM Token boş geldi!");
            } else {
              console.log("📲 FCM Token:", token);
            }
          } catch (tokenErr) {
            console.warn("FCM token alınamadı:", tokenErr);
          }
        }

        unsubscribeOnMessage = messaging().onMessage(async (remoteMessage) => {
          const title = remoteMessage?.notification?.title ?? "Yeni Bildirim";
          const body = remoteMessage?.notification?.body ?? "";
          Alert.alert(title, body);
        });
      } catch (err) {
        console.warn("setupFCM hata:", err);
      }
    };

    setupFCM();

    unsubscribeAuth = auth().onAuthStateChanged((usr) => {
      setUser(usr);
      if (initializing) setInitializing(false);
    });

    return () => {
      if (unsubscribeAuth) unsubscribeAuth();
      if (typeof unsubscribeOnMessage === "function") unsubscribeOnMessage();
    };
  }, []);

  if (initializing) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <Provider store={store}>
      <NavigationContainer>
        {user ? <AppStack /> : <AuthStack />}
      </NavigationContainer>
    </Provider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
  },
});
