import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Button } from '../design-system';

interface AddCounterMenuProps {
  onSelectRowCounter: () => void;
  onSelectShapeCounter: () => void;
  onClose: () => void;
}

const AddCounterMenu: React.FC<AddCounterMenuProps> = ({
  onSelectRowCounter,
  onSelectShapeCounter,
  onClose,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
          <Text style={styles.closeText}>×</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.menuItems}>
        <Button
          title="+ row counter"
          onPress={onSelectRowCounter}
          variant="primary"
          size="medium"
          style={styles.menuItem}
        />
        
        <Button
          title="+ shape counter"
          onPress={onSelectShapeCounter}
          variant="primary"
          size="medium"
          style={styles.menuItem}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 0,
    maxHeight: 150,
    marginTop: -10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginBottom: 0,
    paddingLeft: 12,
    paddingTop: 0,
  },
  closeBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeText: {
    fontSize: 30,
    color: '#666',
    fontWeight: '300',
  },
  menuItems: {
    gap: 16,
    paddingHorizontal: 12,
    paddingBottom: 8,
  },
  menuItem: {
    width: '100%',
  },
});

export default AddCounterMenu; 