import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, PanResponder, Alert, Dimensions } from 'react-native';
import { Counter } from './CounterTypes';
import RowCounter from './RowCounter';
import ShapeCounter from './ShapeCounter';

const { width: screenWidth } = Dimensions.get('window');

interface SwipeableCounterProps {
  counter: Counter;
  index: number;
  onUpdate: (counter: Counter) => void;
  onEdit: (counter: Counter) => void;
  onDelete: (id: string) => void;
  onReorder: (fromIndex: number, toIndex: number) => void;
}

const SwipeableCounter: React.FC<SwipeableCounterProps> = ({
  counter,
  index,
  onUpdate,
  onEdit,
  onDelete,
  onReorder,
}) => {
  const [isSwipeOpen, setIsSwipeOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const translateX = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);

  const SWIPE_THRESHOLD = 100;
  const ACTION_BUTTON_WIDTH = 80;

  // 手势处理
  const swipePanResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: (evt, gestureState) => {
      if (isDragging) {
        return Math.abs(gestureState.dy) > 5;
      }
      return Math.abs(gestureState.dx) > 20 && Math.abs(gestureState.dy) < 30;
    },
    onPanResponderGrant: (evt) => {
      longPressTimer.current = setTimeout(() => {
        setIsDragging(true);
      }, 500);
    },
    onPanResponderMove: (evt, gestureState) => {
      if (isDragging) {
        translateY.setValue(gestureState.dy);
        return;
      }

      if (longPressTimer.current) {
        clearTimeout(longPressTimer.current);
        longPressTimer.current = null;
      }

      if (gestureState.dx < -50) {
        const newTranslateX = Math.max(gestureState.dx, -ACTION_BUTTON_WIDTH * 2);
        translateX.setValue(newTranslateX);
      }
    },
    onPanResponderRelease: (evt, gestureState) => {
      if (longPressTimer.current) {
        clearTimeout(longPressTimer.current);
        longPressTimer.current = null;
      }

      if (isDragging) {
        setIsDragging(false);
        
        const ITEM_HEIGHT = 112;
        const moveSteps = Math.round(gestureState.dy / ITEM_HEIGHT);
        if (moveSteps !== 0) {
          const newIndex = index + moveSteps;
          onReorder(index, newIndex);
        }
        
        Animated.spring(translateY, {
          toValue: 0,
          useNativeDriver: true,
        }).start();
        return;
      }

      if (gestureState.dx < -SWIPE_THRESHOLD) {
        setIsSwipeOpen(true);
        Animated.spring(translateX, {
          toValue: -ACTION_BUTTON_WIDTH * 2,
          useNativeDriver: true,
        }).start();
      } else {
        setIsSwipeOpen(false);
        Animated.spring(translateX, {
          toValue: 0,
          useNativeDriver: true,
        }).start();
      }
    },
  });

  const handleEdit = () => {
    setIsSwipeOpen(false);
    Animated.spring(translateX, {
      toValue: 0,
      useNativeDriver: true,
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
              useNativeDriver: true,
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
      {/* 背景操作按钮 */}
      <View style={styles.actionsContainer}>
        <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
          <Text style={styles.actionText}>delete</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.editButton} onPress={handleEdit}>
          <Text style={styles.actionText}>edit</Text>
        </TouchableOpacity>
      </View>

      {/* 计数器内容 */}
      <Animated.View
        style={[
          styles.counterContainer,
          {
            transform: [
              { translateX },
              { translateY },
            ],
          },
          isDragging && styles.dragging,
        ]}
        {...swipePanResponder.panHandlers}
      >
        {renderCounter()}
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    marginBottom: 12,
    overflow: 'hidden',
  },
  actionsContainer: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 0,
  },
  editButton: {
    width: 80,
    height: 100,
    backgroundColor: '#4CAF50',
    alignItems: 'center',
    justifyContent: 'center',
    borderTopRightRadius: 12,
    borderBottomRightRadius: 12,
  },
  deleteButton: {
    width: 80,
    height: 100,
    backgroundColor: '#F44336',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  counterContainer: {
    backgroundColor: 'transparent',
    zIndex: 2,
  },
  dragging: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 15,
    backgroundColor: 'transparent',
    zIndex: 1000,
  },
});

export default SwipeableCounter; 