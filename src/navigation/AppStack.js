import { Button, StyleSheet, Text, View } from "react-native";
import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import AppointmentDetailScreen from "../screen/AppointmentDetailScreen";

import AppTabs from "./AppTabs";

const Stack = createStackNavigator();

const AppStack = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Maintab"
        component={AppTabs}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="AppointmentDetailScreen"
        component={AppointmentDetailScreen}
        options={{ title: "Randevu Detay" }}
      />
    </Stack.Navigator>
  );
};

export default AppStack;
