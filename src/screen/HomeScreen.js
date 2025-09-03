import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Animated,
  Easing,
  SafeAreaView,
} from "react-native";
import { useSelector, useDispatch } from "react-redux";
import Octicons from "react-native-vector-icons/Octicons";
import { toggleTheme } from "../store/themeSlice";

const HomeScreen = () => {
  const { theme, colorScheme } = useSelector((state) => state.theme);
  const dispatch = useDispatch();
  const spinAnim = useRef(new Animated.Value(0)).current; 
  const fadeAnim = useRef(new Animated.Value(0)).current; 

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      easing: Easing.out(Easing.exp),
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  const onToggle = () => {
    
    dispatch(toggleTheme());
    spinAnim.setValue(0);
    Animated.timing(spinAnim, {
      toValue: 1,
      duration: 500,
      easing: Easing.out(Easing.circle),
      useNativeDriver: true,
    }).start();
  };

  
  const spin = spinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  const styles = createStyle(theme);

  return (
    <SafeAreaView style={styles.container}>
      <Animated.View style={{ opacity: fadeAnim }}>
        <Text style={[styles.title, { color: theme.color }]}>HomeScreen</Text>
      </Animated.View>

      <Pressable onPress={onToggle} style={styles.button}>
        <Animated.View style={{ transform: [{ rotate: spin }] }}>
          <Octicons
            name={colorScheme === "dark" ? "moon" : "sun"}
            size={32}
            color={theme.color}
          />
        </Animated.View>
      </Pressable>
    </SafeAreaView>
  );
};

export default HomeScreen;

const createStyle = (theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      padding: 16,
      backgroundColor: theme.backgroundColor,
      alignItems: "center",
      justifyContent: "center",
    },
    title: {
      fontSize: 24,
      fontWeight: "600",
      marginBottom: 24,
    },
    button: {
      padding: 12,
      borderRadius: 30,
      backgroundColor: theme.buttonBg || "rgba(0,0,0,0.1)",
    },
  });
