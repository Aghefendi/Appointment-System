import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Button,
  FlatList,
  StyleSheet,
  Alert,
  TouchableOpacity,
  ActivityIndicator, // Hata almamak için import ettik
  Linking, // Dosyayı açmak için eklendi
} from "react-native";
import firestore from "@react-native-firebase/firestore";
import storage from "@react-native-firebase/storage";
import auth from "@react-native-firebase/auth";

const DocumentsScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(true);
  const [documents, setDocuments] = useState([]);

  useEffect(() => {
    const user = auth().currentUser;

    // Kullanıcı oturumu kontrolü
    if (!user) {
      setLoading(false);
      return;
    }

    // Firestore'dan evrakları anlık olarak dinle
    const subscriber = firestore()
      .collection("users")
      .doc(user.uid)
      .collection("documents")
      .orderBy("createdAt", "desc")
      .onSnapshot(
        (querySnapshot) => {
          const docsData = [];
          querySnapshot.forEach((doc) => {
            docsData.push({ ...doc.data(), id: doc.id });
          });
          setDocuments(docsData);
          setLoading(false);
        },
        (error) => {
          console.error("Evrakları listelerken hata: ", error);
          setLoading(false);
        }
      );

    // Component kapandığında dinleyiciyi sonlandır
    return () => subscriber();
  }, []);

  // Evrak silme fonksiyonu
  const handleDelete = (document) => {
    Alert.alert(
      "Evrağı Sil",
      `'${document.name}' adlı evrağı silmek istediğinizden emin misiniz?`,
      [
        { text: "İptal", style: "cancel" },
        {
          text: "Sil",
          onPress: async () => {
            try {
              const storageRef = storage().ref(document.storagePath);
              await storageRef.delete();

              const userId = auth().currentUser.uid;
              await firestore()
                .collection("users")
                .doc(userId)
                .collection("documents")
                .doc(document.id)
                .delete();
            } catch (error) {
              console.error("Silme hatası: ", error);
              Alert.alert("Hata", "Evrak silinirken bir sorun oluştu.");
            }
          },
          style: "destructive",
        },
      ]
    );
  };

  // Listedeki her bir evrakın nasıl görüneceğini belirleyen component
  const renderDocument = ({ item }) => (
    <TouchableOpacity
      style={styles.itemContainer}
      onPress={() =>
        Linking.openURL(item.downloadURL).catch((err) => {
          console.error("Dosya açılırken hata: ", err);
          Alert.alert("Hata", "Dosya açılamadı. Lütfen tekrar deneyin.");
        })
      } // Tıklayınca dosyayı aç
    >
      <View style={{ flex: 1 }}>
        <Text style={styles.itemTitle}>{item.name}</Text>
        <Text style={styles.itemType}>
          {new Date(item.createdAt?.toDate()).toLocaleDateString()}
        </Text>
      </View>
      <TouchableOpacity
        onPress={() => handleDelete(item)}
        style={styles.deleteButton}
      >
        <Text style={styles.deleteButtonText}>Sil</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  if (loading) {
    return <ActivityIndicator size="large" style={{ flex: 1 }} />;
  }

  return (
    <View style={styles.container}>
      <Button
        title="+ Yeni Evrak Yükle"
        onPress={() => navigation.navigate("UploadDocument")} // Doğru ekran adına yönlendirdiğinizden emin olun
      />
      <FlatList
        data={documents}
        renderItem={renderDocument}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={
          <Text style={styles.emptyText}>
            Henüz yüklenmiş evrağınız bulunmuyor.
          </Text>
        }
        contentContainerStyle={{ paddingTop: 20 }}
      />
    </View>
  );
};

export default DocumentsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: "#f5f5f5",
    marginTop: 40,
  },
  itemContainer: {
    backgroundColor: "white",
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    elevation: 2,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  itemTitle: { fontSize: 16, fontWeight: "bold" },
  itemType: { fontSize: 12, color: "#888", marginTop: 4 },
  emptyText: { textAlign: "center", marginTop: 50, fontSize: 16 },
  deleteButton: {
    backgroundColor: "#e74c3c",
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 5,
  },
  deleteButtonText: { color: "white", fontWeight: "bold" },
});
