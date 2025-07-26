import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, Dimensions, KeyboardAvoidingView, Platform } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
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
  
  // 移除调试日志
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

  // 添加保存图片索引的函数
  const saveLastViewedIndex = async (index: number) => {
    try {
      await AsyncStorage.setItem(`lastViewedIndex:${id}`, index.toString());
    } catch (error) {
      // 保留错误日志，这对生产环境的错误排查很重要
      console.error('保存最后查看的图片索引失败:', error);
    }
  };

  // 加载上次查看的图片索引
  useEffect(() => {
    const loadLastViewedIndex = async () => {
      try {
        const savedIndex = await AsyncStorage.getItem(`lastViewedIndex:${id}`);
        if (savedIndex !== null) {
          const index = parseInt(savedIndex, 10);
          // 确保索引在有效范围内
          if (index >= 0 && index < images.length) {
            setCurrentImageIndex(index);
          }
        }
      } catch (error) {
        // 保留错误日志
        console.error('加载最后查看的图片索引失败:', error);
      }
    };

    loadLastViewedIndex();
  }, [id, images.length]);

  // 当图片索引改变时保存
  useEffect(() => {
    saveLastViewedIndex(currentImageIndex);
  }, [currentImageIndex, id]);

  // 在组件卸载时保存当前索引
  useEffect(() => {
    return () => {
      saveLastViewedIndex(currentImageIndex);
    };
  }, [currentImageIndex, id]);

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

  // 添加图片相关的调试
  useEffect(() => {
    // console.log('图片数组:', images);
    // console.log('当前图片索引:', currentImageIndex);
    // console.log('当前图片 URI:', images[currentImageIndex]);
  }, [images, currentImageIndex]);

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

  // 添加切换图片的函数
  const handlePrevImage = () => {
    // console.log('点击上一张按钮');
    if (currentImageIndex > 0) {
      setCurrentImageIndex(currentImageIndex - 1);
      // 重置缩放和位置
      scale.value = withSpring(1);
      translateX.value = withSpring(0);
      translateY.value = withSpring(0);
    }
  };

  const handleNextImage = () => {
    // console.log('点击下一张按钮');
    if (currentImageIndex < images.length - 1) {
      setCurrentImageIndex(currentImageIndex + 1);
      // 重置缩放和位置
      scale.value = withSpring(1);
      translateX.value = withSpring(0);
      translateY.value = withSpring(0);
    }
  };

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
            
            {/* 图片区域和导航按钮的容器 */}
            <View style={styles.contentContainer}>
              {/* 图片区域 */}
              <GestureHandlerRootView style={styles.imageWrapper}>
                <PanGestureHandler onGestureEvent={panHandler}>
                  <Animated.View style={styles.imageWrapper}>
                    <PinchGestureHandler onGestureEvent={pinchHandler}>
                      <Animated.Image 
                        source={{ uri: images[currentImageIndex] }} 
                        style={[styles.patternImage, animatedImageStyle]}
                        resizeMode="contain"
                      />
                    </PinchGestureHandler>
                  </Animated.View>
                </PanGestureHandler>
              </GestureHandlerRootView>

              {/* 导航按钮 */}
              <View style={styles.navigationButtons}>
                <TouchableOpacity 
                  style={[styles.navButton, currentImageIndex === 0 && styles.navButtonDisabled]}
                  onPress={handlePrevImage}
                  disabled={currentImageIndex === 0}
                >
                  <Text style={styles.navButtonText}>←</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.navButton, currentImageIndex === images.length - 1 && styles.navButtonDisabled]}
                  onPress={handleNextImage}
                  disabled={currentImageIndex === images.length - 1}
                >
                  <Text style={styles.navButtonText}>→</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        );
      
      case 'pics':
        // console.log('渲染 pics tab');
        return <PicsContent patternId={id} />;
      
      case 'note':
        // console.log('渲染 note tab');
        return <NotesScreen patternId={id} />;
      
      default:
        // console.log('渲染 default case');
        return null;
    }
  };

  // console.log('准备渲染主组件');
  
  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      <View style={styles.innerContainer}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.navigate('Home')} style={styles.backBtn}>
            <Text style={styles.closeIcon}>×</Text>
          </TouchableOpacity>
          
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

        <View style={styles.content}>
          {renderTabContent()}
        </View>

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
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 40,
    paddingHorizontal: 16,
    paddingBottom: 16,
    height: HEADER_HEIGHT,
    backgroundColor: '#fff',
  },
  backBtn: {
    marginRight: 16,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8, // 添加上边距
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
    marginTop: 8,
    alignItems: 'center', // 确保垂直居中
  },
  tab: {
    paddingHorizontal: 16,
    marginRight: 16,
    height: 40, // 固定高度
    justifyContent: 'center', // 文字垂直居中
  },
  activeTab: {
    // 移除下划线样式
  },
  tabText: {
    fontSize: 18,
    color: '#999',
    includeFontPadding: false, // 移除字体默认的内边距
    textAlignVertical: 'center', // 文字垂直居中
  },
  activeTabText: {
    color: '#222',
    fontWeight: '600',
    includeFontPadding: false, // 移除字体默认的内边距
  },
  content: {
    height: CONTENT_HEIGHT,
    backgroundColor: '#fff',
  },
  patternContent: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  contentContainer: {
    flex: 1,
    position: 'relative',
  },
  imageWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  navigationButtons: {
    position: 'absolute',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    left: 0,
    right: 0,
    top: '50%',
    paddingHorizontal: 16,
    transform: [{ translateY: -25 }],
  },
  navButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  navButtonDisabled: {
    opacity: 0.3,
  },
  navButtonText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '600',
  },
  debugContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 5,
    zIndex: 999,
  },
  debugHeader: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 5,
  },
  debugText: {
    color: '#fff',
    fontSize: 12,
  },
});

export default PatternDetailScreen; 