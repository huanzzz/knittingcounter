import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useFocusEffect } from '@react-navigation/native';
import { Pattern } from '../types/Pattern';
import { PatternStorage } from '../utils/PatternStorage';

type RootStackParamList = {
  Home: undefined;
  AddPattern: undefined;
  PatternDetail: { 
    id: string;
    images: string[];
    projectName: string;
    needleSize: string;
  };
  EditPatternName: { 
    images: string[];
  };
};

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Home'>;

type Props = {
  navigation: HomeScreenNavigationProp;
};

const HomeScreen: React.FC<Props> = ({ navigation }) => {
  const [patterns, setPatterns] = useState<Pattern[]>([]);
  const [loading, setLoading] = useState(true);

  // 每次页面获得焦点时重新加载数据
  useFocusEffect(
    React.useCallback(() => {
      loadPatterns();
    }, [])
  );

  const loadPatterns = async () => {
    try {
      setLoading(true);
      console.log('Loading patterns...');
      const data = await PatternStorage.getAll();
      console.log('Loaded patterns:', data.length);
      setPatterns(data);
    } catch (error) {
      console.error('Failed to load patterns:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#666" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={patterns}
        keyExtractor={item => item.id}
        numColumns={2}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>还没有任何编织图解</Text>
            <Text style={styles.emptySubText}>点击底部按钮添加新图解</Text>
          </View>
        )}
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={styles.card} 
            onPress={() => navigation.navigate('PatternDetail', {
              id: item.id,
              images: item.images,
              projectName: item.projectName,
              needleSize: item.needleSize
            })}
          >
            <Image 
              source={{ uri: item.images[0] }} 
              style={styles.cover}
            />
            <Text style={styles.cardTitle}>{item.name}</Text>
          </TouchableOpacity>
        )}
      />
      <View style={styles.addPatternBar}>
        <TouchableOpacity 
          style={styles.addPatternBtn} 
          onPress={() => navigation.navigate('AddPattern')}
        >
          <Text style={styles.addPatternText}>new pattern</Text>
          <View style={styles.addIcon}>
            <Text style={{fontSize:24}}>＋</Text>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f7f7',
    paddingTop: 40,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#f7f7f7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    paddingTop: 100,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
    marginBottom: 8,
  },
  emptySubText: {
    fontSize: 14,
    color: '#999',
  },
  listContent: {
    padding: 16,
    paddingBottom: 100,
    minHeight: '100%',
  },
  card: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    margin: 8,
    alignItems: 'center',
    padding: 8,
    minHeight: 180,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  cover: {
    width: 120,
    height: 150,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
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
    backgroundColor: '#fff',
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