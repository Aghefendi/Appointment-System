import React from "react";
import { View, ActivityIndicator, Text } from "react-native";
import Animated, { FadeInUp } from "react-native-reanimated";
import CustomButton from "./CustomButton";
import { FlashList } from "@shopify/flash-list";

const ListScreen = ({
  loading,
  data,
  renderItem,
  emptyMessage,
  onAddPress,
}) => {
  if (loading) {
    return <ActivityIndicator size="large" style={{ flex: 1 }} />;
  }

  return (
    <Animated.View
      entering={FadeInUp.duration(500)}
      style={{ flex: 1, padding: 10 }}
    >
      <CustomButton
        title={onAddPress?.title || "+ Yeni Ekle"}
        onPress={onAddPress?.handler}
      />
      {data.length === 0 ? (
        <Text style={{ textAlign: "center", marginTop: 50 }}>
          {emptyMessage}
        </Text>
      ) : (
        <FlashList
          data={data}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingTop: 20, paddingBottom: 30 }}
        />
      )}
    </Animated.View>
  );
};

export default ListScreen;
