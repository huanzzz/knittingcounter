import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, ScrollView, Image, Dimensions, PanResponder } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import * as ImagePicker from 'expo-image-picker';
import { Button, Input } from '../components/design-system';

type RootStackParamList = {
  AddPattern: undefined;
  Home: undefined;
  EditPatternName: { images: string[] };
};

type AddPatternScreenNavigationProp = StackNavigationProp<RootStackParamList, 'AddPattern'>;

type Props = {
  navigation: AddPatternScreenNavigationProp;
};

const { width: screenWidth } = Dimensions.get('window');

const AddPatternScreen: React.FC<Props> = ({ navigation }) => {
  const [linkUrl, setLinkUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [extractedImages, setExtractedImages] = useState<string[]>([]);
  const [showImages, setShowImages] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [scrollEnabled, setScrollEnabled] = useState(true); // 新增：控制ScrollView是否可滚动

  const handleLinkAdd = async () => {
    if (!linkUrl.trim()) {
      Alert.alert('提示', '请输入小红书链接');
      return;
    }

    if (!linkUrl.includes('xiaohongshu.com')) {
      Alert.alert('错误', '请输入有效的小红书链接');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('http://192.168.1.152:3001/api/xhs/images', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: linkUrl.trim() }),
      });

      const data = await response.json();

      if (data.success && data.images.length > 0) {
        setExtractedImages(data.images);
        setShowImages(true);
        setSelectedImageIndex(0);
        Alert.alert('YES!', `Got ${data.count} pics！`);
      } else {
        Alert.alert('失败', '未能抓取到图片，请检查链接是否正确');
      }
    } catch (error) {
      console.error('API调用失败:', error);
      Alert.alert('错误', '网络请求失败，请检查后端服务是否启动');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteImage = (index: number) => {
    Alert.alert(
      'Delete?',
      'sure？',
      [
        { text: 'no', style: 'cancel' },
        { 
          text: 'delete', 
          style: 'destructive',
          onPress: () => {
            const newImages = extractedImages.filter((_, i) => i !== index);
            setExtractedImages(newImages);
            
            if (newImages.length === 0) {
              setShowImages(false);
              return;
            }
            
            // 调整选中的图片索引
            if (selectedImageIndex >= newImages.length) {
              setSelectedImageIndex(newImages.length - 1);
            } else if (selectedImageIndex > index) {
              setSelectedImageIndex(selectedImageIndex - 1);
            }
          }
        }
      ]
    );
  };

  const handleAddMoreImages = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (permissionResult.granted === false) {
      Alert.alert('权限', '需要相册权限来选择图片');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      allowsMultipleSelection: true,
      quality: 1,
    });

    if (!result.canceled && result.assets) {
      const newImageUris = result.assets.map((asset: any) => asset.uri);
      setExtractedImages([...extractedImages, ...newImageUris]);
    }
  };

  const moveImage = (fromIndex: number, toIndex: number) => {
    if (fromIndex === toIndex || toIndex < 0 || toIndex >= extractedImages.length) return;
    
    const newImages = [...extractedImages];
    const [movedImage] = newImages.splice(fromIndex, 1);
    newImages.splice(toIndex, 0, movedImage);
    setExtractedImages(newImages);
    
    // 更新选中索引
    if (selectedImageIndex === fromIndex) {
      setSelectedImageIndex(toIndex);
    } else if (selectedImageIndex > fromIndex && selectedImageIndex <= toIndex) {
      setSelectedImageIndex(selectedImageIndex - 1);
    } else if (selectedImageIndex < fromIndex && selectedImageIndex >= toIndex) {
      setSelectedImageIndex(selectedImageIndex + 1);
    }
  };

  const DraggableThumbnail = ({ imageUrl, index, isSelected, onPress, onMove }: {
    imageUrl: string;
    index: number;
    isSelected: boolean;
    onPress: () => void;
    onMove: (fromIndex: number, toIndex: number) => void;
  }) => {
    const [isDragging, setIsDragging] = useState(false);
    const [dragPosition, setDragPosition] = useState({ x: 0, y: 0 });

    const panResponder = PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onStartShouldSetPanResponderCapture: () => false,
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        // 只有在长按且移动距离足够时才开始拖拽
        return isDragging && (Math.abs(gestureState.dx) > 10 || Math.abs(gestureState.dy) > 10);
      },
      onMoveShouldSetPanResponderCapture: (evt, gestureState) => {
        // 如果正在拖拽，阻止其他手势（包括ScrollView）
        return isDragging && (Math.abs(gestureState.dx) > 10 || Math.abs(gestureState.dy) > 10);
      },
      
      onPanResponderGrant: () => {
        setDragPosition({ x: 0, y: 0 });
        setScrollEnabled(false); // 开始拖拽时禁用ScrollView滚动
      },
      
      onPanResponderMove: (evt, gestureState) => {
        if (isDragging) {
          setDragPosition({ x: gestureState.dx, y: gestureState.dy });
          
          // 计算目标位置
          const itemWidth = 92; // 80 + 12 margin
          const newIndex = Math.round(index + gestureState.dx / itemWidth);
          const clampedIndex = Math.max(0, Math.min(extractedImages.length - 1, newIndex));
          
          if (clampedIndex !== index && Math.abs(gestureState.dx) > itemWidth / 2) {
            onMove(index, clampedIndex);
          }
        }
      },
      
      onPanResponderRelease: () => {
        setIsDragging(false);
        setDragPosition({ x: 0, y: 0 });
        setScrollEnabled(true); // 拖拽结束后重新启用ScrollView滚动
      },
      
      onPanResponderTerminate: () => {
        // 如果手势被中断，也要重置状态
        setIsDragging(false);
        setDragPosition({ x: 0, y: 0 });
        setScrollEnabled(true);
      },
    });

    const handleLongPress = () => {
      setIsDragging(true);
      // 长按时就禁用滚动，确保后续的拖拽手势能正常工作
      setScrollEnabled(false);
    };

    return (
      <View 
        style={[
          styles.thumbnailWrapper,
          isDragging && styles.draggingThumbnail,
          { transform: [{ translateX: dragPosition.x }, { translateY: dragPosition.y }] }
        ]}
        {...panResponder.panHandlers}
      >
        <TouchableOpacity
          style={[
            styles.thumbnail,
            isSelected && styles.selectedThumbnail
          ]}
          onPress={onPress}
          onLongPress={handleLongPress}
          delayLongPress={500} // 增加长按延迟，避免误触
        >
          <Image source={{ uri: imageUrl }} style={styles.thumbnailImage} />
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.deleteBtn}
          onPress={() => handleDeleteImage(index)}
        >
          <Text style={styles.deleteIcon}>×</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const handleConfirmImages = () => {
    if (extractedImages.length === 0) {
      Alert.alert('提示', '请至少选择一张图片');
      return;
    }
    
    // 跳转到编辑pattern名称页面
    navigation.navigate('EditPatternName', { images: extractedImages });
  };

  const handleResetImages = () => {
    setExtractedImages([]);
    setShowImages(false);
    setLinkUrl('');
    setSelectedImageIndex(0);
  };

  if (showImages) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleResetImages} style={styles.closeBtn}>
            <Text style={styles.closeIcon}>×</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>new pattern</Text>
        </View>
        
        {/* 大图预览 */}
        <View style={styles.previewContainer}>
          <Image 
            source={{ uri: extractedImages[selectedImageIndex] }} 
            style={styles.previewImage}
            resizeMode="contain"
          />
        </View>

        {/* 小图列表 */}
        <View style={styles.thumbnailContainer}>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.thumbnailList}
            scrollEnabled={scrollEnabled} // 动态控制是否可滚动
          >
            {extractedImages.map((imageUrl, index) => (
              <DraggableThumbnail
                key={`${imageUrl}-${index}`}
                imageUrl={imageUrl}
                index={index}
                isSelected={selectedImageIndex === index}
                onPress={() => setSelectedImageIndex(index)}
                onMove={moveImage}
              />
            ))}
            
            {/* 添加更多图片按钮 */}
            <TouchableOpacity style={styles.addMoreBtn} onPress={handleAddMoreImages}>
              <Text style={styles.addMoreIcon}>+</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>

        {/* 确认按钮 */}
        <TouchableOpacity style={styles.confirmBtn} onPress={handleConfirmImages}>
          <Text style={styles.confirmBtnText}>add</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* 顶部关闭按钮和标题 */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeBtn}>
          <Text style={styles.closeIcon}>×</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>new pattern</Text>
      </View>
      
      {/* 链接输入框 */}
      <Input
        variant="default"
        placeholder="link"
        value={linkUrl}
        onChangeText={setLinkUrl}
        disabled={isLoading}
        style={styles.linkInputContainer}
        suffix={
          <Button
            title="add"
            onPress={handleLinkAdd}
            disabled={isLoading}
            loading={isLoading}
            variant="secondary"
            size="small"
            style={styles.addButton}
          />
        }
      />
      
      {/* 其他添加方式 */}
      <View style={styles.addBox}>
        <Text style={styles.addLabel}>pics</Text>
        <TouchableOpacity style={styles.addBtn}>
          <Text style={styles.addBtnText}>add</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.addBox}>
        <Text style={styles.addLabel}>pdf</Text>
        <TouchableOpacity style={styles.addBtn}>
          <Text style={styles.addBtnText}>add</Text>
        </TouchableOpacity>
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
  addBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#222',
    borderRadius: 16,
    paddingVertical: 24,
    paddingHorizontal: 24,
    marginBottom: 32,
    justifyContent: 'space-between',
  },
  addLabel: {
    fontSize: 22,
    color: '#444',
  },
  linkInput: {
    fontSize: 22,
    color: '#444',
    flex: 1,
    marginRight: 16,
  },
  addBtn: {
    backgroundColor: '#ddd',
    borderRadius: 4,
    paddingHorizontal: 28,
    paddingVertical: 10,
  },
  addBtnDisabled: {
    backgroundColor: '#eee',
  },
  addBtnText: {
    fontSize: 20,
    color: '#222',
  },
  previewContainer: {
    height: screenWidth * 1.0, // 1:1.25比例
    backgroundColor: '#f0f0f0',
    marginBottom: 20,
    borderRadius: 8,
    overflow: 'hidden',
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  thumbnailContainer: {
    height: 100,
    marginBottom: 20,
    marginTop: 0, // 增加上边距
    paddingTop: 0, // 增加内部上边距，确保删除按钮不被遮挡
  },
  thumbnailList: {
    paddingHorizontal: 4,
    paddingVertical: 10, // 增加垂直内边距
  },
  thumbnailWrapper: {
    marginRight: 12,
    position: 'relative',
  },
  draggingThumbnail: {
    zIndex: 1000,
    elevation: 10, // Android 阴影
    shadowColor: '#000', // iOS 阴影
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  thumbnail: {
    width: 80,
    height: 80,
    borderRadius: 8,
    overflow: 'hidden',
  },
  selectedThumbnail: {
    borderWidth: 3,
    borderColor: '#007AFF',
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
  },
  deleteBtn: {
    position: 'absolute',
    top: -6, // 稍微向上，确保在图片上层
    right: -6, // 稍微向右，确保在图片上层
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10, // 确保在最上层
  },
  deleteIcon: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
    lineHeight: 14,
  },
  addMoreBtn: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: '#ddd',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 4,
  },
  addMoreIcon: {
    fontSize: 32,
    color: '#666',
  },
  confirmBtn: {
    backgroundColor: '#aaa',
    borderRadius: 20,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 20,
  },
  confirmBtnText: {
    fontSize: 20,
    color: '#222',
    fontWeight: '500',
  },
  linkInputContainer: {
    marginBottom: 32,
  },
  addButton: {
    minWidth: 60,
  },
});

export default AddPatternScreen; 