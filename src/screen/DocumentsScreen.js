import { useState, useEffect } from "react";
import {
  SafeAreaView,
  FlatList,
  View,
  Text,
  StyleSheet,
  Alert,
  TouchableOpacity,
  ActivityIndicator,
  Linking,
} from "react-native";
import auth from "@react-native-firebase/auth";
import moment from "moment";
import "moment/locale/tr";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";
import { useSelector } from "react-redux";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { listenDocuments, deleteDocument } from "../services/documentService";

const DocumentsScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(true);
  const [documents, setDocuments] = useState([]);
  const theme = useSelector((state) => state.theme.theme);

  useEffect(() => {
    moment.locale("tr");
    const user = auth().currentUser;
    if (!user) {
      setLoading(false);
      return;
    }

    const unsubscribe = listenDocuments(user.uid, (docs) => {
      setDocuments(docs);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleDelete = (document) => {
    Alert.alert(
      "Evrağı Sil",
      `'${document.name}' adlı evrağı kalıcı olarak silmek istediğinizden emin misiniz?`,
      [
        { text: "Vazgeç", style: "cancel" },
        {
          text: "Sil",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteDocument(auth().currentUser.uid, document);
            } catch (error) {
              console.error("Silme hatası: ", error);
              Alert.alert("Hata", "Evrak silinirken bir sorun oluştu.");
            }
          },
        },
      ]
    );
  };

  const renderItem = ({ item, index }) => {
    const getFileIcon = (fileName) => {
      const extension = fileName.split(".").pop().toLowerCase();
      switch (extension) {
        case "pdf":
          return "file-pdf-box";
        case "doc":
        case "docx":
          return "file-word-box";
        case "xls":
        case "xlsx":
          return "file-excel-box";
        case "jpg":
        case "jpeg":
        case "png":
          return "file-image-box";
        default:
          return "file-document-outline";
      }
    };

    return (
      <Animated.View entering={FadeInDown.duration(500).delay(index * 100)}>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => item.downloadURL && Linking.openURL(item.downloadURL)}
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
              styles.iconContainer,
              { backgroundColor: `${theme.primary}1A` },
            ]}
          >
            <Icon
              name={getFileIcon(item.name)}
              size={30}
              color={theme.primary}
            />
          </View>

          <View style={styles.contentSection}>
            <Text
              numberOfLines={1}
              style={[styles.itemName, { color: theme.color }]}
            >
              {item.name}
            </Text>
            <Text style={[styles.itemDate, { color: theme.subtleText }]}>
              {item.createdAt
                ? moment(item.createdAt.toDate()).format("LL")
                : ""}
            </Text>
          </View>

          <TouchableOpacity
            onPress={() => handleDelete(item)}
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
        name="file-multiple-outline"
        size={80}
        color={`${theme.subtleText}80`}
      />
      <Text style={[styles.emptyText, { color: theme.subtleText }]}>
        Henüz hiç evrak yüklenmemiş.
      </Text>
      <Text style={[styles.emptySubText, { color: theme.subtleText }]}>
        Yeni bir tane yüklemek için + düğmesine dokunun.
      </Text>
    </Animated.View>
  );

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: theme.backgroundColor }]}
    >
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: theme.color }]}>
          Evraklarım
        </Text>
      </View>

      {loading ? (
        <ActivityIndicator
          size="large"
          color={theme.primary}
          style={{ flex: 1 }}
        />
      ) : (
        <FlatList
          data={documents}
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
          onPress={() => navigation.navigate("UploadDocument")}
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
  iconContainer: {
    padding: 20,
    borderTopLeftRadius: 16,
    borderBottomLeftRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  contentSection: {
    flex: 1,
    paddingHorizontal: 16,
  },
  itemName: {
    fontSize: 16,
    fontWeight: "600",
  },
  itemDate: {
    fontSize: 13,
    marginTop: 4,
  },
  deleteButton: {
    padding: 20,
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

export default DocumentsScreen;
