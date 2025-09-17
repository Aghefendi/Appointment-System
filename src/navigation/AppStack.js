import React, { useContext, useState } from "react";
import { createStackNavigator } from "@react-navigation/stack";
import AddAppointmentScreen from "../screen/AddAppointmentScreen";
import EditScreen from "../screen/EditScreen";
import UploadDocumentScreen from "../screen/Document/UploadDocument";

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
        name="AddAppointment"
        component={AddAppointmentScreen}
        options={{
          headerShown: false,
          presentation: "modal",
          headerStyle: {
            alignItems: "center",
            height: 100,
          },
          headerTitleStyle: {
            fontWeight: "bold",
            color: "black",
          },
          headerTintColor: "black",
        }}
      />
      <Stack.Screen
        name="EditAppointment"
        component={EditScreen}
        options={{
          headerShown: false,
          title: "Randevuyu Düzenle",
          presentation: "modal",
        }}
      />
      <Stack.Screen
        name="UploadDocument"
        component={UploadDocumentScreen}
        options={{
          title: "Yeni Evrak Yükle",
          presentation: "modal",
          headerStyle: {
            alignItems: "center",
          },
        }}
      />
     
    </Stack.Navigator>
  );
};

export default AppStack;




