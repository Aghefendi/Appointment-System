import { StyleSheet } from "react-native";

const themeStyle = StyleSheet.create({
  light: {
    backgroundColor: "#F5F5F7",
    color: "#000",
    cardBackground: "#fff",
    subtleText: "#666",
    primary: "#007AFF",
    success: "#34C759",
    shadowColor: "#000",
    buttonText: "#fff",
  },
  dark: {
    backgroundColor: "#121212",
    color: "#fff",
    cardBackground: "#1e1e1e",
    subtleText: "#aaaaaa",
    primary: "#0A84FF",
    success: "#30D158",
    shadowColor: "#000",
    buttonText: "#fff",
  },
});

export default themeStyle;
