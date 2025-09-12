const {onSchedule} = require("firebase-functions/v2/scheduler");
const admin = require("firebase-admin");

admin.initializeApp();

exports.sendAppointmentReminders = onSchedule(
    {
      schedule: "every 30 minutes",
      timeZone: "Europe/Istanbul",
      timeoutSeconds: 300,
      memory: "512MiB",
      maxInstances: 1,
      retryCount: 3,
    },
    async () => {
      try {
        const now = admin.firestore.Timestamp.now();
        const oneHourLater = admin.firestore.Timestamp.fromDate(
            new Date(Date.now() + 60 * 60 * 1000),
        );

        const batch = admin.firestore().batch();
        const processedDocs = new Set();

        const snapshot = await admin
            .firestore()
            .collectionGroup("appointments")
            .where("reminderSent", "==", false)
            .where("appointmentDate", ">=", now)
            .where("appointmentDate", "<=", oneHourLater)
            .get();

        if (snapshot.empty) {
          console.log("No upcoming appointments found.");
          return null;
        }

        const notificationPromises = snapshot.docs.map(async (doc) => {
          const {fcmToken, title, appointmentDate} = doc.data();

          if (!fcmToken || !(appointmentDate && appointmentDate.seconds)) {
            console.warn(`Invalid data for doc ${doc.id}`);
            return;
          }

          if (processedDocs.has(doc.id)) {
            return;
          }
          processedDocs.add(doc.id);

          try {
            const message = {
              token: fcmToken,
              notification: {
                title: "Randevunuz Yaklaşıyor",
                body: `${
                  title || "Randevu"
                } başlıklı randevunuza yaklaşık 1 saat kaldı.`,
              },
              android: {
                priority: "high",
                ttl: 3600 * 1000,
              },
              apns: {
                payload: {
                  aps: {
                    contentAvailable: true,
                    sound: "default",
                  },
                },
              },
            };

            await admin.messaging().send(message);
            batch.update(doc.ref, {
              reminderSent: true,
              lastNotificationSent: admin.
                  firestore.FieldValue.serverTimestamp(),
            });
          } catch (err) {
            console.error(`Error for doc ${doc.id}:`, err.message);

            if (
              err.code === "messaging/registration-token-not-registered" ||
            err.code === "messaging/invalid-registration-token"
            ) {
              batch.update(doc.ref, {
                fcmToken: admin.firestore.FieldValue.delete(),
                tokenError: err.message,
              });
            }
          }
        });

        await Promise.all(notificationPromises);
        await batch.commit();

        console.log(
            `Processed ${processedDocs.size} docs at 
            ${now.toDate().toISOString()}`,
        );
      } catch (error) {
        console.error("Function error:", error);
        throw new Error("Function failed: " + error.message);
      }
    },
);
