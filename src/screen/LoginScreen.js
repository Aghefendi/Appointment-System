import { StyleSheet, Text, View, TextInput, Button, Alert } from "react-native";
import React from "react";
import auth from "@react-native-firebase/auth";
import { useState } from "react";

const LoginScreen = ({ navigation }) => {
  const [user, userSet] = useState("");
  const [pass, passSet] = useState("");

  const handleLogin = (user, pass) => {
    auth()
      .signInWithEmailAndPassword(user, pass)
      .then(() => {
        console.log(Alert.alert("Giriş Yapıldı"));
      })
      .catch((err) => {
        console.log(Alert.alert("Yanlış kullanıcı adı veya şifre"));
      });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.TextCs}>Email:</Text>
      <TextInput style={styles.textInput} value={user} onChangeText={userSet} />
      <Text style={styles.TextCs}>Şifre:</Text>
      <TextInput
        style={styles.textInput}
        value={pass}
        onChangeText={passSet}
        secureTextEntry
      />

      <View style={styles.buttonWrapper}>
        <Button onPress={() => handleLogin(user, pass)} title="Giriş Yap" />
      </View>
      <View style={styles.buttonWrapper}>
        <Button
          title="KAyıt ol"
          onPress={() => navigation.navigate("Register")}
        />
      </View>
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

export default LoginScreen;
