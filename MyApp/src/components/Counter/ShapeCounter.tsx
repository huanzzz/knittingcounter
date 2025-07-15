import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
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
    onUpdate({
      ...counter,
      currentTimes: counter.currentTimes + 1,
    });
  };

  const handleTimesDecrement = () => {
    onUpdate({
      ...counter,
      currentTimes: Math.max(1, counter.currentTimes - 1), // 最小值为1
    });
  };

  const handleRowsIncrement = () => {
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
                size={80}
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

        {/* 连接线指示器 */}
        <View style={styles.linkIndicator}>
          <View style={[
            styles.linkLine,
            !counter.isLinked && styles.linkLineDisabled
          ]} />
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
                size={80}
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
    minHeight: 80, // 【UI调整3】Shape计数器高度和row计数器保持一致：从100调整为80
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 0, // 【UI调整2】减小半圆和name之间的距离：从2调整为0
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
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12, // 【UI调整】两个计数器之间的间距
  },
  counterGroup: {
    flex: 1,
    alignItems: 'center',
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
    paddingHorizontal: 8, // 【UI调整】加减按钮离半圆的距离
    minHeight: 48, // 【UI调整】内容区域高度：从60调整为48
  },
  button: {
    width: 28, // 【UI调整】按钮尺寸，比row counter小一些
    height: 28,
    borderRadius: 14,
    backgroundColor: '#bbb',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontSize: 16, // 【UI调整】按钮文字大小
    color: '#222',
    fontWeight: '300',
  },
  progressContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 6, // 【UI调整】半圆和按钮之间的间距
    marginTop: -12, // 【UI调整】半圆往上挪：负数向上，正数向下
  },
  linkIndicator: {
    width: 20,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  linkLine: {
    width: '100%',
    height: 2,
    backgroundColor: '#666',
  },
  linkLineDisabled: {
    backgroundColor: '#ddd',
  },
});

export default ShapeCounter; 