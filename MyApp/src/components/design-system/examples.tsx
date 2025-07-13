import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Button, Input } from './index';

// 使用示例组件
const DesignSystemExamples: React.FC = () => {
  const [linkValue, setLinkValue] = useState('');
  const [projectName, setProjectName] = useState('');
  const [needleSize, setNeedleSize] = useState('');

  return (
    <View style={styles.container}>
      {/* 示例1: 带边框的输入框 - 用于AddPatternScreen */}
      <Input
        variant="default"
        placeholder="link"
        value={linkValue}
        onChangeText={setLinkValue}
        suffix={
          <Button
            title="add"
            onPress={() => console.log('Add clicked')}
            variant="secondary"
            size="small"
          />
        }
      />

      {/* 示例2: 下划线输入框 - 用于EditPatternNameScreen */}
      <Input
        variant="underline"
        placeholder="project name"
        value={projectName}
        onChangeText={setProjectName}
      />

      {/* 示例3: 带标签和后缀的下划线输入框 */}
      <Input
        variant="underline"
        label="needle size"
        placeholder=""
        value={needleSize}
        onChangeText={setNeedleSize}
        keyboardType="numeric"
        suffix="mm"
      />

      {/* 按钮示例 */}
      <Button
        title="Primary Button"
        onPress={() => console.log('Primary')}
        variant="primary"
      />
      
      <Button
        title="Secondary Button"
        onPress={() => console.log('Secondary')}
        variant="secondary"
      />
      
      <Button
        title="Text Button"
        onPress={() => console.log('Text')}
        variant="text"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: '#fff',
  },
});

export default DesignSystemExamples; 