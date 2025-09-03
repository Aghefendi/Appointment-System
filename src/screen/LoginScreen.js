import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
} from "react-native";
import React, { useState } from "react";
import auth from "@react-native-firebase/auth";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";
import imgTop from "../../assets/background.png";
import imgLight from "../../assets/light.png"; 
import { styles } from "./styles/LoginStyle";

const LoginScreen = ({ navigation }) => {
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");

  const handleLogin = (email, password) => {
    if (!email || !password) {
      Alert.alert("Lütfen tüm alanları doldurun");
      return;
    }

    auth()
      .signInWithEmailAndPassword(email, password)
      .then(() => {
        Alert.alert("Giriş Başarılı");
        console.log("Kullanıcı Giriş Yaptı");
      })
      .catch((err) => {
        console.error(err);
        Alert.alert("Giriş Hatası", "E-posta veya şifre hatalı.");
      });
  };

  return (
    <View style={styles.container}>
      {/* Arka Plan ve Işık Efektleri */}
      <Image source={imgTop} style={styles.imageBG} />
      <View style={styles.contentTop}>
        <Animated.Image
          entering={FadeInUp.delay(200).duration(1000).springify().damping(5)}
          source={imgLight}
          style={styles.imgLight1}
        />
        <Animated.Image
          entering={FadeInUp.delay(400).duration(1000).springify().damping(5)}
          source={imgLight}
          style={styles.imgLight2}
        />
      </View>

      {/* Giriş Alanı */}
      <View style={styles.main}>
        <View style={styles.login}>
          <Animated.Text
            entering={FadeInUp.duration(1000).springify()}
            style={styles.loginText}
          >
            Login
          </Animated.Text>
        </View>

        <View style={styles.form}>
          <Animated.View
            entering={FadeInDown.duration(1000).springify()}
            style={styles.formInputArea}
          >
            <TextInput
              placeholder="E-mail"
              placeholderTextColor={"gray"}
              value={user}
              onChangeText={setUser}
              style={styles.input}
            />
          </Animated.View>

          <Animated.View
            entering={FadeInDown.delay(200).duration(1000).springify()}
            style={styles.formInputArea}
          >
            <TextInput
              placeholder="Şifre"
              placeholderTextColor={"gray"}
              secureTextEntry
              value={pass}
              onChangeText={setPass}
              style={styles.input}
            />
          </Animated.View>

          <Animated.View
            entering={FadeInDown.delay(400).duration(1000).springify()}
            style={styles.formButtonArea}
          >
            <TouchableOpacity
              style={styles.formButton}
              onPress={() => handleLogin(user, pass)}
            >
              <Text style={styles.formButtonText}>Giriş Yap</Text>
            </TouchableOpacity>
          </Animated.View>

          <Animated.View
            entering={FadeInDown.delay(600).duration(1000).springify()}
            style={styles.formFooter}
          >
            <Text>Hesabın yok mu?</Text>
            <TouchableOpacity onPress={() => navigation.navigate("Register")}>
              <Text style={styles.formFooterSingup}>Kayıt Ol</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </View>
    </View>
  );
};

export default LoginScreen;
