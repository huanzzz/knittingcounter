import React, { useRef, useEffect } from 'react';
import { TouchableWithoutFeedback, Text, StyleSheet, ActivityIndicator, Animated, TouchableOpacity } from 'react-native';

export type ButtonVariant = 'primary' | 'secondary' | 'text';
export type ButtonSize = 'small' | 'medium' | 'large';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  style?: object;
}

const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  style,
}) => {
  const animatedValue = useRef(new Animated.Value(0)).current;

  const handlePressIn = () => {
    if (variant !== 'text') {
      Animated.spring(animatedValue, {
        toValue: 1,
        useNativeDriver: true,
        speed: 50,
        bounciness: 4,
      }).start();
    }
  };

  const handlePressOut = () => {
    if (variant !== 'text') {
      Animated.spring(animatedValue, {
        toValue: 0,
        useNativeDriver: true,
        speed: 50,
        bounciness: 4,
      }).start();
    }
  };

  const animatedStyle = variant !== 'text' ? {
    transform: [
      {
        translateY: animatedValue.interpolate({
          inputRange: [0, 1],
          outputRange: [-4, 0],
        }),
      },
    ],
  } : {};

  if (variant === 'text') {
    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={disabled || loading}
        style={[styles.text, style]}
      >
        <Text style={[
          styles.textText,
          styles[`${size}Text`],
          disabled && styles.disabledText
        ]}>
          {title}
        </Text>
      </TouchableOpacity>
    );
  }

  const buttonStyle = [
    styles.base,
    styles[variant],
    styles[size],
    disabled && styles.disabled,
    style,
    animatedStyle,
  ];

  const textStyle = [
    styles.baseText,
    styles[`${variant}Text`],
    styles[`${size}Text`],
    disabled && styles.disabledText,
  ];

  return (
    <TouchableWithoutFeedback
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={onPress}
      disabled={disabled || loading}
    >
      <Animated.View style={buttonStyle}>
        {loading ? (
          <ActivityIndicator color={variant === 'primary' ? '#fff' : '#222'} size="small" />
        ) : (
          <Text style={textStyle}>{title}</Text>
        )}
      </Animated.View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 30,
  },
  
  // Variants
  primary: {
    backgroundColor: '#196EDD',
  },
  secondary: {
    backgroundColor: '#ddd',
    borderWidth: 1,
    borderColor: '#222',
  },
  text: {
    backgroundColor: 'transparent',
    shadowColor: 'transparent',
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  
  // Sizes
  small: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  medium: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    shadowColor: '#6E3A15',
    shadowOffset: {
      width: 3,
      height: 4,
    },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
  },
  large: {
    paddingVertical: 14,
    paddingHorizontal: 32,
    shadowColor: '#6E3A15',
    shadowOffset: {
      width: 3,
      height: 4,
    },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
  },
  
  // States
  disabled: {
    backgroundColor: '#eee',
    opacity: 0.6,
  },
  
  // Text styles
  baseText: {
    fontWeight: '500',
    textAlign: 'center',
  },
  primaryText: {
    color: '#fff',
    fontSize: 18,
  },
  secondaryText: {
    color: '#222',
    fontSize: 18,
  },
  textText: {
    color: '#6E3A15',
    fontSize: 18,
  },
  
  // Text sizes
  smallText: {
    fontSize: 16,
  },
  mediumText: {
    fontSize: 18,
  },
  largeText: {
    fontSize: 20,
  },
  
  disabledText: {
    color: '#999',
  },
});

export default Button; 