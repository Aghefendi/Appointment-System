import React, { useState, useCallback, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Platform,
  TouchableOpacity,
  Animated,
  Easing,
} from "react-native";
import { pick } from "@react-native-documents/picker";
import storage from "@react-native-firebase/storage";
import firestore from "@react-native-firebase/firestore";
import auth from "@react-native-firebase/auth";
import RNFS from "react-native-fs";
import { useSelector } from "react-redux";

const UploadDocument = ({ navigation }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  const theme = useSelector((state) => state.theme.theme);
  const styles = createStyles(theme);

  // Animasyon referansları
  const buttonScale = useRef(new Animated.Value(1)).current;
  const fileFade = useRef(new Animated.Value(0)).current;
  const progressWidth = useRef(new Animated.Value(0)).current;

  // Seçilen dosya geldiyse animasyonu başlat
  useEffect(() => {
    if (selectedFile) {
      Animated.timing(fileFade, {
        toValue: 1,
        duration: 400,
        easing: Easing.out(Easing.exp),
        useNativeDriver: true,
      }).start();
    }
  }, [selectedFile, fileFade]);

  // Yükleme ilerledikçe progress bar genişliğini güncelle
  useEffect(() => {
    if (loading) {
      Animated.timing(progressWidth, {
        toValue: progress,
        duration: 200,
        easing: Easing.linear,
        useNativeDriver: false, // width animasyonu için false
      }).start();
    } else {
      // yükleme bitince sıfırla
      progressWidth.setValue(0);
    }
  }, [progress, loading, progressWidth]);

  // Butona basınca pop animasyonu
  const animateButton = () => {
    Animated.sequence([
      Animated.timing(buttonScale, {
        toValue: 0.9,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.spring(buttonScale, {
        toValue: 1,
        friction: 3,
        tension: 150,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const CustomButton = ({ title, onPress, disabled, style }) => (
    <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
      <TouchableOpacity
        onPress={() => {
          if (!disabled) {
            animateButton();
            onPress();
          }
        }}
        disabled={disabled}
        style={[styles.customButton, disabled && styles.disabledButton, style]}
      >
        <Text style={styles.customButtonText}>{title}</Text>
      </TouchableOpacity>
    </Animated.View>
  );

  const selectFile = async () => {
    try {
      const [result] = await pick({
        type: "application/pdf",
        copyTo: "cachesDirectory",
      });
      if (result) setSelectedFile(result);
    } catch (err) {
      if (err.code !== "DOCUMENT_PICKER_CANCELED") {
        Alert.alert("Hata", "Dosya seçilirken bir sorun oluştu.");
      }
    }
  };

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
      const sourceUri = selectedFile.uri;
      const fileName = selectedFile.name || `${Date.now()}.pdf`;
      const destinationPath = `${RNFS.CachesDirectoryPath}/${fileName}`;
      await RNFS.copyFile(sourceUri, destinationPath);
      localFileUri = `file://${destinationPath}`;

      const storagePath = `documents/${user.uid}/${Date.now()}_${fileName}`;
      const reference = storage().ref(storagePath);
      const task = reference.putFile(destinationPath);

      task.on("state_changed", (snap) => {
        const pct = Math.round((snap.bytesTransferred / snap.totalBytes) * 100);
        setProgress(pct);
      });

      await task;
      const url = await reference.getDownloadURL();
      await firestore()
        .collection("users")
        .doc(user.uid)
        .collection("documents")
        .add({
          name: fileName,
          type: selectedFile.type,
          size: selectedFile.size,
          downloadURL: url,
          storagePath,
          createdAt: firestore.FieldValue.serverTimestamp(),
        });

      Alert.alert("Başarılı", "Evrağınız başarıyla yüklendi.");
      navigation.goBack();
    } catch (error) {
      console.error(error);
      Alert.alert("Yükleme Başarısız", error.message);
    } finally {
      setLoading(false);
      if (localFileUri) {
        RNFS.unlink(localFileUri.replace("file://", "")).catch(() => {});
      }
    }
  }, [selectedFile, navigation]);

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
        <Animated.View
          style={[
            styles.fileInfoContainer,
            {
              opacity: fileFade,
              transform: [
                {
                  translateY: fileFade.interpolate({
                    inputRange: [0, 1],
                    outputRange: [20, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <Text style={styles.fileNameLabel}>Seçilen Dosya:</Text>
          <Text style={styles.fileName} numberOfLines={1}>
            {selectedFile.name}
          </Text>
        </Animated.View>
      )}

      {loading && (
        <View style={styles.progressContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
          <View style={styles.progressBarBackground}>
            <Animated.View
              style={[
                styles.progressBarFill,
                {
                  width: progressWidth.interpolate({
                    inputRange: [0, 100],
                    outputRange: ["0%", "100%"],
                  }),
                },
              ]}
            />
          </View>
          <Text style={styles.progressText}>{progress}%</Text>
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

const createStyles = (theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      padding: 20,
      backgroundColor: theme.backgroundColor,
    },
    title: {
      fontSize: 24,
      fontWeight: "bold",
      marginBottom: 10,
      color: theme.color,
    },
    subtitle: {
      fontSize: 16,
      color: theme.subtleText,
      textAlign: "center",
      marginBottom: 30,
    },
    customButton: {
      backgroundColor: theme.primary,
      paddingVertical: 15,
      paddingHorizontal: 30,
      borderRadius: 10,
      alignItems: "center",
      justifyContent: "center",
      width: "90%",
      marginVertical: 10,
      shadowColor: theme.shadowColor,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 5,
    },
    disabledButton: {
      backgroundColor: "#A9A9A9",
      elevation: 0,
    },
    customButtonText: {
      color: theme.buttonText || "white",
      fontSize: 16,
      fontWeight: "bold",
    },
    fileInfoContainer: {
      marginTop: 25,
      padding: 15,
      backgroundColor: theme.cardBackground,
      borderRadius: 8,
      width: "90%",
      alignItems: "center",
    },
    fileNameLabel: {
      fontSize: 14,
      color: theme.subtleText || "#888",
    },
    fileName: {
      marginTop: 5,
      fontSize: 16,
      fontWeight: "500",
      color: theme.color,
    },
    progressContainer: {
      marginTop: 30,
      alignItems: "center",
      width: "90%",
    },
    progressBarBackground: {
      width: "100%",
      height: 8,
      backgroundColor: theme.subtleText || "#eee",
      borderRadius: 4,
      overflow: "hidden",
      marginVertical: 10,
    },
    progressBarFill: {
      height: 8,
      backgroundColor: theme.primary,
    },
    progressText: {
      fontSize: 14,
      color: theme.primary,
      fontWeight: "bold",
    },
    uploadButton: {
      marginTop: 20,
      backgroundColor: theme.success,
    },
  });
