import React, { useState, useEffect } from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity, Text, TouchableWithoutFeedback, Keyboard } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface NotesScreenProps {
  patternId: string;
}

const NotesScreen: React.FC<NotesScreenProps> = ({ patternId }) => {
  const [note, setNote] = useState('');

  useEffect(() => {
    loadNote();
  }, []);

  const loadNote = async () => {
    try {
      const savedNote = await AsyncStorage.getItem(`note_${patternId}`);
      if (savedNote) {
        setNote(savedNote);
      }
    } catch (error) {
      console.error('加载笔记失败:', error);
    }
  };

  const handleSave = async () => {
    try {
      await AsyncStorage.setItem(`note_${patternId}`, note);
    } catch (error) {
      console.error('保存笔记失败:', error);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
        <TextInput
          style={styles.input}
          multiline
          value={note}
          onChangeText={setNote}
          placeholder="在这里输入笔记..."
          textAlignVertical="top"
        />
        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>save</Text>
        </TouchableOpacity>
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
  },
  input: {
    height: 400,  // 添加固定高度
    backgroundColor: '#fff',
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 8,
    marginBottom: 16,
  },
  saveButton: {
    backgroundColor: '#E5E5E5',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    color: '#000',
  },
});

export default NotesScreen; 