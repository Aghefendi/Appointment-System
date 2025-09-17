import React, { useState, useEffect } from "react";
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  Alert,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import firestore from "@react-native-firebase/firestore";
import auth from "@react-native-firebase/auth";
import moment from "moment";
import "moment/locale/tr";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";
import { useSelector } from "react-redux";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { FlashList } from "@shopify/flash-list";
import {
  listenAppointments,
  deleteAppointment,
} from "../services/appointmentService";

const AppointmentsScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(true);
  const [appointments, setAppointments] = useState([]);
  const theme = useSelector((state) => state.theme.theme);

  useEffect(() => {
    moment.locale("tr");
    const user = auth().currentUser;
    if (!user) {
      setLoading(false);
      return;
    }

    const unsubscribe = listenAppointments(user.uid, (data) => {
      setAppointments(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleDelete = (id) => {
    Alert.alert(
      "Randevuyu Sil",
      "Bu randevuyu kalıcı olarak silmek istediğinizden emin misiniz?",
      [
        { text: "Vazgeç", style: "cancel" },
        {
          text: "Sil",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteAppointment(auth().currentUser.uid, id);
            } catch (error) {
              Alert.alert("Hata", "Randevu silinirken bir sorun oluştu.");
            }
          },
        },
      ]
    );
  };

  const renderItem = ({ item, index }) => {
    const appointmentDate = item.appointmentDate?.toDate();
    const formattedDate = moment(appointmentDate).calendar();
    const day = moment(appointmentDate).format("DD");
    const month = moment(appointmentDate).format("MMM");

    return (
      <Animated.View entering={FadeInDown.duration(500).delay(index * 100)}>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() =>
            navigation.navigate("EditAppointment", { appointment: item })
          }
          style={[
            styles.card,
            {
              backgroundColor: theme.cardBackground,
              shadowColor: theme.shadowColor,
            },
          ]}
        >
          <View
            style={[
              styles.dateSection,
              { backgroundColor: `${theme.primary}1A` },
            ]}
          >
            <Text style={[styles.dateDay, { color: theme.primary }]}>
              {day}
            </Text>
            <Text style={[styles.dateMonth, { color: theme.primary }]}>
              {month}
            </Text>
          </View>

       
          <View style={styles.contentSection}>
            <Text style={[styles.itemTitle, { color: theme.color }]}>
              {item.title}
            </Text>
            <Text style={[styles.itemTime, { color: theme.subtleText }]}>
              {formattedDate}
            </Text>
            {item.notes && (
              <Text
                numberOfLines={1}
                style={[styles.itemNotes, { color: theme.subtleText }]}
              >
                {item.notes}
              </Text>
            )}
          </View>

    
          <TouchableOpacity
            onPress={() => handleDelete(item.id)}
            style={styles.deleteButton}
          >
            <Icon
              name="trash-can-outline"
              size={24}
              color={theme.danger || "#e74c3c"}
            />
          </TouchableOpacity>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const EmptyListComponent = () => (
    <Animated.View
      style={styles.emptyContainer}
      entering={FadeInUp.duration(500)}
    >
      <Icon
        name="calendar-month-outline"
        size={80}
        color={`${theme.subtleText}80`}
      />
      <Text style={[styles.emptyText, { color: theme.subtleText }]}>
        Henüz hiç randevunuz yok.
      </Text>
      <Text style={[styles.emptySubText, { color: theme.subtleText }]}>
        Yeni bir tane eklemek için + düğmesine dokunun.
      </Text>
    </Animated.View>
  );

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: theme.backgroundColor }]}
    >
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: theme.color }]}>
          Randevularım
        </Text>
      </View>

      {loading ? (
        <ActivityIndicator
          size="large"
          color={theme.primary}
          style={{ flex: 1 }}
        />
      ) : (
        <FlashList
          data={appointments}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={EmptyListComponent}
        />
      )}

      <Animated.View entering={FadeInUp.duration(500).delay(300)}>
        <TouchableOpacity
          style={[
            styles.fab,
            { backgroundColor: theme.primary, shadowColor: theme.primary },
          ]}
          onPress={() => navigation.navigate("AddAppointment")}
        >
          <Icon name="plus" size={32} color={theme.buttonText || "#fff"} />
        </TouchableOpacity>
      </Animated.View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: "bold",
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 16,
    marginBottom: 16,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 5,
  },
  dateSection: {
    padding: 16,
    alignItems: "center",
    justifyContent: "center",
    width: 80,
    borderTopLeftRadius: 16,
    borderBottomLeftRadius: 16,
  },
  dateDay: {
    fontSize: 28,
    fontWeight: "bold",
  },
  dateMonth: {
    fontSize: 14,
    textTransform: "capitalize",
    marginTop: 2,
  },
  contentSection: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  itemTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  itemTime: {
    fontSize: 14,
    marginTop: 4,
  },
  itemNotes: {
    fontSize: 14,
    marginTop: 8,
    fontStyle: "italic",
  },
  deleteButton: {
    padding: 16,
  },
  fab: {
    position: "absolute",
    bottom: 30,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    marginTop: "30%",
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    marginTop: 20,
  },
  emptySubText: {
    fontSize: 14,
    marginTop: 8,
    textAlign: "center",
  },
});

export default AppointmentsScreen;
