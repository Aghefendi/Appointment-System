import React from "react";
import { Modal, View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { FontAwesome } from "@expo/vector-icons";

const CustomAlert = ({
  visible,
  onClose,
  title,
  message,
  type = "info",
  buttons = [{ text: "Tamam" }],
}) => {
  const getIcon = () => {
    switch (type) {
      case "error":
        return (
          <FontAwesome
            name="times-circle"
            size={48}
            color="red"
            style={styles.icon}
          />
        );
      case "success":
        return (
          <FontAwesome
            name="check-circle"
            size={48}
            color="green"
            style={styles.icon}
          />
        );
      default:
        return (
          <FontAwesome
            name="info-circle"
            size={48}
            color="blue"
            style={styles.icon}
          />
        );
    }
  };

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={() => {}}
    >
      <View style={styles.overlay} pointerEvents="box-none">
        <View style={styles.card}>
          {getIcon()}
          {title && <Text style={styles.title}>{title}</Text>}
          <Text style={styles.message}>{message}</Text>
          {buttons.map((btn, index) => (
            <TouchableOpacity
              key={index}
              onPress={onClose}
              style={styles.button}
            >
              <Text style={styles.buttonText}>{btn.text}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.6)",
  },
  card: {
    width: "85%",
    maxWidth: 320,
    padding: 24,
    backgroundColor: "white",
    borderRadius: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 2, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 8,
  },
  icon: { marginBottom: 12 },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 8,
    textAlign: "center",
  },
  message: {
    fontSize: 18,
    color: "#333",
    lineHeight: 24,
    marginBottom: 24,
    textAlign: "center",
  },
  button: {
    backgroundColor: "#007AFF",
    paddingVertical: 14,
    borderRadius: 12,
    width: "100%",
    alignItems: "center",
    marginTop: 8,
  },
  buttonText: { color: "white", fontWeight: "600", fontSize: 16 },
});

export default CustomAlert;
