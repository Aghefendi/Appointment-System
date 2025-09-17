import firestore from "@react-native-firebase/firestore";
import storage from "@react-native-firebase/storage";
import RNFS from "react-native-fs";
import { Platform } from "react-native";

/**
 * Evrak yükleme servisi (Android/iOS uyumlu)
 * @param {string} userId - Firebase UID
 * @param {Object} file - Seçilen dosya objesi (name, uri, type, size)
 * @param {function} onProgress - Yüzde callback
 */
export const uploadDocument = async (userId, file, onProgress) => {
  if (!userId || !file) throw new Error("Geçersiz parametreler.");

  const fileName = file.name || `${Date.now()}.pdf`;
  let localFilePath = `${RNFS.CachesDirectoryPath}/${fileName}`;

  try {
    // Android content:// URI çözümü
    let sourcePath = file.uri;
    if (Platform.OS === "android" && file.uri.startsWith("content://")) {
      const destPath = `${RNFS.CachesDirectoryPath}/${fileName}`;
      const buffer = await RNFS.readFile(file.uri, "base64");
      await RNFS.writeFile(destPath, buffer, "base64");
      sourcePath = destPath;
    }

    // iOS ve normal dosya URI
    if (Platform.OS === "ios" || sourcePath.startsWith("file://")) {
      await RNFS.copyFile(sourcePath, localFilePath);
    }

    const storagePath = `documents/${userId}/${Date.now()}_${fileName}`;
    const reference = storage().ref(storagePath);
    const task = reference.putFile(localFilePath);

    task.on("state_changed", (snap) => {
      const pct = Math.round((snap.bytesTransferred / snap.totalBytes) * 100);
      if (onProgress) onProgress(pct);
    });

    await task;

    const downloadURL = await reference.getDownloadURL();

    await firestore()
      .collection("users")
      .doc(userId)
      .collection("documents")
      .add({
        name: fileName,
        type: file.type || "application/pdf",
        size: file.size || 0,
        downloadURL,
        storagePath,
        createdAt: firestore.FieldValue.serverTimestamp(),
      });

    return { success: true, downloadURL };
  } finally {
    // Cache temizliği
    if (localFilePath) {
      RNFS.unlink(localFilePath.replace("file://", "")).catch(() => {});
    }
  }
};

/**
 * Evrakları real-time dinler
 * @param {string} userId
 * @param {function} callback
 * @returns unsubscribe fonksiyonu
 */
export const listenDocuments = (userId, callback) => {
  if (!userId) throw new Error("Kullanıcı ID bulunamadı.");

  return firestore()
    .collection("users")
    .doc(userId)
    .collection("documents")
    .orderBy("createdAt", "desc")
    .onSnapshot((querySnapshot) => {
      const docs = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      callback(docs);
    });
};

/**
 * Evrak silme işlemi
 * @param {string} userId
 * @param {Object} document - { id, storagePath }
 */
export const deleteDocument = async (userId, document) => {
  if (!userId || !document?.id) throw new Error("Geçersiz parametreler.");

  if (document.storagePath) {
    await storage().ref(document.storagePath).delete();
  }

  await firestore()
    .collection("users")
    .doc(userId)
    .collection("documents")
    .doc(document.id)
    .delete();
};
