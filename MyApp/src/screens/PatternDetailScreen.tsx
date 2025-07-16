import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, Dimensions, KeyboardAvoidingView, Platform } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { 
  GestureHandlerRootView, 
  PinchGestureHandler, 
  PanGestureHandler,
  PinchGestureHandlerEventPayload,
  PanGestureHandlerEventPayload,
  GestureEvent
} from 'react-native-gesture-handler';
import Animated, { 
  useAnimatedGestureHandler, 
  useAnimatedStyle, 
  useSharedValue, 
  withSpring,
  runOnJS
} from 'react-native-reanimated';
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

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const HEADER_HEIGHT = 96; // 顶部导航栏高度
const COUNTER_PANEL_HEIGHT = 120; // CounterPanel 高度
const SAFE_AREA_BOTTOM = 38; // 底部安全区高度
const CONTENT_HEIGHT = screenHeight - HEADER_HEIGHT - COUNTER_PANEL_HEIGHT + SAFE_AREA_BOTTOM;

type PinchContext = {
  startScale: number;
};

type PanContext = {
  startX: number;
  startY: number;
};

type SwipeContext = {
  startX: number;
};

const PatternDetailScreen: React.FC<Props> = ({ navigation, route }) => {
  const { id, images, projectName, needleSize } = route.params;
  const [activeTab, setActiveTab] = useState<TabType>('pattern');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [counterPanelState, setCounterPanelState] = useState<CounterPanelState>('partial');
  
  // 缩放相关的动画值
  const scale = useSharedValue(1);
  const savedScale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const savedTranslateX = useSharedValue(0);
  const savedTranslateY = useSharedValue(0);

  // 缩放手势处理
  const pinchHandler = useAnimatedGestureHandler<GestureEvent<PinchGestureHandlerEventPayload>, PinchContext>({
    onStart: (_, context) => {
      context.startScale = scale.value;
    },
    onActive: (event, context) => {
      // 限制最大缩放比例为3倍
      const newScale = Math.min(context.startScale * event.scale, 3);
      const previousScale = scale.value;
      scale.value = Math.max(1, newScale);
      
      // 如果缩放回到1，自动居中
      if (previousScale > 1 && scale.value === 1) {
        translateX.value = withSpring(0);
        translateY.value = withSpring(0);
      }
    },
    onEnd: () => {
      if (scale.value < 1) {
        scale.value = withSpring(1);
        translateX.value = withSpring(0);
        translateY.value = withSpring(0);
      }
      savedScale.value = scale.value;
    },
  });

  // 平移手势处理
  const panHandler = useAnimatedGestureHandler<GestureEvent<PanGestureHandlerEventPayload>, PanContext>({
    onStart: (_, context) => {
      context.startX = translateX.value;
      context.startY = translateY.value;
    },
    onActive: (event, context) => {
      if (scale.value > 1) {
        // 计算最大可移动距离
        const maxX = (screenWidth * (scale.value - 1)) / 2;
        const maxY = (screenHeight * 0.8 * (scale.value - 1)) / 2;

        // 计算新的位置
        let newX = context.startX + event.translationX;
        let newY = context.startY + event.translationY;

        // 限制在边界内
        newX = Math.min(Math.max(newX, -maxX), maxX);
        newY = Math.min(Math.max(newY, -maxY), maxY);

        translateX.value = newX;
        translateY.value = newY;
      } else {
        // 如果缩放比例为1，强制居中
        translateX.value = withSpring(0);
        translateY.value = withSpring(0);
      }
    },
    onEnd: () => {
      if (scale.value === 1) {
        // 如果缩放比例为1，确保图片居中
        translateX.value = withSpring(0);
        translateY.value = withSpring(0);
      }
      savedTranslateX.value = translateX.value;
      savedTranslateY.value = translateY.value;
    },
  });

  // 动画样式
  const animatedImageStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { scale: scale.value },
      ],
    };
  });
  
  // 初始化计数器数据
  const [counters, setCounters] = useState<Counter[]>([]);
  const savingRef = useRef(false);

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
    if (savingRef.current) return;
    savingRef.current = true;
    try {
      await CounterDB.saveCounters(id, counters);
    } catch (error) {
      console.error('Failed to save counters:', error);
    } finally {
      savingRef.current = false;
    }
  };

  // 滑动切换图片手势处理
  const swipeHandler = useAnimatedGestureHandler<GestureEvent<PanGestureHandlerEventPayload>, SwipeContext>({
    onStart: (_, context) => {
      context.startX = translateX.value;
    },
    onActive: (event, context) => {
      if (scale.value <= 1) {
        translateX.value = context.startX + event.translationX;
      }
    },
    onEnd: (event) => {
      if (scale.value <= 1) {
        const swipeThreshold = 50;
        if (event.translationX > swipeThreshold && currentImageIndex > 0) {
          runOnJS(setCurrentImageIndex)(currentImageIndex - 1);
        } else if (event.translationX < -swipeThreshold && currentImageIndex < images.length - 1) {
          runOnJS(setCurrentImageIndex)(currentImageIndex + 1);
        }
        translateX.value = withSpring(0);
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
            <GestureHandlerRootView style={styles.imageContainer}>
              <PanGestureHandler onGestureEvent={swipeHandler}>
                <Animated.View style={styles.imageContainer}>
                  <PanGestureHandler onGestureEvent={panHandler}>
                    <Animated.View style={styles.imageContainer}>
                      <PinchGestureHandler onGestureEvent={pinchHandler}>
                        <Animated.Image 
                          source={{ uri: images[currentImageIndex] }} 
                          style={[styles.patternImage, animatedImageStyle]}
                          resizeMode="contain"
                        />
                      </PinchGestureHandler>
                    </Animated.View>
                  </PanGestureHandler>
                </Animated.View>
              </PanGestureHandler>
            </GestureHandlerRootView>
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
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      <View style={styles.innerContainer}>
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
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  innerContainer: {
    flex: 1,
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
    height: CONTENT_HEIGHT,
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
    overflow: 'hidden',
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