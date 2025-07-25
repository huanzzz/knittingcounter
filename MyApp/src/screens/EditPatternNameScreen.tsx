import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { Button, Input } from '../components/design-system';
import { PatternStorage } from '../utils/PatternStorage';  // 更新导入路径
import { Pattern } from '../types/Pattern';

type RootStackParamList = {
  AddPattern: undefined;
  EditPatternName: { images: string[] };
  PatternDetail: { 
    id: string;
    images: string[];
    projectName: string;
    needleSize: string;
  };
};

type EditPatternNameScreenNavigationProp = StackNavigationProp<RootStackParamList, 'EditPatternName'>;
type EditPatternNameScreenRouteProp = RouteProp<RootStackParamList, 'EditPatternName'>;

type Props = {
  navigation: EditPatternNameScreenNavigationProp;
  route: EditPatternNameScreenRouteProp;
};

const EditPatternNameScreen: React.FC<Props> = ({ navigation, route }) => {
  const { images } = route.params;
  const [projectName, setProjectName] = useState('');
  const [needleSize, setNeedleSize] = useState('');
  const [needleSize2, setNeedleSize2] = useState('');
  const [saving, setSaving] = useState(false);

  const savePattern = async (skipName: boolean = false) => {
    try {
      setSaving(true);
      
      const finalProjectName = skipName ? 'Untitled Pattern' : (projectName.trim() || 'Untitled Pattern');
      const finalNeedleSize = needleSize.trim();
      const finalNeedleSize2 = needleSize2.trim();
      
      const pattern = {
        name: finalProjectName,
        projectName: finalProjectName,
        needleSize: finalNeedleSize2 ? `${finalNeedleSize}, ${finalNeedleSize2}` : finalNeedleSize,
        images: images
      };
      
      // 保存 Pattern
      await PatternStorage.save(pattern, images);

      // 重新获取保存的 Pattern
      const savedPatterns = await PatternStorage.getAll();
      const savedPattern = savedPatterns[0]; // 最新保存的 Pattern 会在第一位

      // 跳转到Pattern详情页
      navigation.navigate('PatternDetail', {
        id: savedPattern.id,
        images: savedPattern.images,
        projectName: savedPattern.projectName,
        needleSize: savedPattern.needleSize
      });
    } catch (error) {
      console.error('Failed to save pattern:', error);
      Alert.alert('错误', '保存失败，请重试');
    } finally {
      setSaving(false);
    }
  };

  const handleAdd = () => {
    savePattern(false);
  };

  const handleSkip = () => {
    savePattern(true);
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
        {/* 顶部关闭按钮和标题 */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeBtn}>
            <Text style={styles.closeIcon}>×</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>new pattern</Text>
        </View>

        {/* 项目名称输入框 */}
        <Input
          variant="underline"
          placeholder="project name"
          value={projectName}
          onChangeText={setProjectName}
          style={styles.inputSection}
        />

        {/* 针号输入框 */}
        <View style={styles.inputSection}>
          <Input
            variant="underline"
            label="needle size"
            placeholder=""
            value={needleSize}
            onChangeText={setNeedleSize}
            keyboardType="numeric"
            suffix="mm"
          />
          
          <Input
            variant="underline"
            placeholder=""
            value={needleSize2}
            onChangeText={setNeedleSize2}
            keyboardType="numeric"
            suffix="mm"
          />
        </View>

        {/* 底部按钮 */}
        <View style={styles.buttonContainer}>
          <Button
            title="add"
            onPress={handleAdd}
            variant="primary"
            style={styles.addBtn}
            loading={saving}
            disabled={saving}
          />
          
          <Button
            title="skip"
            onPress={handleSkip}
            variant="text"
            style={styles.skipBtn}
            disabled={saving}
          />
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 40,
    paddingHorizontal: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 60,
  },
  closeBtn: {
    marginRight: 16,
  },
  closeIcon: {
    fontSize: 40,
    color: '#333',
    fontWeight: '300',
    lineHeight: 40,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '400',
    color: '#222',
  },
  inputSection: {
    marginBottom: 40,
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 60,
    left: 24,
    right: 24,
  },
  addBtn: {
    marginBottom: 20,
  },
  skipBtn: {
    alignItems: 'center',
  },
});

export default EditPatternNameScreen; 