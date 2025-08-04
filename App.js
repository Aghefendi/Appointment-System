import React, { useEffect, useState } from "react";
import { View, StyleSheet, ActivityIndicator } from "react-native";
import auth from "@react-native-firebase/auth";
import { NavigationContainer } from "@react-navigation/native";
import AppStack from "./src/navigation/AppStack";
import AuthStack from "./src/navigation/AuthStack";
import { Provider } from "react-redux";
import store from "./src/store/store";

export default function App() {
  // Daha açıklayıcı isimler kullanıyoruz
  const [initializing, setInitializing] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    // onAuthStateChanged aboneliğini oluşturalım
    const unsubscribe = auth().onAuthStateChanged((usr) => {
      setUser(usr);
      if (initializing) {
        setInitializing(false);
      }
    });
    // Cleanup olarak aboneliği kapat
    return unsubscribe;
  }, [initializing]);

  // Yüklenme sürecinde ortak bir style kullanalım
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
