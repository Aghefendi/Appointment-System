import { StyleSheet, Text, View, TextInput, Button, Alert } from "react-native";
import React, { useState } from "react";
import auth from "@react-native-firebase/auth";

const RegisterScreen = () => {
  const handleRegister = (user, pass) => {
    auth()
      .createUserWithEmailAndPassword(user, pass)
      .then(() => {
        Alert.alert("Kayıt Başarılı");
      })
      .catch((err) => {
        Alert.alert(err);
      });
  };

  const [user, userSet] = useState();
  const [pass, passSet] = useState();

  return (
    <View style={styles.container}>
      <Text style={styles.TextCs}>Email</Text>
      <TextInput style={styles.textInput} value={user} onChangeText={userSet} />
      <Text style={styles.TextCs}>Şifre</Text>
      <TextInput style={styles.textInput} value={pass} onChangeText={passSet} />
      <Button
        style={styles.buttonWrapper}
        onPress={() => handleRegister(user, pass)}
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
