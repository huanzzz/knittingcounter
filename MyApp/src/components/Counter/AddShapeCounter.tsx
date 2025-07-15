import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { Input, Button } from '../design-system';
import { AddShapeCounterForm, ShapeCounter } from './CounterTypes';

interface AddShapeCounterProps {
  onAdd: (counter: ShapeCounter) => void;
  onCancel: () => void;
}

const AddShapeCounter: React.FC<AddShapeCounterProps> = ({ onAdd, onCancel }) => {
  const [form, setForm] = useState<AddShapeCounterForm>({
    name: '',
    times: '1',
    rows: '1',
    isLinked: true,
  });

  const handleTimesChange = (value: string) => {
    // 只允许数字输入
    const numericValue = value.replace(/[^0-9]/g, '');
    setForm(prev => ({ ...prev, times: numericValue }));
  };

  const handleRowsChange = (value: string) => {
    // 只允许数字输入
    const numericValue = value.replace(/[^0-9]/g, '');
    setForm(prev => ({ ...prev, rows: numericValue }));
  };

  const toggleLinked = () => {
    setForm(prev => ({ ...prev, isLinked: !prev.isLinked }));
  };

  const validateForm = (): boolean => {
    const timesValue = parseInt(form.times);
    const rowsValue = parseInt(form.rows);

    if (timesValue <= 0) {
      Alert.alert('错误', 'Times值必须大于0');
      return false;
    }

    if (rowsValue <= 0) {
      Alert.alert('错误', 'Rows值必须大于0');
      return false;
    }

    return true;
  };

  const handleAdd = () => {
    if (!validateForm()) return;

    const newCounter: ShapeCounter = {
      id: Date.now().toString(),
      name: form.name,
      type: 'shape',
      currentTimes: 1, // 从1开始
      maxTimes: parseInt(form.times),
      currentRows: 1, // 从1开始
      maxRows: parseInt(form.rows),
      isLinked: form.isLinked,
    };

    onAdd(newCounter);
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
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
                <Text style={styles.label}>times</Text>
                <View style={styles.valueInput}>
                  <TextInput
                    value={form.times}
                    onChangeText={handleTimesChange}
                    keyboardType="number-pad"
                    returnKeyType="done"
                    style={styles.inputText}
                    textAlign="center"
                    selectTextOnFocus={true}
                  />
                </View>
              </View>
            </View>

            {/* 连接线 */}
            <TouchableOpacity onPress={toggleLinked} style={styles.linkContainer}>
              <View style={[styles.linkLine, !form.isLinked && styles.linkLineDisconnected]}>
                {form.isLinked ? (
                  <View style={styles.linkDot} />
                ) : (
                  <View style={styles.linkBreak} />
                )}
              </View>
            </TouchableOpacity>

            <View style={styles.valueGroup}>
              <View style={styles.inputRow}>
                <Text style={styles.label}>rows</Text>
                <View style={styles.valueInput}>
                  <TextInput
                    value={form.rows}
                    onChangeText={handleRowsChange}
                    keyboardType="number-pad"
                    returnKeyType="done"
                    style={styles.inputText}
                    textAlign="center"
                    selectTextOnFocus={true}
                  />
                </View>
              </View>
            </View>
          </View>
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 0,
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
  inputRow: {
    flexDirection: 'row',
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
    width: '100%',
    height: '100%',
  },
  linkContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 60,
    height: 60,
  },
  linkLine: {
    width: 40,
    height: 2,
    backgroundColor: '#333',
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  linkLineDisconnected: {
    backgroundColor: '#ddd',
  },
  linkDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#333',
    position: 'absolute',
  },
  linkBreak: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ddd',
    position: 'absolute',
  },
});

export default AddShapeCounter; 