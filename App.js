import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Button, Alert,ActivityIndicator} from "react-native";
import auth from "@react-native-firebase/auth";
import { NavigationContainer } from "@react-navigation/native";
import AppStack from "./src/navigation/AppStack";
import AuthStack from "./src/navigation/AuthStack";
import { StatusBar } from "expo-status-bar";

export default function App() {
  const [initialization, setinitilization] = useState(true);
  const [user, setuser] = useState();

  function onAuthStateChanges(user) {
    setuser(user);
    if (initialization) setinitilization(false);
  }

  useEffect(() => {
    const subscribe = auth().onAuthStateChanged(onAuthStateChanges);
    return subscribe;
  }, []);

  if (initialization)
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );

  return (
    <NavigationContainer>
      <StatusBar barStyle="dark-content" />
      {user ? <AppStack /> : <AuthStack />}
    </NavigationContainer>
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
