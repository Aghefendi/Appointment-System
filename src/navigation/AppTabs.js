import React, { useEffect } from "react";
import { View, StyleSheet, Text } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  Easing,
} from "react-native-reanimated";
import { useSelector } from "react-redux";
import HapticFeedback from "react-native-haptic-feedback"; // Dokunsal geri bildirim için

// Ekranlar (Kendi dosya yollarınıza göre düzenleyin)
import HomeScreen from "../screen/HomeScreen";
import AppointmentsScreen from "../screen/AppointmentsScreen";
import DocumentsScreen from "../screen/DocumentsScreen";
import ProfileScreen from "../screen/ProfileScreen";

const Tab = createBottomTabNavigator();

// --- Yeniden Kullanılabilir ve Animatik Tab İkon Bileşeni ---
const CustomTabBarIcon = ({ name, label, focused, color, activeColor }) => {
  // Animasyon değerleri
  const scale = useSharedValue(focused ? 1.0 : 0.9);
  const translateY = useSharedValue(focused ? -5 : 0);
  const labelOpacity = useSharedValue(focused ? 1 : 0);

  // 'focused' durumu değiştiğinde animasyonları tetikle
  useEffect(() => {
    if (focused) {
      HapticFeedback.trigger("impactLight", { enableVibrateFallback: true });
    }

    // Spring (yay) animasyonu ile daha canlı bir etki
    scale.value = withSpring(focused ? 1.0 : 0.9, {
      damping: 15,
      stiffness: 150,
    });
    translateY.value = withSpring(focused ? -5 : 0, {
      damping: 15,
      stiffness: 150,
    });

    // Timing animasyonu ile daha pürüzsüz geçişler
    labelOpacity.value = withTiming(focused ? 1 : 0, {
      duration: 250,
      easing: Easing.out(Easing.ease),
    });
  }, [focused]);

  // Animatik stil tanımlamaları
  const containerAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }, { translateY: translateY.value }],
  }));

  const labelAnimatedStyle = useAnimatedStyle(() => ({
    opacity: labelOpacity.value,
  }));

  return (
    <Animated.View style={[styles.tabItemContainer, containerAnimatedStyle]}>
      <View
        style={[
          styles.iconContainer,
          focused && { backgroundColor: `${activeColor}20` },
        ]}
      >
        <Icon name={name} color={color} size={28} />
      </View>
      <Animated.Text
        numberOfLines={1}
        style={[styles.label, { color: activeColor }, labelAnimatedStyle]}
      >
        {label}
      </Animated.Text>
    </Animated.View>
  );
};

// --- Ana Tab Navigator Bileşeni ---
const AppTabs = () => {
  const theme = useSelector((state) => state.theme.theme);

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarActiveTintColor: theme.primary || "#007AFF",
        tabBarInactiveTintColor: theme.subtleText || "#8e8e93",
        tabBarStyle: {
          height: 50, // Yüksekliği artırarak daha ferah bir alan yarattım
          backgroundColor: theme.cardBackground || "#fff",
          borderTopWidth: 11,
          borderTopColor: `${theme.shadowColor}1A` || "#0000001A",
          //  elevation: 10,
          shadowColor: theme.shadowColor || "#000",
          shadowOffset: { width: 0, height: -5 },
          shadowOpacity: 0.05,
          shadowRadius: 10,
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ focused, color }) => (
            <CustomTabBarIcon
              name="home-variant"
              label="Anasayfa"
              focused={focused}
              color={color}
              activeColor={theme.primary}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Appointments"
        component={AppointmentsScreen}
        options={{
          tabBarIcon: ({ focused, color }) => (
            <CustomTabBarIcon
              name="calendar-month-outline"
              label="Randevular"
              focused={focused}
              color={color}
              activeColor={theme.primary}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Documents"
        component={DocumentsScreen}
        options={{
          tabBarIcon: ({ focused, color }) => (
            <CustomTabBarIcon
              name="file-document-outline"
              label="Evraklar"
              focused={focused}
              color={color}
              activeColor={theme.primary}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ focused, color }) => (
            <CustomTabBarIcon
              name="account-circle-outline"
              label="Profil"
              focused={focused}
              color={color}
              activeColor={theme.primary}
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  tabItemContainer: {
    alignItems: "center",
    justifyContent: "center",
    width: 80,
    height: 60,
    borderRadius: 30,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 5,
  },
  label: {
    fontSize: 12,
    fontWeight: "600",
    marginTop: 10, // İkon ile yazı arasına boşluk koydum
  },
});

export default AppTabs;

// **Önemli Not:**
// Bu kodun çalışması için projenizde aşağıdaki kütüphanelerin kurulu olması gerekmektedir:
// - `react-native-reanimated`
// - `react-native-vector-icons`
// - `@react-navigation/bottom-tabs`
// - `react-native-haptic-feedback` (npm install react-native-haptic-feedback)
