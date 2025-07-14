import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, Dimensions, PanResponder } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import CounterPanel from '../components/Counter/CounterPanel';
import { Counter, CounterPanelState } from '../components/Counter/CounterTypes';
import PicsContent from '../components/PicsContent';
import NotesScreen from './NotesScreen';
import { CounterDB } from '../utils/database';

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

type PatternDetailScreenNavigationProp = StackNavigationProp<RootStackParamList, 'PatternDetail'>;
type PatternDetailScreenRouteProp = RouteProp<RootStackParamList, 'PatternDetail'>;

type Props = {
  navigation: PatternDetailScreenNavigationProp;
  route: PatternDetailScreenRouteProp;
};

type TabType = 'pattern' | 'pics' | 'note';

const { width: screenWidth } = Dimensions.get('window');

const PatternDetailScreen: React.FC<Props> = ({ navigation, route }) => {
  const { id, images, projectName, needleSize } = route.params;
  const [activeTab, setActiveTab] = useState<TabType>('pattern');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [counterPanelState, setCounterPanelState] = useState<CounterPanelState>('partial');
  
  // 初始化计数器数据
  const [counters, setCounters] = useState<Counter[]>([]);

  // 加载计数器数据
  useEffect(() => {
    loadCounters();
  }, []);

  // 保存计数器数据
  useEffect(() => {
    saveCounters();
  }, [counters]);

  const loadCounters = async () => {
    try {
      const savedCounters = await CounterDB.getCounters(id);
      if (savedCounters.length > 0) {
        setCounters(savedCounters);
      } else {
        // 如果没有保存的计数器，创建一个默认的
        setCounters([{
          id: Date.now().toString(),
          name: '',
          type: 'row',
          currentRow: 1,
          startRow: 1,
          endRow: 100,
        }]);
      }
    } catch (error) {
      console.error('Failed to load counters:', error);
    }
  };

  const saveCounters = async () => {
    try {
      await CounterDB.saveCounters(id, counters);
    } catch (error) {
      console.error('Failed to save counters:', error);
    }
  };

  // 图片轮播的PanResponder
  const imagePanResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: (evt, gestureState) => {
      return Math.abs(gestureState.dx) > 10;
    },
    onPanResponderRelease: (evt, gestureState) => {
      const { dx } = gestureState;
      
      if (dx > 50 && currentImageIndex > 0) {
        // 向右滑动，上一张
        setCurrentImageIndex(currentImageIndex - 1);
      } else if (dx < -50 && currentImageIndex < images.length - 1) {
        // 向左滑动，下一张
        setCurrentImageIndex(currentImageIndex + 1);
      }
    },
  });

  const handleCounterUpdate = (updatedCounter: Counter) => {
    setCounters(prev => 
      prev.map(counter => 
        counter.id === updatedCounter.id ? updatedCounter : counter
      )
    );
  };

  const handleCounterAdd = (newCounter: Counter) => {
    setCounters(prev => [...prev, newCounter]);
  };

  const handleCounterDelete = (id: string) => {
    setCounters(prev => prev.filter(counter => counter.id !== id));
  };

  const handleCounterReorder = (fromIndex: number, toIndex: number) => {
    setCounters(prev => {
      // 边界检查和修正
      const clampedToIndex = Math.max(0, Math.min(toIndex, prev.length - 1));
      
      // 如果位置没有实际变化，不进行重排序
      if (fromIndex === clampedToIndex) {
        return prev;
      }
      
      const newCounters = [...prev];
      const [moved] = newCounters.splice(fromIndex, 1);
      newCounters.splice(clampedToIndex, 0, moved);
      return newCounters;
    });
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'pattern':
        return (
          <View style={styles.patternContent}>
            {/* 页码显示 */}
            <View style={styles.pageIndicator}>
              <Text style={styles.pageText}>{currentImageIndex + 1}/{images.length}</Text>
            </View>
            
            {/* 图片轮播 */}
            <View {...imagePanResponder.panHandlers} style={styles.imageContainer}>
              <Image 
                source={{ uri: images[currentImageIndex] }} 
                style={styles.patternImage}
                resizeMode="contain"
              />
            </View>
          </View>
        );
      
      case 'pics':
        return (
          <PicsContent patternId={id} />
        );
      
      case 'note':
        return (
          <NotesScreen patternId={id} />
        );
      
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      {/* 顶部导航 */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.navigate('Home')} style={styles.backBtn}>
          <Text style={styles.closeIcon}>×</Text>
        </TouchableOpacity>
        
        {/* 标签导航 */}
        <View style={styles.tabContainer}>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'pattern' && styles.activeTab]}
            onPress={() => setActiveTab('pattern')}
          >
            <Text style={[styles.tabText, activeTab === 'pattern' && styles.activeTabText]}>
              pattern
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'pics' && styles.activeTab]}
            onPress={() => setActiveTab('pics')}
          >
            <Text style={[styles.tabText, activeTab === 'pics' && styles.activeTabText]}>
              pics
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'note' && styles.activeTab]}
            onPress={() => setActiveTab('note')}
          >
            <Text style={[styles.tabText, activeTab === 'note' && styles.activeTabText]}>
              note
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* 内容区域 */}
      <View style={styles.content}>
        {renderTabContent()}
      </View>

      {/* 计数器面板 */}
      <CounterPanel
        counters={counters}
        panelState={counterPanelState}
        onPanelStateChange={setCounterPanelState}
        onCounterUpdate={handleCounterUpdate}
        onCounterAdd={handleCounterAdd}
        onCounterDelete={handleCounterDelete}
        onCounterReorder={handleCounterReorder}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 40,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  backBtn: {
    marginRight: 16,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeIcon: {
    fontSize: 32,
    color: '#222',
    fontWeight: '300',
    lineHeight: 32,
  },
  tabContainer: {
    flexDirection: 'row',
    flex: 1,
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 16,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#222',
  },
  tabText: {
    fontSize: 18,
    color: '#999',
  },
  activeTabText: {
    color: '#222',
    fontWeight: '500',
  },
  content: {
    flex: 1,
  },
  patternContent: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  pageIndicator: {
    position: 'absolute',
    top: 20,
    left: 20,
    zIndex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  pageText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  imageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  patternImage: {
    width: screenWidth,
    height: '80%',
  },
  noteContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  placeholderText: {
    fontSize: 18,
    color: '#999',
    marginBottom: 20,
  },
  addNoteBtn: {
    backgroundColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  addNoteText: {
    fontSize: 16,
    color: '#666',
  },
});

export default PatternDetailScreen; 