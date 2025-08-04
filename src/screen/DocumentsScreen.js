import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  Button,
  StyleSheet,
  Alert,
  TouchableOpacity,
  ActivityIndicator,
  Linking,
} from "react-native";
import firestore from "@react-native-firebase/firestore";
import storage from "@react-native-firebase/storage";
import auth from "@react-native-firebase/auth";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";

const DocumentsScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(true);
  const [documents, setDocuments] = useState([]);

  useEffect(() => {
    const user = auth().currentUser;
    if (!user) {
      setLoading(false);
      return;
    }

    const subscriber = firestore()
      .collection("users")
      .doc(user.uid)
      .collection("documents")
      .orderBy("createdAt", "desc")
      .onSnapshot(
        (qs) => {
          const docs = [];
          qs.forEach((doc) => docs.push({ id: doc.id, ...doc.data() }));
          setDocuments(docs);
          setLoading(false);
        },
        (err) => {
          console.error(err);
          setLoading(false);
        }
      );
    return () => subscriber();
  }, []);

  const handleDelete = (document) => {
    Alert.alert(
      "Evrağı Sil",
      `'${document.name}' adlı evrağı silmek istediğinizden emin misiniz?`,
      [
        { text: "İptal", style: "cancel" },
        {
          text: "Sil",
          style: "destructive",
          onPress: async () => {
            try {
              await storage().ref(document.storagePath).delete();
              await firestore()
                .collection("users")
                .doc(auth().currentUser.uid)
                .collection("documents")
                .doc(document.id)
                .delete();
            } catch (error) {
              console.error(error);
              Alert.alert("Hata", "Silme sırasında bir sorun oluştu.");
            }
          },
        },
      ]
    );
  };

  const renderItem = ({ item, index }) => (
    <Animated.View
      entering={FadeInDown.duration(400).delay(index * 100)}
      style={styles.itemContainer}
    >
      <TouchableOpacity
        style={{ flex: 1 }}
        onPress={() =>
          Linking.openURL(item.downloadURL).catch(() =>
            Alert.alert("Hata", "Dosya açılamadı.")
          )
        }
      >
        <Text style={styles.itemTitle}>{item.name}</Text>
        <Text style={styles.itemType}>
          {new Date(item.createdAt?.toDate()).toLocaleDateString()}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => handleDelete(item)}
        style={styles.deleteButton}
      >
        <Text style={styles.deleteButtonText}>Sil</Text>
      </TouchableOpacity>
    </Animated.View>
  );

  if (loading) {
    return <ActivityIndicator size="large" style={{ flex: 1 }} />;
  }

  return (
    // Tüm listeyi yukarıdan fade-in ile getir
    <Animated.View entering={FadeInUp.duration(500)} style={styles.container}>
      <Button
        title="+ Yeni Evrak Yükle"
        onPress={() => navigation.navigate("UploadDocument")}
      />
      {documents.length === 0 ? (
        <Text style={styles.emptyText}>Henüz yüklenmiş evrağınız yok.</Text>
      ) : (
        <Animated.FlatList
          data={documents}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingTop: 20 }}
        />
      )}
    </Animated.View>
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
