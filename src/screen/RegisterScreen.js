import { StyleSheet, Text, View, TextInput, Button, Alert } from "react-native";
import React, { useState } from "react";
import auth from "@react-native-firebase/auth";
import firestore from "@react-native-firebase/firestore";

const RegisterScreen = () => {
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [fullName, setFullName] = useState(""); // opsiyonel ad soyad

  const handleRegister = async () => {
    if (!email || !pass) {
      Alert.alert("Hata", "Lütfen e-posta ve şifre girin.");
      return;
    }

    try {
      const userCredentials = await auth().createUserWithEmailAndPassword(
        email,
        pass
      );
      const user = userCredentials.user;
      console.log("Kullanıcı oluşturuldu:", user.email);

      await firestore()
        .collection("users")
        .doc(user.uid)
        .set({
          email: user.email,
          fullName: fullName || "Bilinmiyor",
          createdAt: firestore.FieldValue.serverTimestamp(),
        });

      console.log("Kullanıcı verileri Firestore'a eklendi!");
      Alert.alert("Başarılı", "Kayıt tamamlandı!");
    } catch (error) {
      console.error("Kayıt/Firestore hatası:", error);
      Alert.alert("Hata", error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.TextCs}>Ad Soyad</Text>
      <TextInput
        style={styles.textInput}
        value={fullName}
        onChangeText={setFullName}
      />

      <Text style={styles.TextCs}>Email</Text>
      <TextInput
        style={styles.textInput}
        value={email}
        onChangeText={setEmail}
      />

      <Text style={styles.TextCs}>Şifre</Text>
      <TextInput
        style={styles.textInput}
        value={pass}
        onChangeText={setPass}
        secureTextEntry
      />

      <Button
        style={styles.buttonWrapper}
        onPress={handleRegister}
        title="Kayıt ol"
      />
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ddd",
    marginTop: 30,
    padding: 50,
  },
  TextCs: {
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 10,
  },
  textInput: {
    borderWidth: 1,
    borderColor: "#333",
    padding: 10,
    marginVertical: 8,
    borderRadius: 5,
    backgroundColor: "#fff",
  },
  buttonWrapper: {
    marginVertical: 10,
  },
});

export default RegisterScreen;
