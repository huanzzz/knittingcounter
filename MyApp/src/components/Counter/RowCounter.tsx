import React, { useRef } from 'react';
import { View, Text, StyleSheet, TouchableWithoutFeedback, Animated } from 'react-native';
import * as Haptics from 'expo-haptics';
import SemiCircleProgress from './SemiCircleProgress';
import { CounterType } from './CounterTypes';

interface RowCounterProps {
  counter: CounterType;
  onUpdate: (counter: CounterType) => void;
  onEdit?: () => void;
  hideEdit?: boolean;
}

const RowCounter: React.FC<RowCounterProps> = ({ counter, onUpdate, onEdit, hideEdit = false }) => {
  const decrementAnimation = useRef(new Animated.Value(0)).current;
  const incrementAnimation = useRef(new Animated.Value(0)).current;

  const handlePressIn = (animation: Animated.Value) => {
    Animated.spring(animation, {
      toValue: 1,
      useNativeDriver: true,
      speed: 50,
      bounciness: 4,
    }).start();
  };

  const handlePressOut = (animation: Animated.Value) => {
    Animated.spring(animation, {
      toValue: 0,
      useNativeDriver: true,
      speed: 50,
      bounciness: 4,
    }).start();
  };

  const handleIncrement = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onUpdate({
      ...counter,
      currentRow: counter.currentRow + 1,
    });
  };

  const handleDecrement = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onUpdate({
      ...counter,
      currentRow: Math.max(0, counter.currentRow - 1),
    });
  };

  const getAnimatedStyle = (animation: Animated.Value) => ({
    transform: [
      {
        scale: animation.interpolate({
          inputRange: [0, 1],
          outputRange: [1, 0.80],
        }),
      },
    ],
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.name}>{counter.name || 'row counter'}</Text>
        {!hideEdit && (
          <TouchableWithoutFeedback onPress={onEdit} style={styles.editBtn}>
            <Text style={styles.editText}>edit</Text>
          </TouchableWithoutFeedback>
        )}
      </View>
      
      <View style={styles.content}>
        {/* 左侧减号按钮 */}
        <TouchableWithoutFeedback 
          onPressIn={() => handlePressIn(decrementAnimation)}
          onPressOut={() => handlePressOut(decrementAnimation)}
          onPress={handleDecrement}
        >
          <Animated.View style={[styles.button, getAnimatedStyle(decrementAnimation)]}>
            <Text style={styles.buttonText}>−</Text>
          </Animated.View>
        </TouchableWithoutFeedback>
        
        {/* 中间半圆进度条 */}
        <View style={styles.progressContainer}>
          <SemiCircleProgress
            currentValue={counter.currentRow}
            startValue={counter.startRow}
            endValue={counter.endRow}
            size={120}
          />
        </View>
        
        {/* 右侧加号按钮 */}
        <TouchableWithoutFeedback 
          onPressIn={() => handlePressIn(incrementAnimation)}
          onPressOut={() => handlePressOut(incrementAnimation)}
          onPress={handleIncrement}
        >
          <Animated.View style={[styles.button, getAnimatedStyle(incrementAnimation)]}>
            <Text style={styles.buttonText}>+</Text>
          </Animated.View>
        </TouchableWithoutFeedback>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'transparent',
    borderRadius: 12,
    padding: 13,
    marginBottom: 12,
    minHeight: 100, // 从80调整为100（125%）
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2, // 【UI调整2】减小和name之间的距离：从8调整为4
  },
  name: {
    fontSize: 14,
    color: '#5D5D5D',
    fontWeight: '500',
  },
  editBtn: {
    padding: 4,
  },
  editText: {
    fontSize: 14,
    color: '#666',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 30, // 【UI调整7】加减按钮离半圆更近：增大内边距让按钮往中间靠
    minHeight: 60, // 从48调整为60，保持比例
  },
  button: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#196EDD',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#6E3A15',
    shadowOffset: {
      width: 2,
      height: 1,
    },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
  },
  buttonText: {
    fontSize: 24,
    color: '#fff',
    fontWeight: '300',
  },
  progressContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 8, // 【UI调整1】加减按钮靠半圆近一点：从12调整为8
    marginTop: -20, // 从-16调整为-20，保持相对位置
  },
});

export default RowCounter; 