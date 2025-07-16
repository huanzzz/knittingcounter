import React, { useRef } from 'react';
import { View, Text, StyleSheet, TouchableWithoutFeedback, Animated } from 'react-native';
import * as Haptics from 'expo-haptics';
import SemiCircleProgress from './SemiCircleProgress';
import { ShapeCounterType } from './CounterTypes';

interface ShapeCounterProps {
  counter: ShapeCounterType;
  onUpdate: (counter: ShapeCounterType) => void;
  onEdit?: () => void;
  hideEdit?: boolean;
}

const ShapeCounter: React.FC<ShapeCounterProps> = ({ counter, onUpdate, onEdit, hideEdit = false }) => {
  const timesDecrementAnimation = useRef(new Animated.Value(0)).current;
  const timesIncrementAnimation = useRef(new Animated.Value(0)).current;
  const rowsDecrementAnimation = useRef(new Animated.Value(0)).current;
  const rowsIncrementAnimation = useRef(new Animated.Value(0)).current;

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

  const handleTimesIncrement = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onUpdate({
      ...counter,
      currentTimes: Math.min(counter.maxTimes, counter.currentTimes + 1),
    });
  };

  const handleTimesDecrement = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onUpdate({
      ...counter,
      currentTimes: Math.max(1, counter.currentTimes - 1),
    });
  };

  const handleRowsIncrement = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onUpdate({
      ...counter,
      currentRows: Math.min(counter.maxRows, counter.currentRows + 1),
    });
  };

  const handleRowsDecrement = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onUpdate({
      ...counter,
      currentRows: Math.max(1, counter.currentRows - 1),
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.name}>{counter.name || 'shape counter'}</Text>
        {!hideEdit && (
          <TouchableWithoutFeedback onPress={onEdit} style={styles.editBtn}>
            <Text style={styles.editText}>edit</Text>
          </TouchableWithoutFeedback>
        )}
      </View>
      
      <View style={styles.countersRow}>
        {/* Times Counter */}
        <View style={styles.counterGroup}>
          <View style={styles.content}>
            {/* 左侧减号按钮 */}
            <TouchableWithoutFeedback 
              onPressIn={() => handlePressIn(timesDecrementAnimation)}
              onPressOut={() => handlePressOut(timesDecrementAnimation)}
              onPress={handleTimesDecrement}
            >
              <Animated.View style={[styles.button, getAnimatedStyle(timesDecrementAnimation)]}>
                <Text style={styles.buttonText}>−</Text>
              </Animated.View>
            </TouchableWithoutFeedback>
            
            {/* 中间半圆进度条 */}
            <View style={styles.progressContainer}>
              <SemiCircleProgress
                currentValue={counter.currentTimes}
                startValue={1}
                endValue={counter.maxTimes}
                size={85}
              />
            </View>
            
            {/* 右侧加号按钮 */}
            <TouchableWithoutFeedback 
              onPressIn={() => handlePressIn(timesIncrementAnimation)}
              onPressOut={() => handlePressOut(timesIncrementAnimation)}
              onPress={handleTimesIncrement}
            >
              <Animated.View style={[styles.button, getAnimatedStyle(timesIncrementAnimation)]}>
                <Text style={styles.buttonText}>+</Text>
              </Animated.View>
            </TouchableWithoutFeedback>
          </View>
          {/* 标签移到半圆下方 */}
          <Text style={styles.label}>times</Text>
        </View>

        {/* Rows Counter */}
        <View style={styles.counterGroup}>
          <View style={styles.content}>
            {/* 左侧减号按钮 */}
            <TouchableWithoutFeedback 
              onPressIn={() => handlePressIn(rowsDecrementAnimation)}
              onPressOut={() => handlePressOut(rowsDecrementAnimation)}
              onPress={handleRowsDecrement}
            >
              <Animated.View style={[styles.button, getAnimatedStyle(rowsDecrementAnimation)]}>
                <Text style={styles.buttonText}>−</Text>
              </Animated.View>
            </TouchableWithoutFeedback>
            
            {/* 中间半圆进度条 */}
            <View style={styles.progressContainer}>
              <SemiCircleProgress
                currentValue={counter.currentRows}
                startValue={1}
                endValue={counter.maxRows}
                size={85}
              />
            </View>
            
            {/* 右侧加号按钮 */}
            <TouchableWithoutFeedback 
              onPressIn={() => handlePressIn(rowsIncrementAnimation)}
              onPressOut={() => handlePressOut(rowsIncrementAnimation)}
              onPress={handleRowsIncrement}
            >
              <Animated.View style={[styles.button, getAnimatedStyle(rowsIncrementAnimation)]}>
                <Text style={styles.buttonText}>+</Text>
              </Animated.View>
            </TouchableWithoutFeedback>
          </View>
          {/* 标签移到半圆下方 */}
          <Text style={styles.label}>rows</Text>
        </View>
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
    marginBottom: 8, // 从0增加到8，增加和下方内容的距离
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
  countersRow: {
    flexDirection: 'row',
    justifyContent: 'space-around', // 从space-between改为space-around，更好分布
    alignItems: 'flex-start',
    gap: 20, // 从12增加到20，增加间距
  },
  counterGroup: {
    flex: 1,
    alignItems: 'center',
    maxWidth: '45%', // 限制最大宽度，防止重叠
  },
  label: {
    fontSize: 12,
    color: '#666',
    marginTop: -8, // 【UI调整1】times和rows文字离半圆的距离：负数更近，正数更远
    textAlign: 'center',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 4, // 从8减少到4，给按钮更多空间
    minHeight: 60, // 从48调整为60，保持比例
  },
  button: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#196EDD',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#6E3A15',
    shadowOffset: {
      width: 1,
      height: 2,
    },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
  },
  buttonText: {
    fontSize: 20,
    color: '#fff',
    fontWeight: '300',
  },
  progressContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 4, // 从6减少到4
    marginTop: -15, // 从-12调整为-15，保持相对位置
  },
});

export default ShapeCounter; 