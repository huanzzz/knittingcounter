import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Path, Defs, Mask, Rect } from 'react-native-svg';

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

  // 固定的半圆路径 (从左到右，上半圆)
  const semicirclePath = `M ${centerX - radius} ${centerY} A ${radius} ${radius} 0 0 1 ${centerX + radius} ${centerY}`;
  
  // 计算遮罩的宽度 - 从左侧开始显示进度
  const maskWidth = (size * progress);

  // 【UI调整4】计算半圆两端的位置，用于对齐起始和结束值
  const leftEndX = centerX - radius; // 半圆左端的X坐标
  const rightEndX = centerX + radius; // 半圆右端的X坐标
  const endY = centerY; // 半圆两端的Y坐标（都在同一水平线上）

  return (
    <View style={[styles.container, { width: size, height: size * 0.6 }]}>
      <Svg width={size} height={size * 0.6} style={styles.svg}>
        <Defs>
          {/* 定义遮罩 - 从左侧开始逐渐显示 */}
          <Mask id="progressMask">
            <Rect x={0} y={0} width={maskWidth} height={size * 0.6} fill="white" />
          </Mask>
        </Defs>
        
        {/* 背景半圆 - 固定位置，完整显示 */}
        <Path
          d={semicirclePath}
          stroke="#ccc"
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
        />
        
        {/* 进度半圆 - 使用遮罩控制显示区域 */}
        <Path
          d={semicirclePath}
          stroke="#333"
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          mask="url(#progressMask)"
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
          left: leftEndX - 5, // 【UI调整4】左侧值位置：半圆左端稍微往左偏移
          top: endY + 8 // 【UI调整4】垂直位置：半圆端点下方8px
        }]}>
          {startValue}
        </Text>
        <Text style={[styles.valueText, { 
          position: 'absolute', 
          right: size - rightEndX - 5, // 【UI调整4】右侧值位置：半圆右端稍微往右偏移
          top: endY + 8 // 【UI调整4】垂直位置：半圆端点下方8px
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
    top: '45%', // 【UI调整3】当前行数往下，在半圆居中位置：从25%调整为35%
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerText: {
    fontSize: 24,
    color: '#222',
    fontWeight: '400',
  },
  valuesContainer: {
    position: 'relative', // 【UI调整4】改为相对定位，作为绝对定位子元素的容器
    width: '100%',
    height: 20, // 【UI调整4】给容器一个固定高度
  },
  valueText: {
    fontSize: 11,
    color: '#666',
    fontWeight: '400',
  },
});

export default SemiCircleProgress; 