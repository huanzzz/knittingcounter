import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, ActivityIndicator, Alert } from 'react-native';
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
  const [longPressedId, setLongPressedId] = useState<string | null>(null);

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

  const handleLongPress = (id: string) => {
    setLongPressedId(id);
  };

  const handleCancelLongPress = () => {
    setLongPressedId(null);
  };

  const handleDeletePress = (id: string) => {
    Alert.alert(
      '',
      'sure?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
          onPress: handleCancelLongPress,
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await PatternStorage.delete(id);
              await loadPatterns();
              handleCancelLongPress();
            } catch (error) {
              console.error('Failed to delete pattern:', error);
              Alert.alert('Error', 'Failed to delete pattern');
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#666" />
      </View>
    );
  }

  const renderPattern = ({ item }: { item: Pattern }) => {
    const isLongPressed = item.id === longPressedId;

    const handleCardPress = () => {
      if (longPressedId) {
        // 如果有任何菜单打开，只取消菜单，不执行其他操作
        handleCancelLongPress();
        return;
      }
      // 只有在没有菜单打开的情况下，才导航到详情页面
      navigation.navigate('PatternDetail', {
        id: item.id,
        images: item.images,
        projectName: item.projectName,
        needleSize: item.needleSize
      });
    };

    return (
      <TouchableOpacity 
        style={[styles.card, isLongPressed && styles.cardPressed]} 
        onPress={handleCardPress}
        onLongPress={() => handleLongPress(item.id)}
        delayLongPress={500}
      >
        <Image 
          source={{ uri: item.images[0] }} 
          style={styles.cover}
        />
        <Text style={styles.cardTitle}>{item.name}</Text>
        
        {isLongPressed && (
          <TouchableOpacity 
            style={styles.menuOverlay}
            activeOpacity={1}
            onPress={handleCancelLongPress}
          >
            <TouchableOpacity 
              style={styles.menuButton}
              onPress={(e) => {
                e.stopPropagation();
                handleDeletePress(item.id);
              }}
            >
              <Text style={styles.menuButtonTextDelete}>delete</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.menuButton}
              onPress={handleCancelLongPress}
            >
              <Text style={styles.menuButtonText}>cancel</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <TouchableOpacity 
      style={styles.container}
      activeOpacity={1}
      onPress={handleCancelLongPress}
    >
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
        renderItem={renderPattern}
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
    </TouchableOpacity>
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
    position: 'relative',
  },
  cardPressed: {
    opacity: 0.8,
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
  menuOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  menuButton: {
    width: '100%',
    paddingVertical: 12,
    marginVertical: 4,
    backgroundColor: 'white',
    borderRadius: 8,
    alignItems: 'center',
  },
  menuButtonText: {
    fontSize: 16,
    color: '#333',
  },
  menuButtonTextDelete: {
    fontSize: 16,
    color: '#ff3b30',
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