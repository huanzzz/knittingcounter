import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert } from 'react-native';
import { Input, Button } from '../design-system';
import { AddRowCounterForm, RowCounter } from './CounterTypes';

interface AddRowCounterProps {
  onAdd: (counter: RowCounter) => void;
  onCancel: () => void;
}

const AddRowCounter: React.FC<AddRowCounterProps> = ({ onAdd, onCancel }) => {
  const [form, setForm] = useState<AddRowCounterForm>({
    name: '',
    startRow: '1',
    endRow: '',
  });

  const handleStartRowChange = (value: string) => {
    // 只允许数字输入
    const numericValue = value.replace(/[^0-9]/g, '');
    setForm(prev => ({ ...prev, startRow: numericValue }));
  };

  const handleEndRowChange = (value: string) => {
    // 只允许数字输入
    const numericValue = value.replace(/[^0-9]/g, '');
    setForm(prev => ({ ...prev, endRow: numericValue }));
  };

  const validateForm = (): boolean => {
    const startValue = parseInt(form.startRow);
    const endValue = form.endRow ? parseInt(form.endRow) : null;

    if (startValue <= 0) {
      Alert.alert('错误', '起始值必须大于0');
      return false;
    }

    if (endValue !== null) {
      if (endValue <= 0) {
        Alert.alert('错误', '结束值必须大于0');
        return false;
      }
      if (endValue <= startValue) {
        Alert.alert('错误', '结束值必须大于起始值');
        return false;
      }
    }

    return true;
  };

  const handleAdd = () => {
    if (!validateForm()) return;

    const newCounter: RowCounter = {
      id: Date.now().toString(),
      name: form.name,
      type: 'row',
      currentRow: parseInt(form.startRow),
      startRow: parseInt(form.startRow),
      endRow: form.endRow ? parseInt(form.endRow) : 999,
    };

    onAdd(newCounter);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onCancel} style={styles.closeBtn}>
          <Text style={styles.closeText}>×</Text>
        </TouchableOpacity>
        
        <Button
          variant="primary"
          size="small"
          title="add"
          onPress={handleAdd}
          style={styles.addBtn}
        />
      </View>

      <View style={styles.form}>
        <View style={styles.nameSection}>
          <Input
            variant="underline"
            size="small"
            value={form.name}
            onChangeText={(value) => setForm(prev => ({ ...prev, name: value }))}
            placeholder="name"
            keyboardType="default"
            style={styles.nameInput}
          />
        </View>

        <View style={styles.valuesSection}>
          <View style={styles.valueGroup}>
            <View style={styles.inputRow}>
              <Text style={styles.label}>start</Text>
              <View style={styles.valueInput}>
                <TextInput
                  value={form.startRow}
                  onChangeText={handleStartRowChange}
                  keyboardType="numeric"
                  style={styles.inputText}
                  textAlign="center"
                />
              </View>
            </View>
          </View>

          <View style={styles.valueGroup}>
            <View style={styles.inputRow}>
              <Text style={styles.label}>end</Text>
              <View style={styles.valueInput}>
                <TextInput
                  value={form.endRow}
                  onChangeText={handleEndRowChange}
                  keyboardType="numeric"
                  style={styles.inputText}
                  textAlign="center"
                />
              </View>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 0,
    maxHeight: 300,
    marginTop: -10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 0,
    paddingLeft: 12,
    paddingRight: 12,
    paddingTop: 0,
  },
  closeBtn: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeText: {
    fontSize: 22,
    color: '#666',
    fontWeight: '300',
  },
  addBtn: {
    minWidth: 50,
  },
  form: {
    gap: 6,
    paddingHorizontal: 16,
    paddingBottom: 12,
    marginTop: -8,
  },
  nameSection: {
    width: '100%',
    marginBottom: 0,
  },
  nameInput: {
    width: '100%',
  },
  valuesSection: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginBottom: 0,
    marginTop: -4,
  },
  valueGroup: {
    alignItems: 'center',
  },
  label: {
    fontSize: 16,
    color: '#333',
    marginRight: 8,
    minWidth: 40,
  },
  valueInput: {
    width: 70,
    height: 50,
    backgroundColor: '#ddd',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputText: {
    fontSize: 20,
    color: '#333',
    fontWeight: '400',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});

export default AddRowCounter; 