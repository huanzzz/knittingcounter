import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { Button, Input } from '../components/design-system';

type RootStackParamList = {
  AddPattern: undefined;
  EditPatternName: { images: string[] };
  PatternDetail: { 
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

  const handleAdd = () => {
    const finalProjectName = projectName.trim() || 'project name';
    const finalNeedleSize = needleSize.trim();
    const finalNeedleSize2 = needleSize2.trim();
    
    // 跳转到Pattern详情页
    navigation.navigate('PatternDetail', {
      images,
      projectName: finalProjectName,
      needleSize: finalNeedleSize2 ? `${finalNeedleSize}, ${finalNeedleSize2}` : finalNeedleSize,
    });
  };

  const handleSkip = () => {
    const finalProjectName = projectName.trim() || 'project name';
    const finalNeedleSize = needleSize.trim();
    const finalNeedleSize2 = needleSize2.trim();
    
    // 跳转到Pattern详情页
    navigation.navigate('PatternDetail', {
      images,
      projectName: finalProjectName,
      needleSize: finalNeedleSize2 ? `${finalNeedleSize}, ${finalNeedleSize2}` : finalNeedleSize,
    });
  };

  return (
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
        />
        
        <Button
          title="skip"
          onPress={handleSkip}
          variant="text"
          style={styles.skipBtn}
        />
      </View>
    </View>
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
  input: {
    fontSize: 22,
    color: '#222',
    paddingVertical: 12,
    paddingHorizontal: 0,
  },
  label: {
    fontSize: 22,
    color: '#222',
    marginBottom: 20,
  },
  needleSizeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  needleSizeInput: {
    flex: 1,
    fontSize: 22,
    color: '#222',
    paddingVertical: 12,
    paddingHorizontal: 0,
  },
  unit: {
    fontSize: 22,
    color: '#222',
    marginLeft: 8,
  },
  underline: {
    height: 1,
    backgroundColor: '#222',
    marginBottom: 20,
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 60,
    left: 24,
    right: 24,
  },
  addBtn: {
    backgroundColor: '#aaa',
    borderRadius: 20,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 20,
  },
  addBtnText: {
    fontSize: 20,
    color: '#222',
    fontWeight: '500',
  },
  skipBtn: {
    alignItems: 'center',
  },
  skipBtnText: {
    fontSize: 20,
    color: '#222',
    fontWeight: '400',
  },
});

export default EditPatternNameScreen; 