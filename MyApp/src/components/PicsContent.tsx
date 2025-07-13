import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Alert, FlatList, Dimensions } from 'react-native';
import * as ImagePicker from 'expo-image-picker';

interface PicsContentProps {
  patternId: string;
}

const { width: screenWidth } = Dimensions.get('window');
const GRID_COLS = 3;
const GRID_ITEM_SIZE = (screenWidth - 48) / GRID_COLS;

const PicsContent: React.FC<PicsContentProps> = ({ patternId }) => {
  const [photos, setPhotos] = useState<string[]>([]);

  // 拍照
  const takePhoto = async () => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
    
    if (permissionResult.granted === false) {
      Alert.alert('权限', '需要相机权限才能拍照');
      return;
    }

    try {
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setPhotos(prev => [...prev, result.assets[0].uri]);
      }
    } catch (error) {
      Alert.alert('错误', '拍照失败');
      console.error('拍照错误:', error);
    }
  };

  // 从相册选择
  const pickFromLibrary = async () => {
    console.log('开始选择相册照片...');
    
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    console.log('权限请求结果:', permissionResult);
    
    if (permissionResult.granted === false) {
      Alert.alert('权限', '需要相册权限来选择图片');
      console.log('权限被拒绝');
      return;
    }

    console.log('相册权限已获得，即将打开相册...');
    
    try {
      console.log('正在调用 launchImageLibraryAsync...');
      
      const result = await ImagePicker.launchImageLibraryAsync({
        quality: 0.8,
        allowsMultipleSelection: true,
      });

      console.log('相册选择结果:', result);

      if (!result.canceled && result.assets) {
        const newPhotos = result.assets.map(asset => asset.uri);
        console.log('添加新照片:', newPhotos);
        setPhotos(prev => [...prev, ...newPhotos]);
      } else {
        console.log('用户取消了相册选择或没有选择照片');
      }
    } catch (error) {
      console.error('选择照片错误:', error);
      Alert.alert('错误', '选择照片失败');
    }
  };

  // 删除照片
  const deletePhoto = (index: number) => {
    Alert.alert(
      '删除照片',
      '确定要删除这张照片吗？',
      [
        { text: '取消', style: 'cancel' },
        {
          text: '删除',
          style: 'destructive',
          onPress: () => {
            setPhotos(prev => prev.filter((_, i) => i !== index));
          },
        },
      ]
    );
  };

  // 渲染网格项
  const renderGridItem = ({ item, index }: { item: string | null; index: number }) => {
    if (index === 0) {
      return (
        <TouchableOpacity 
          style={styles.cameraEntry}
          onPress={takePhoto}
        >
          <Text style={styles.cameraIcon}>📷</Text>
          <Text style={styles.cameraText}>拍照</Text>
        </TouchableOpacity>
      );
    }

    if (index === 1) {
      return (
        <TouchableOpacity 
          style={styles.cameraEntry}
          onPress={pickFromLibrary}
        >
          <Text style={styles.cameraIcon}>🖼️</Text>
          <Text style={styles.cameraText}>相册</Text>
        </TouchableOpacity>
      );
    }

    if (item) {
      const photoIndex = photos.indexOf(item);
      return (
        <TouchableOpacity 
          style={styles.photoItem}
          onLongPress={() => deletePhoto(photoIndex)}
        >
          <Image source={{ uri: item }} style={styles.photoImage} />
          <TouchableOpacity 
            style={styles.deleteBtn}
            onPress={() => deletePhoto(photoIndex)}
          >
            <Text style={styles.deleteIcon}>×</Text>
          </TouchableOpacity>
        </TouchableOpacity>
      );
    }

    return <View style={styles.emptyItem} />;
  };

  const gridData = [null, null, ...photos];

  return (
    <View style={styles.container}>
      <FlatList
        data={gridData}
        renderItem={renderGridItem}
        numColumns={GRID_COLS}
        contentContainerStyle={styles.gridContainer}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  gridContainer: {
    padding: 16,
  },
  cameraEntry: {
    width: GRID_ITEM_SIZE,
    height: GRID_ITEM_SIZE,
    margin: 4,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#ddd',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  cameraText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '400',
  },
  photoItem: {
    width: GRID_ITEM_SIZE,
    height: GRID_ITEM_SIZE,
    margin: 4,
    position: 'relative',
  },
  photoImage: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  deleteBtn: {
    position: 'absolute',
    top: -8,
    right: -8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteIcon: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  emptyItem: {
    width: GRID_ITEM_SIZE,
    height: GRID_ITEM_SIZE,
    margin: 4,
  },
});

export default PicsContent; 