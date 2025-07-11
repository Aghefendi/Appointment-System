import { Button, StyleSheet, Text, View } from "react-native";
import React from "react";
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
          title: "Yeni Randevu Ekle", // Ekranın başlığı
          presentation: "modal", // Ekranın alttan açılması için (şık bir görünüm)
          headerStyle: {
            alignItems: "center", // Başlık metnini ortalamak için

            height: 100, // Başlık yüksekliği
          },
          headerTitleStyle: {
            fontWeight: "bold", // Başlık metnini kalın yapmak için
            color: "black", // Başlık metni rengi
          },
          headerTintColor: "black", // Başlık metni ve geri düğmesi rengi
        }}
      />
      <Stack.Screen
        name="EditAppointment"
        component={EditScreen}
        options={{
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
        }}
      />
      {/* Diğer ekranlarınızı buraya ekleyebilirsiniz */}
    </Stack.Navigator>
  );
};

export default AppStack;
