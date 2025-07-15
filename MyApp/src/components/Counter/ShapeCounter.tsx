import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import * as Haptics from 'expo-haptics';
import { ShapeCounter as ShapeCounterType } from './CounterTypes';
import SemiCircleProgress from './SemiCircleProgress';

interface ShapeCounterProps {
  counter: ShapeCounterType;
  onUpdate: (counter: ShapeCounterType) => void;
  onEdit: () => void;
  hideEdit?: boolean; // 新增：控制是否隐藏编辑按钮
}

const ShapeCounter: React.FC<ShapeCounterProps> = ({ counter, onUpdate, onEdit, hideEdit = false }) => {
  const handleTimesIncrement = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onUpdate({
      ...counter,
      currentTimes: counter.currentTimes + 1,
    });
  };

  const handleTimesDecrement = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onUpdate({
      ...counter,
      currentTimes: Math.max(1, counter.currentTimes - 1), // 最小值为1
    });
  };

  const handleRowsIncrement = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (counter.isLinked) {
      // 连接模式：当rows达到最大值时，times自动+1，rows重置为1
      if (counter.currentRows + 1 > counter.maxRows) {
        onUpdate({
          ...counter,
          currentTimes: counter.currentTimes + 1,
          currentRows: 1,
        });
      } else {
        onUpdate({
          ...counter,
          currentRows: counter.currentRows + 1,
        });
      }
    } else {
      // 独立模式：rows和times互不影响
      onUpdate({
        ...counter,
        currentRows: counter.currentRows + 1,
      });
    }
  };

  const handleRowsDecrement = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (counter.isLinked) {
      // 连接模式：当rows为1且times>1时，times-1，rows设为最大值
      if (counter.currentRows === 1 && counter.currentTimes > 1) {
        onUpdate({
          ...counter,
          currentTimes: counter.currentTimes - 1,
          currentRows: counter.maxRows,
        });
      } else {
        onUpdate({
          ...counter,
          currentRows: Math.max(1, counter.currentRows - 1), // 最小值为1
        });
      }
    } else {
      // 独立模式：rows和times互不影响
      onUpdate({
        ...counter,
        currentRows: Math.max(1, counter.currentRows - 1), // 最小值为1
      });
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.name}>{counter.name || 'shape counter'}</Text>
        {!hideEdit && (
          <TouchableOpacity onPress={onEdit} style={styles.editBtn}>
            <Text style={styles.editText}>edit</Text>
          </TouchableOpacity>
        )}
      </View>
      
      <View style={styles.countersRow}>
        {/* Times Counter */}
        <View style={styles.counterGroup}>
          <View style={styles.content}>
            {/* 左侧减号按钮 */}
            <TouchableOpacity style={styles.button} onPress={handleTimesDecrement}>
              <Text style={styles.buttonText}>−</Text>
            </TouchableOpacity>
            
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
            <TouchableOpacity style={styles.button} onPress={handleTimesIncrement}>
              <Text style={styles.buttonText}>+</Text>
            </TouchableOpacity>
          </View>
          {/* 标签移到半圆下方 */}
          <Text style={styles.label}>times</Text>
        </View>

        {/* Rows Counter */}
        <View style={styles.counterGroup}>
          <View style={styles.content}>
            {/* 左侧减号按钮 */}
            <TouchableOpacity style={styles.button} onPress={handleRowsDecrement}>
              <Text style={styles.buttonText}>−</Text>
            </TouchableOpacity>
            
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
            <TouchableOpacity style={styles.button} onPress={handleRowsIncrement}>
              <Text style={styles.buttonText}>+</Text>
            </TouchableOpacity>
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
    backgroundColor: '#ddd',
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
    fontSize: 16,
    color: '#222',
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
    width: 28, // 从28增加到36
    height: 28, // 从28增加到36
    borderRadius: 18, // 从14增加到18
    backgroundColor: '#bbb',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontSize: 20, // 从16增加到20
    color: '#222',
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