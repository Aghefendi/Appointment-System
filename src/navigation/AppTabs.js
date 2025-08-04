import React, { useEffect, useRef } from "react";
import { StyleSheet, Animated } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

import HomeScreen from "../screen/HomeScreen";
import AppointmentsScreen from "../screen/AppointmentsScreen";
import DocumentsScreen from "../screen/DocumentsScreen";
import ProfileScreen from "../screen/ProfileScreen";

// 1) Ortak Animated Icon bileşeni
const TabBarIcon = ({ name, color, size, focused }) => {
  const scale = useRef(new Animated.Value(focused ? 1.2 : 1)).current;

  useEffect(() => {
    Animated.spring(scale, {
      toValue: focused ? 1.2 : 1,
      friction: 6,
      tension: 200,
      useNativeDriver: true,
    }).start();
  }, [focused]);

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <Icon name={name} color={color} size={size} />
    </Animated.View>
  );
};

const Tab = createBottomTabNavigator();

const AppTabs = () => (
  <Tab.Navigator
    screenOptions={{
      headerShown: false,
      tabBarStyle: { height: 60 },
      // 2) Tüm tab’larda aynı animasyonu uygula
      tabBarActiveTintColor: "#007AFF",
      tabBarInactiveTintColor: "#8e8e93",
    }}
  >
    <Tab.Screen
      name="Home"
      component={HomeScreen}
      options={{
        tabBarLabel: "Anasayfa",
        tabBarIcon: ({ color, size, focused }) => (
          <TabBarIcon name="home" color={color} size={size} focused={focused} />
        ),
      }}
    />
    <Tab.Screen
      name="Appointments"
      component={AppointmentsScreen}
      options={{
        tabBarLabel: "Randevular",
        tabBarIcon: ({ color, size, focused }) => (
          <TabBarIcon
            name="calendar-month"
            color={color}
            size={size}
            focused={focused}
          />
        ),
      }}
    />
    <Tab.Screen
      name="Documents"
      component={DocumentsScreen}
      options={{
        tabBarLabel: "Evraklar",
        tabBarIcon: ({ color, size, focused }) => (
          <TabBarIcon
            name="file-document"
            color={color}
            size={size}
            focused={focused}
          />
        ),
      }}
    />
    <Tab.Screen
      name="Profile"
      component={ProfileScreen}
      options={{
        tabBarLabel: "Profil",
        tabBarIcon: ({ color, size, focused }) => (
          <TabBarIcon
            name="account"
            color={color}
            size={size}
            focused={focused}
          />
        ),
      }}
    />
  </Tab.Navigator>
);

export default AppTabs;
