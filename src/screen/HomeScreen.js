import { StyleSheet, Text, View } from 'react-native'
import React from 'react'

const HomeScreen = () => {
  return (
    <View style={styles.container}>
      <Text>HomeScreen</Text>
    </View>
  )
}

export default HomeScreen

const styles = StyleSheet.create({


   container: {
   flex: 1,
    padding: 10,
    marginTop: 40,
    alignItems: 'center',
  },
})