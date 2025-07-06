import { StyleSheet, Text, View } from "react-native";
import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import HomeScreen from "../screen/HomeScreen";
import AppointmentsScreen from "../screen/AppointmentsScreen";
import DocumentsScreen from "../screen/DocumentsScreen";
import ProfileScreen from "../screen/ProfileScreen";

const Tab = createBottomTabNavigator();

const AppTabs = () => {
  return (
    <Tab.Navigator screenOptions={{headerShown:false, tabBarStyle: { height:60} }}>
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Icon name="home" color={color} size={size} />
          ),
          tabBarLabel: "Anasayfa",
        }}
      />
      <Tab.Screen
        name="Appointments"
        component={AppointmentsScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Icon name="calendar-month" color={color} size={size} />
          ),
          tabBarLabel: "Randevular ",
        }}
      />
      <Tab.Screen
        name="Documents"
        component={DocumentsScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Icon name="file-document" color={color} size={size} />
          ),
          tabBarLabel: "Evraklar",
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Icon name="account" color={color} size={size} />
          ),
          tabBarLabel: "Profil",
        }}
      />
    </Tab.Navigator>
  );
};

export default AppTabs;

const styles = StyleSheet.create({});
