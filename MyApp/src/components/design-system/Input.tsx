import React, { ReactNode } from 'react';
import { View, TextInput, Text, StyleSheet } from 'react-native';

export type InputVariant = 'default' | 'underline';
export type InputSize = 'small' | 'medium' | 'large';

interface InputProps {
  placeholder?: string;
  value: string;
  onChangeText: (text: string) => void;
  variant?: InputVariant;
  size?: InputSize;
  label?: string;
  suffix?: string | ReactNode;
  keyboardType?: 'default' | 'numeric' | 'email-address';
  multiline?: boolean;
  disabled?: boolean;
  style?: object;
}

const Input: React.FC<InputProps> = ({
  placeholder,
  value,
  onChangeText,
  variant = 'default',
  size = 'medium',
  label,
  suffix,
  keyboardType = 'default',
  multiline = false,
  disabled = false,
  style,
}) => {
  const containerStyle = [
    styles.container,
    variant === 'underline' ? styles.underlineVariant : styles[variant],
    style,
  ];

  const inputStyle = [
    styles.baseInput,
    styles[`${size}Input`],
    disabled && styles.disabledInput,
  ];

  return (
    <View style={containerStyle}>
      {label && <Text style={styles.label}>{label}</Text>}
      
      <View style={styles.inputContainer}>
        <TextInput
          style={inputStyle}
          placeholder={placeholder}
          placeholderTextColor="#999"
          value={value}
          onChangeText={onChangeText}
          keyboardType={keyboardType}
          multiline={multiline}
          editable={!disabled}
        />
        {suffix && (
          typeof suffix === 'string' ? (
            <Text style={styles.suffix}>{suffix}</Text>
          ) : (
            <View style={styles.suffixContainer}>{suffix}</View>
          )
        )}
      </View>
      
      {variant === 'underline' && <View style={styles.underline} />}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  
  // Variants
  default: {
    borderWidth: 1,
    borderColor: '#222',
    borderRadius: 16,
    paddingHorizontal: 24,
    paddingVertical: 24,
  },
  underlineVariant: {
    // No border for underline variant
  },
  
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  baseInput: {
    flex: 1,
    color: '#222',
    paddingVertical: 12,
    paddingHorizontal: 0,
  },
  
  // Sizes
  smallInput: {
    fontSize: 16,
  },
  mediumInput: {
    fontSize: 20,
  },
  largeInput: {
    fontSize: 24,
  },
  
  label: {
    fontSize: 22,
    color: '#222',
    marginBottom: 20,
  },
  
  suffix: {
    fontSize: 22,
    color: '#222',
    marginLeft: 8,
  },
  
  suffixContainer: {
    marginLeft: 8,
  },
  
  underline: {
    height: 1,
    backgroundColor: '#222',
    marginTop: 0,
  },
  
  disabledInput: {
    color: '#999',
  },
});

export default Input; 