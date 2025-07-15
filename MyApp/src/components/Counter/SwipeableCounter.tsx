import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, PanResponder, Alert } from 'react-native';
import { Counter } from './CounterTypes';
import RowCounter from './RowCounter';
import ShapeCounter from './ShapeCounter';
import { Ionicons } from '@expo/vector-icons';

interface SwipeableCounterProps {
  counter: Counter;
  index: number;
  onUpdate: (counter: Counter) => void;
  onEdit: (counter: Counter) => void;
  onDelete: (id: string) => void;
  onReorder: (fromIndex: number, toIndex: number) => void;
  onStartDrag: () => void;
  onEndDrag: () => void;
  onDragMove: (y: number) => void;
}

const SwipeableCounter: React.FC<SwipeableCounterProps> = ({
  counter,
  index,
  onUpdate,
  onEdit,
  onDelete,
  onReorder,
  onStartDrag,
  onEndDrag,
  onDragMove,
}) => {
  const [isSwipeOpen, setIsSwipeOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const translateX = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;
  const longPressTimeout = useRef<NodeJS.Timeout | null>(null);

  const SWIPE_THRESHOLD = 60;
  const ACTION_BUTTON_WIDTH = 80;
  const ITEM_HEIGHT = 72;
  const LONG_PRESS_DELAY = 200;

  // 拖拽手势处理
  const dragPanResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => false,
    onPanResponderGrant: () => {
      // 开始长按计时
      longPressTimeout.current = setTimeout(() => {
        setIsDragging(true);
        onStartDrag();
        translateY.setValue(0);
      }, LONG_PRESS_DELAY);
    },
    onPanResponderMove: (evt, gestureState) => {
      if (!isDragging) return;

      // 移动当前项目
      translateY.setValue(gestureState.dy);
      
      // 通知父组件当前位置，用于处理自动滚动
      onDragMove(evt.nativeEvent.pageY);

      // 计算目标位置
      const moveDistance = gestureState.dy;
      const moveItems = Math.round(moveDistance / ITEM_HEIGHT);
      
      if (Math.abs(moveItems) >= 1) {
        const newIndex = Math.max(0, Math.min(index + moveItems, 999));
        if (newIndex !== index) {
          onReorder(index, newIndex);
          // 重置位置
          translateY.setValue(0);
        }
      }
    },
    onPanResponderRelease: () => {
      // 清除长按计时器
      if (longPressTimeout.current) {
        clearTimeout(longPressTimeout.current);
        longPressTimeout.current = null;
      }

      if (isDragging) {
        setIsDragging(false);
        onEndDrag();
        
        // 重置位置
        Animated.spring(translateY, {
          toValue: 0,
          useNativeDriver: true,
          friction: 5,
          tension: 40
        }).start();
      }
    },
    onPanResponderTerminate: () => {
      // 清除长按计时器
      if (longPressTimeout.current) {
        clearTimeout(longPressTimeout.current);
        longPressTimeout.current = null;
      }

      if (isDragging) {
        setIsDragging(false);
        onEndDrag();
        
        // 重置位置
        Animated.spring(translateY, {
          toValue: 0,
          useNativeDriver: true,
          friction: 5,
          tension: 40
        }).start();
      }
    }
  });

  // 滑动手势处理
  const swipePanResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => false,
    onMoveShouldSetPanResponder: (evt, gestureState) => {
      if (isDragging) return false;
      return Math.abs(gestureState.dx) > 20;
    },
    onPanResponderMove: (evt, gestureState) => {
      if (gestureState.dx < 0) {
        const newTranslateX = Math.max(gestureState.dx, -ACTION_BUTTON_WIDTH * 2);
        translateX.setValue(newTranslateX);
      }
    },
    onPanResponderRelease: (evt, gestureState) => {
      if (gestureState.dx < -SWIPE_THRESHOLD) {
        setIsSwipeOpen(true);
        Animated.spring(translateX, {
          toValue: -ACTION_BUTTON_WIDTH * 2,
          useNativeDriver: true
        }).start();
      } else {
        setIsSwipeOpen(false);
        Animated.spring(translateX, {
          toValue: 0,
          useNativeDriver: true
        }).start();
      }
    }
  });

  const handleEdit = () => {
    setIsSwipeOpen(false);
    Animated.spring(translateX, {
      toValue: 0,
      useNativeDriver: true
    }).start();
    onEdit(counter);
  };

  const handleDelete = () => {
    Alert.alert(
      '删除计数器',
      `确定要删除 "${counter.name || (counter.type === 'row' ? 'row counter' : 'shape counter')}" 吗？`,
      [
        {
          text: '取消',
          style: 'cancel',
        },
        {
          text: '删除',
          style: 'destructive',
          onPress: () => {
            setIsSwipeOpen(false);
            Animated.spring(translateX, {
              toValue: 0,
              useNativeDriver: true
            }).start();
            onDelete(counter.id);
          },
        },
      ]
    );
  };

  const renderCounter = () => {
    if (counter.type === 'row') {
      return (
        <RowCounter
          counter={counter}
          onUpdate={onUpdate}
          onEdit={() => {}}
          hideEdit={true}
        />
      );
    } else {
      return (
        <ShapeCounter
          counter={counter}
          onUpdate={onUpdate}
          onEdit={() => {}}
          hideEdit={true}
        />
      );
    }
  };

  return (
    <View style={styles.container}>
      {/* 全屏透明遮罩，用于点击收回滑动 */}
      {isSwipeOpen && (
        <TouchableOpacity
          style={styles.overlay}
          onPress={() => {
            setIsSwipeOpen(false);
            Animated.spring(translateX, {
              toValue: 0,
              useNativeDriver: true
            }).start();
          }}
          activeOpacity={1}
        />
      )}
      
      <Animated.View
        style={[
          styles.contentWrapper,
          {
            transform: [
              { translateY }
            ],
            zIndex: isDragging ? 999 : 1,
          },
          isDragging && styles.dragging,
        ]}
      >
        {/* 拖拽手柄 */}
        <View {...dragPanResponder.panHandlers} style={styles.dragHandle}>
          <Ionicons name="reorder-three" size={24} color="#666" />
        </View>

        {/* 计数器内容 */}
        <Animated.View 
          {...swipePanResponder.panHandlers} 
          style={[
            styles.counterContainer,
            {
              transform: [{ translateX: translateX }]
            }
          ]}
        >
          {renderCounter()}
        </Animated.View>

        {/* 背景操作按钮 */}
        <View style={[styles.actionsContainer, isDragging && styles.hidden]}>
          <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
            <Text style={styles.actionText}>delete</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.editButton} onPress={handleEdit}>
            <Text style={styles.actionText}>edit</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
  },
  contentWrapper: {
    position: 'relative',
    overflow: 'hidden',
    borderRadius: 12,
    backgroundColor: '#ddd',
    flexDirection: 'row',
  },
  dragHandle: {
    width: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderRightWidth: 1,
    borderRightColor: '#ccc',
  },
  counterContainer: {
    flex: 1,
    zIndex: 2,
    backgroundColor: '#ddd',
  },
  actionsContainer: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    flexDirection: 'row',
    alignItems: 'stretch',
    zIndex: 0,
  },
  editButton: {
    width: 80,
    backgroundColor: '#4CAF50',
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteButton: {
    width: 80,
    backgroundColor: '#F44336',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  dragging: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 15,
  },
  hidden: {
    opacity: 0,
  },
  overlay: {
    position: 'absolute',
    top: -1000,
    left: -1000,
    right: -1000,
    bottom: -1000,
    backgroundColor: 'transparent',
    zIndex: 998,
  },
});

export default SwipeableCounter;