import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

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
        <TouchableOpacity style={styles.menuItem} onPress={onSelectRowCounter}>
          <Text style={styles.menuText}>+ row counter</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.menuItem} onPress={onSelectShapeCounter}>
          <Text style={styles.menuText}>+ shape counter</Text>
        </TouchableOpacity>
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
  menuItems: {
    gap: 8,
    paddingHorizontal: 12,
    paddingBottom: 8,
  },
  menuItem: {
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  menuText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
});

export default AddCounterMenu; 