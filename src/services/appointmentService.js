import firestore from "@react-native-firebase/firestore";

/**
 * Kullanıcıya randevu ekler (çakışma kontrolü ile)
 * @param {string} userId - Firebase kullanıcı UID
 * @param {Object} data - Randevu verisi
 * @param {string} data.title - Randevu başlığı
 * @param {string} [data.notes] - Opsiyonel notlar
 * @param {Date} data.appointmentDate - Randevu tarihi
 */
export const addAppointment = async (userId, data) => {
  if (!userId) throw new Error("Kullanıcı ID bulunamadı.");
  if (!data?.title || !data?.appointmentDate) {
    throw new Error("Eksik randevu bilgisi.");
  }

  const appointmentDate = data.appointmentDate;
  const start = new Date(appointmentDate);
  start.setSeconds(0, 0); // saniye/milisaniye sıfırla

  const end = new Date(start);
  end.setMinutes(end.getMinutes() + 30); // 30 dakikalık blok (istersen 60 yap)

  // 🔎 Çakışma kontrolü
  const snapshot = await firestore()
    .collection("users")
    .doc(userId)
    .collection("appointments")
    .where("appointmentDate", ">=", firestore.Timestamp.fromDate(start))
    .where("appointmentDate", "<", firestore.Timestamp.fromDate(end))
    .get();

  if (!snapshot.empty) {
    throw new Error("Bu tarih ve saat aralığında zaten bir randevunuz var.");
  }

  // ✅ Yeni randevu kaydet
  return await firestore()
    .collection("users")
    .doc(userId)
    .collection("appointments")
    .add({
      title: data.title.trim(),
      notes: data.notes?.trim() || "",
      appointmentDate: firestore.Timestamp.fromDate(start),
      createdAt: firestore.FieldValue.serverTimestamp(),
    });
};

/**
 * Kullanıcının tüm randevularını getirir
 * @param {string} userId - Firebase kullanıcı UID
 */
export const getAppointments = async (userId) => {
  if (!userId) throw new Error("Kullanıcı ID bulunamadı.");

  const snapshot = await firestore()
    .collection("users")
    .doc(userId)
    .collection("appointments")
    .orderBy("appointmentDate", "asc")
    .get();

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
};

/**
 * Randevu günceller
 * @param {string} userId - Firebase kullanıcı UID
 * @param {string} appointmentId - Güncellenecek randevunun ID’si
 * @param {Object} updates - Güncelleme verileri
 */
export const updateAppointment = async (userId, appointmentId, updates) => {
  if (!userId || !appointmentId) throw new Error("Geçersiz parametreler.");

  return await firestore()
    .collection("users")
    .doc(userId)
    .collection("appointments")
    .doc(appointmentId)
    .update({
      ...updates,
      updatedAt: firestore.FieldValue.serverTimestamp(),
    });
};

/**
 * Randevu siler
 * @param {string} userId - Firebase kullanıcı UID
 * @param {string} appointmentId - Silinecek randevunun ID’si
 */
export const deleteAppointment = async (userId, appointmentId) => {
  if (!userId || !appointmentId) throw new Error("Geçersiz parametreler.");

  return await firestore()
    .collection("users")
    .doc(userId)
    .collection("appointments")
    .doc(appointmentId)
    .delete();
};
/**
 * Canlı randevu listesini dinler (real-time)
 * @param {string} userId - Firebase kullanıcı UID
 * @param {function} callback - Snapshot değiştiğinde çalışacak fonksiyon
 * @returns unsubscribe fonksiyonu
 */
export const listenAppointments = (userId, callback) => {
  if (!userId) throw new Error("Kullanıcı ID bulunamadı.");

  return firestore()
    .collection("users")
    .doc(userId)
    .collection("appointments")
    .orderBy("appointmentDate", "asc")
    .onSnapshot((querySnapshot) => {
      const data = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      callback(data);
    });
};
