// 颜色系统
export const colors = {
  // 主色调
  primary: '#222',
  secondary: '#aaa',
  
  // 灰度
  gray: {
    50: '#f9f9f9',
    100: '#f5f5f5',
    200: '#eee',
    300: '#ddd',
    400: '#999',
    500: '#666',
    600: '#444',
    700: '#333',
    800: '#222',
    900: '#111',
  },
  
  // 功能色
  white: '#fff',
  black: '#000',
  
  // 状态色
  success: '#4CAF50',
  warning: '#FF9800',
  error: '#F44336',
  info: '#2196F3',
};

// 字体系统
export const typography = {
  sizes: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20,
    '2xl': 22,
    '3xl': 24,
    '4xl': 32,
    '5xl': 40,
  },
  weights: {
    light: '300',
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
};

// 间距系统
export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
  '4xl': 40,
  '5xl': 60,
};

// 圆角系统
export const borderRadius = {
  none: 0,
  sm: 4,
  md: 8,
  lg: 16,
  xl: 20,
  full: 9999,
};

// 阴影系统
export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
};

// 默认主题
export const theme = {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
}; 