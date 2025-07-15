import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Path } from 'react-native-svg';

interface SemiCircleProgressProps {
  currentValue: number;
  startValue: number;
  endValue: number;
  size?: number;
}

const SemiCircleProgress: React.FC<SemiCircleProgressProps> = ({
  currentValue,
  startValue,
  endValue,
  size = 100,
}) => {
  // 计算进度百分比
  const calculateProgress = () => {
    if (endValue === 999) {
      // 无限模式，显示满格
      return 1;
    }
    
    const total = endValue - startValue;
    const current = currentValue - startValue;
    return Math.min(Math.max(current / total, 0), 1);
  };

  const progress = calculateProgress();
  const radius = size / 2 - 12; // 留出边距
  const strokeWidth = 5;
  const centerX = size / 2;
  const centerY = size / 2;

  // 半圆路径 (从左到右，上半圆)
  const semicirclePath = `M ${centerX - radius} ${centerY} A ${radius} ${radius} 0 0 1 ${centerX + radius} ${centerY}`;
  
  // 计算半圆的周长（半圆弧长 = π * r）
  const circumference = Math.PI * radius;
  
  // 计算进度对应的弧长
  const progressLength = circumference * progress;
  
  // 计算未填充部分的长度（用于stroke-dashoffset）
  const dashOffset = circumference - progressLength;

  // 计算半圆两端的位置，用于对齐起始和结束值
  const leftEndX = centerX - radius;
  const rightEndX = centerX + radius;
  const endY = centerY;

  return (
    <View style={[styles.container, { width: size, height: size * 0.6 }]}>
      <Svg width={size} height={size * 0.6} style={styles.svg}>
        {/* 背景半圆 - 完整的灰色弧线 */}
        <Path
          d={semicirclePath}
          stroke="#ccc"
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
        />
        
        {/* 进度半圆 - 使用虚线控制显示长度 */}
        <Path
          d={semicirclePath}
          stroke="#333"
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={`${progressLength} ${circumference}`}
          strokeDashoffset={0}
        />
      </Svg>
      
      {/* 中心数字 */}
      <View style={styles.centerContainer}>
        <Text style={styles.centerText}>{currentValue}</Text>
      </View>
      
      {/* 起始和结束值 - 与半圆两端对齐 */}
      <View style={styles.valuesContainer}>
        <Text style={[styles.valueText, { 
          position: 'absolute', 
          left: leftEndX - 5,
          top: endY + 8
        }]}>
          {startValue}
        </Text>
        <Text style={[styles.valueText, { 
          position: 'absolute', 
          right: size - rightEndX - 5,
          top: endY + 8
        }]}>
          {endValue === 999 ? '♾️' : endValue}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    alignItems: 'center',
  },
  svg: {
    position: 'absolute',
    top: 0,
  },
  centerContainer: {
    position: 'absolute',
    top: '45%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerText: {
    fontSize: 24,
    color: '#222',
    fontWeight: '400',
  },
  valuesContainer: {
    position: 'relative',
    width: '100%',
    height: 20,
  },
  valueText: {
    fontSize: 11,
    color: '#666',
    fontWeight: '400',
  },
});

export default SemiCircleProgress; 