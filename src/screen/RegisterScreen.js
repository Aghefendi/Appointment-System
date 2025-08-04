import {
  StyleSheet,
  Text,
  View,
  TextInput,
  Alert,
  Image,
  TouchableOpacity,
} from "react-native";
import React, { useState } from "react";
import auth from "@react-native-firebase/auth";
import firestore, { firebase } from "@react-native-firebase/firestore";
import { styles } from "./styles/SingUpStyle";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";
import { useNavigation } from "@react-navigation/native";

import imgTop from "../../assets/background.png";
import imgLight from "../../assets/light.png";

const RegisterScreen = () => {
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [fullName, setFullName] = useState("");
  const navigation = useNavigation();

  const handleRegister = async () => {
    if (!email || !pass) {
      Alert.alert("Hata", "Lütfen e-posta ve şifre girin.");
      return;
    }

    if (pass.length < 6) {
      Alert.alert("Hata", "Şifre en az 6 karakter olmalıdır.");
      return;
    }

    try {
      const userCredentials = await auth().createUserWithEmailAndPassword(
        email,
        pass
      );
      const user = userCredentials.user;

      await firestore()
        .collection("users")
        .doc(user.uid)
        .set({
          email: user.email,
          fullName: fullName || "Bilinmiyor",
          createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        });

      Alert.alert("Başarılı", "Kayıt tamamlandı!");
    } catch (error) {
      console.error("Kayıt/Firestore hatası:", error);
      Alert.alert("Hata", error.message);
    }
  };

  return (
    <View style={styles.container}>
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

      <View style={styles.main}>
        <View style={styles.login}>
          <Animated.Text
            entering={FadeInUp.duration(1000).springify()}
            style={styles.loginText}
          >
            Kayıt Ol
          </Animated.Text>
        </View>

        <View style={styles.form}>
          <Animated.View
            entering={FadeInDown.duration(1000).springify()}
            style={styles.formInputArea}
          >
            <TextInput
              placeholder="Ad Soyad"
              placeholderTextColor={"gray"}
              value={fullName}
              onChangeText={setFullName}
            />
          </Animated.View>

          <Animated.View
            entering={FadeInDown.delay(200).duration(1000).springify()}
            style={styles.formInputArea}
          >
            <TextInput
              placeholder="E-posta"
              placeholderTextColor={"gray"}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </Animated.View>

          <Animated.View
            entering={FadeInDown.delay(400).duration(1000).springify()}
            style={styles.formInputArea}
          >
            <TextInput
              placeholder="Şifre"
              placeholderTextColor={"gray"}
              secureTextEntry
              value={pass}
              onChangeText={setPass}
            />
          </Animated.View>

          <Animated.View
            entering={FadeInDown.delay(600).duration(1000).springify()}
            style={styles.formButtonArea}
          >
            <TouchableOpacity
              style={styles.formButton}
              onPress={handleRegister}
            >
              <Text style={styles.formButtonText}>Kayıt Ol</Text>
            </TouchableOpacity>
          </Animated.View>

          <Animated.View
            entering={FadeInDown.delay(800).duration(1000).springify()}
            style={styles.formFooter}
          >
            <Text>Zaten bir hesabın var mı?</Text>
            <TouchableOpacity onPress={() => navigation.navigate("Login")}>
              <Text style={styles.formFooterSingup}>Giriş Yap</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </View>
    </View>
  );
};

export default RegisterScreen;
