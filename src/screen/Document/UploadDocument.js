import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Platform,
  TouchableOpacity,
} from "react-native";
import { pick } from "@react-native-documents/picker";
import storage from "@react-native-firebase/storage";
import firestore from "@react-native-firebase/firestore";
import auth from "@react-native-firebase/auth";
// YENİ KÜTÜPHANEYİ İÇERİ AKTARIN
import RNFS from "react-native-fs";

// CustomButton component'i aynı kalabilir...
const CustomButton = ({ title, onPress, disabled, style }) => (
  <TouchableOpacity
    onPress={onPress}
    disabled={disabled}
    style={[styles.customButton, disabled && styles.disabledButton, style]}
  >
    <Text style={styles.customButtonText}>{title}</Text>
  </TouchableOpacity>
);

const UploadDocument = ({ navigation }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  const selectFile = async () => {
    try {
      const [result] = await pick({
        type: "application/pdf",
        copyTo: "cachesDirectory", // Bu parametre kalsa da olur, zararı yok
      });

      if (result) {
        setSelectedFile(result);
      }
    } catch (err) {
      if (err.code !== "DOCUMENT_PICKER_CANCELED") {
        console.error("Error picking document:", err);
        Alert.alert("Hata", "Dosya seçilirken bir sorun oluştu.");
      }
    }
  };

  /**
   * BU FONKSİYON TAMAMEN GÜNCELLENDİ
   * Dosyayı manuel olarak kopyalar ve Firebase'e yükler.
   */
  const handleUpload = useCallback(async () => {
    if (!selectedFile) {
      Alert.alert("Dosya Seçilmedi", "Lütfen önce bir dosya seçin.");
      return;
    }

    const user = auth().currentUser;
    if (!user) {
      Alert.alert(
        "Giriş Yapılmadı",
        "Dosya yüklemek için lütfen giriş yapınız."
      );
      return;
    }

    setLoading(true);
    setProgress(0);

    let localFileUri = "";

    try {
      // Adım 1: Dosyayı yerel bir konuma kopyala
      const sourceUri = selectedFile.uri;
      const fileName = selectedFile.name || `${Date.now()}.pdf`;
      // Hedef yol: Uygulamanın önbellek dizininde güvenli bir konum
      const destinationPath = `${RNFS.CachesDirectoryPath}/${fileName}`;

      console.log(`Kopyalanıyor: ${sourceUri} -> ${destinationPath}`);

      await RNFS.copyFile(sourceUri, destinationPath);
      localFileUri = `file://${destinationPath}`; // Firebase için dosya yolu formatı
      console.log("Kopyalama başarılı. Yeni yol:", localFileUri);

      // Adım 2: Kopyalanan dosyayı Firebase'e yükle
      const storagePath = `documents/${user.uid}/${Date.now()}_${fileName}`;
      const reference = storage().ref(storagePath);

      const task = reference.putFile(destinationPath);

      task.on("state_changed", (taskSnapshot) => {
        const percentage = Math.round(
          (taskSnapshot.bytesTransferred / taskSnapshot.totalBytes) * 100
        );
        setProgress(percentage);
      });

      await task;

      const url = await reference.getDownloadURL();

      // Adım 3: Firestore'a metadata kaydet
      await firestore()
        .collection("users")
        .doc(user.uid)
        .collection("documents")
        .add({
          name: fileName,
          type: selectedFile.type,
          size: selectedFile.size,
          downloadURL: url,
          storagePath: storagePath,
          createdAt: firestore.FieldValue.serverTimestamp(),
        });

      Alert.alert("Başarılı", "Evrağınız başarıyla yüklendi.");
      navigation.goBack();
    } catch (error) {
      console.error("Yükleme işlemi sırasında hata:", error);
      let errorMessage = error.message;
      if (error.code === "EUNSPECIFIED") {
        errorMessage = "Dosya kopyalanamadı. Lütfen tekrar deneyin.";
      }
      Alert.alert("Yükleme Başarısız", `Bir hata oluştu: ${errorMessage}`);
    } finally {
      setLoading(false);
      setProgress(0);
      // Geçici dosyayı temizle (isteğe bağlı ama önerilir)
      if (localFileUri) {
        RNFS.unlink(localFileUri.replace("file://", "")).catch((err) =>
          console.error("Geçici dosya silinemedi:", err)
        );
      }
    }
  }, [selectedFile, navigation]);

  // return kısmı aynı kalabilir
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Evrak Yükle</Text>
      <Text style={styles.subtitle}>
        Lütfen yüklemek istediğiniz PDF dosyasını seçin.
      </Text>

      <CustomButton
        title="PDF Dosyası Seç"
        onPress={selectFile}
        disabled={loading}
      />

      {selectedFile && (
        <View style={styles.fileInfoContainer}>
          <Text style={styles.fileNameLabel}>Seçilen Dosya:</Text>
          <Text style={styles.fileName} numberOfLines={1}>
            {selectedFile.name}
          </Text>
        </View>
      )}

      {loading && (
        <View style={styles.progressContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.progressText}>{progress}% Yüklendi</Text>
        </View>
      )}

      <CustomButton
        title="Seçili Evrağı Yükle"
        onPress={handleUpload}
        disabled={!selectedFile || loading}
        style={styles.uploadButton}
      />
    </View>
  );
};

export default UploadDocument;

// stiller aynı kalabilir
const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#F5F5F7",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#333",
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 30,
  },
  customButton: {
    backgroundColor: "#007AFF",
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    width: "90%",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  disabledButton: {
    backgroundColor: "#A9A9A9",
    elevation: 0,
  },
  customButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  fileInfoContainer: {
    marginTop: 25,
    padding: 15,
    backgroundColor: "white",
    borderRadius: 8,
    width: "90%",
    alignItems: "center",
  },
  fileNameLabel: {
    fontSize: 14,
    color: "#888",
  },
  fileName: {
    marginTop: 5,
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
  },
  progressContainer: {
    marginTop: 30,
    alignItems: "center",
  },
  progressText: {
    marginTop: 10,
    fontSize: 16,
    color: "#007AFF",
    fontWeight: "bold",
  },
  uploadButton: {
    marginTop: 40,
    backgroundColor: "#34C759", // A different color for the main action
  },
});
