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

const ProfileScreen = () => {
  const [loading, setLoading] = useState(true); // Veri yüklenirken bekleme durumu için
  const [userData, setUserData] = useState(null); // Çekilen kullanıcı verisini tutmak için

  // Bu fonksiyon, veriyi Firestore'dan çekecek
  const fetchUserData = () => {
    const user = auth().currentUser; // Mevcut kullanıcıyı al

    if (user) {
      const subscriber = firestore()
        .collection("users")
        .doc(user.uid)
        .onSnapshot(
          (documentSnapshot) => {
            if (documentSnapshot.exists) {
              console.log("Kullanıcı verisi: ", documentSnapshot.data());
              setUserData(documentSnapshot.data());
            } else {
              console.log("Kullanıcı dökümanı bulunamadı!");
            }
            setLoading(false);
          },
          (error) => {
            console.error("Veri çekme hatası: ", error);
            setLoading(false);
          }
        );

      // Component kapandığında listener'ı temizle
      return () => subscriber();
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  // Çıkış yapma fonksiyonu
  const handleLogout = () => {
    auth()
      .signOut()
      .then(() => console.log("Kullanıcı çıkış yaptı!"))
      .catch((error) =>
        Alert.alert("Hata", "Çıkış yaparken bir sorun oluştu.")
      );
  };

  // Veri hala yükleniyorsa, bir yüklenme göstergesi gösterelim
  if (loading) {
    return (
      <ActivityIndicator
        size="large"
        color="#0000ff"
        style={{ flex: 1, justifyContent: "center" }}
      />
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profilim</Text>
      {userData ? (
        <View style={styles.infoContainer}>
          <Text style={styles.label}>E-posta Adresiniz:</Text>
          <Text style={styles.info}>{userData.email}</Text>

          {/* İleride ekleyeceğiniz diğer bilgiler için örnek */}
          <Text style={styles.label}>Ad Soyad:</Text>
          <Text style={styles.info}>
            {userData.fullName || "Henüz belirtilmemiş"}
          </Text>
        </View>
      ) : (
        <Text>Kullanıcı bilgileri yüklenemedi.</Text>
      )}

      <Button title="Çıkış Yap" onPress={handleLogout} color="#e74c3c" />
    </View>
  );
};

export default ProfileScreen;

// Basit stil tanımlamaları
const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#f5f5f5",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  infoContainer: {
    width: "100%",
    padding: 15,
    backgroundColor: "white",
    borderRadius: 10,
    marginBottom: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  label: {
    fontSize: 16,
    color: "#888",
  },
  info: {
    fontSize: 18,
    fontWeight: "500",
    marginBottom: 15,
  },
});
