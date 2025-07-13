import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const NotesScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>笔记</Text>
      {/* 这里将来会显示笔记内容 */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
  },
});

export default NotesScreen; 