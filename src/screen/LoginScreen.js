import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Image,
  Platform,
} from "react-native";
import { useState, useEffect } from "react";
import auth from "@react-native-firebase/auth";
import Animated, {
  FadeInDown,
  FadeInUp,
  FadeOutUp,
} from "react-native-reanimated";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import imgTop from "../../assets/background.png";
import imgLight from "../../assets/light.png";
import { styles as originalStyles } from "./styles/LoginStyle";

const LoginScreen = ({ navigation }) => {
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");
  const [notification, setNotification] = useState({
    visible: false,
    message: "",
    type: "",
  });

  const showNotification = (message, type = "error") => {
    setNotification({ visible: true, message, type });
  };

  useEffect(() => {
    if (notification.visible) {
      const timer = setTimeout(() => {
        setNotification((prev) => ({ ...prev, visible: false }));
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [notification.visible]);

  const handleLogin = (email, password) => {
    if (!email || !password) {
      showNotification("Lütfen tüm alanları doldurun", "error");
      return;
    }

    auth()
      .signInWithEmailAndPassword(email, password)
      .then(() => {
        console.log("Kullanıcı Giriş Yaptı");
      })
      .catch((err) => {
        console.error(err);
        showNotification("E-posta veya şifre hatalı.", "error");
      });
  };

  return (
    <View style={originalStyles.container}>
      {notification.visible && (
        <Animated.View
          entering={FadeInUp.duration(500)}
          exiting={FadeOutUp.duration(500)}
          style={[
            styles.notificationContainer,
            notification.type === "success"
              ? styles.notificationSuccess
              : styles.notificationError,
          ]}
        >
          <Icon
            name={
              notification.type === "success"
                ? "check-circle-outline"
                : "alert-circle-outline"
            }
            size={24}
            color="#fff"
          />
          <Text style={styles.notificationText}>{notification.message}</Text>
        </Animated.View>
      )}

      <Image source={imgTop} style={originalStyles.imageBG} />
      <View style={originalStyles.contentTop}>
        <Animated.Image
          entering={FadeInUp.delay(200).duration(1000).springify().damping(5)}
          source={imgLight}
          style={originalStyles.imgLight1}
        />
        <Animated.Image
          entering={FadeInUp.delay(400).duration(1000).springify().damping(5)}
          source={imgLight}
          style={originalStyles.imgLight2}
        />
      </View>

      <View style={originalStyles.main}>
        <View style={originalStyles.login}>
          <Animated.Text
            entering={FadeInUp.duration(1000).springify()}
            style={originalStyles.loginText}
          >
            Giriş Yap
          </Animated.Text>
        </View>

        <View style={originalStyles.form}>
          <Animated.View
            entering={FadeInDown.duration(1000).springify()}
            style={originalStyles.formInputArea}
          >
            <TextInput
              placeholder="E-posta"
              placeholderTextColor={"gray"}
              value={user}
              onChangeText={setUser}
              style={originalStyles.input}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </Animated.View>

          <Animated.View
            entering={FadeInDown.delay(200).duration(1000).springify()}
            style={originalStyles.formInputArea}
          >
            <TextInput
              placeholder="Şifre"
              placeholderTextColor={"gray"}
              secureTextEntry
              value={pass}
              onChangeText={setPass}
              style={originalStyles.input}
            />
          </Animated.View>

          <Animated.View
            entering={FadeInDown.delay(400).duration(1000).springify()}
            style={originalStyles.formButtonArea}
          >
            <TouchableOpacity
              style={originalStyles.formButton}
              onPress={() => handleLogin(user, pass)}
            >
              <Text style={originalStyles.formButtonText}>Giriş Yap</Text>
            </TouchableOpacity>
          </Animated.View>

          <Animated.View
            entering={FadeInDown.delay(600).duration(1000).springify()}
            style={originalStyles.formFooter}
          >
            <Text>Hesabın yok mu?</Text>
            <TouchableOpacity onPress={() => navigation.navigate("Register")}>
              <Text style={originalStyles.formFooterSingup}>Kayıt Ol</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  notificationContainer: {
    position: "absolute",
    top: Platform.OS === "ios" ? 50 : 20,
    left: 20,
    right: 20,
    borderRadius: 16,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 10,
    zIndex: 999,
  },
  notificationSuccess: {
    backgroundColor: "#2ECC71",
  },
  notificationError: {
    backgroundColor: "#E74C3C",
  },
  notificationText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 10,
    flex: 1,
  },
});

export default LoginScreen;
