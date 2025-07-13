import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';

type RootStackParamList = {
  Home: undefined;
  PatternDetail: { patternId: string };
  AddPattern: undefined;
};

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Home'>;

type Props = {
  navigation: HomeScreenNavigationProp;
};

const patterns = [
  { id: '1', name: '围巾图解', cover: 'https://via.placeholder.com/120x150?text=Cover1' },
  { id: '2', name: '毛衣图解', cover: 'https://via.placeholder.com/120x150?text=Cover2' },
  { id: '3', name: '帽子图解', cover: 'https://via.placeholder.com/120x150?text=Cover3' },
  { id: '4', name: '手套图解', cover: 'https://via.placeholder.com/120x150?text=Cover4' },
  { id: '5', name: '袜子图解', cover: 'https://via.placeholder.com/120x150?text=Cover5' },
  { id: '6', name: '披肩图解', cover: 'https://via.placeholder.com/120x150?text=Cover6' },
];

const HomeScreen: React.FC<Props> = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <FlatList
        data={patterns}
        keyExtractor={item => item.id}
        numColumns={2}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('PatternDetail', { patternId: item.id })}>
            <Image source={{ uri: item.cover }} style={styles.cover} />
            <Text style={styles.cardTitle}>{item.name}</Text>
          </TouchableOpacity>
        )}
      />
      <View style={styles.addPatternBar}>
        <TouchableOpacity style={styles.addPatternBtn} onPress={() => navigation.navigate('AddPattern')}>
          <Text style={styles.addPatternText}>new pattern</Text>
          <View style={styles.addIcon}><Text style={{fontSize:24}}>＋</Text></View>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f7f7',
  },
  listContent: {
    padding: 16,
    paddingBottom: 100,
  },
  card: {
    flex: 1,
    backgroundColor: '#ddd',
    borderRadius: 12,
    margin: 8,
    alignItems: 'center',
    padding: 8,
    minHeight: 180,
  },
  cover: {
    width: 120,
    height: 150,
    borderRadius: 8,
    backgroundColor: '#ccc',
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 16,
    color: '#333',
    marginTop: 4,
  },
  addPatternBar: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 24,
    backgroundColor: '#aaa',
    borderRadius: 20,
    padding: 8,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  addPatternBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 6,
  },
  addPatternText: {
    fontSize: 18,
    color: '#222',
    marginRight: 8,
  },
  addIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#222',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
});

export default HomeScreen; 