import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, ScrollView, Image, Dimensions, PanResponder, TouchableWithoutFeedback, Keyboard, Animated } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import * as ImageManipulator from 'expo-image-manipulator';
import { Button, Input } from '../components/design-system';
import Config from 'react-native-config';

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

const API_HOST = Config.API_HOST || 'http://localhost';

const AddPatternScreen: React.FC<Props> = ({ navigation }) => {
  const [linkUrl, setLinkUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [extractedImages, setExtractedImages] = useState<string[]>([]);
  const [showImages, setShowImages] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [scrollEnabled, setScrollEnabled] = useState(true);

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
      const url = `${API_HOST}:3001/api/xhs/images`
      
      const response = await fetch(url, {
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

  // 处理图片选择
  const handleImagePicker = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (permissionResult.granted === false) {
        Alert.alert('提示', '需要相册权限来选择图片');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        quality: 1,
      });

      if (!result.canceled && result.assets) {
        const selectedImages = result.assets.map(asset => asset.uri);
        setExtractedImages(prevImages => [...prevImages, ...selectedImages]);
        setShowImages(true);
      }
    } catch (error) {
      console.error('选择图片失败:', error);
      Alert.alert('错误', '选择图片失败，请重试');
    }
  };

  // 处理PDF选择
  const handlePdfPicker = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/pdf',
      });

      if (result.canceled) {
        return;
      }

      setIsLoading(true);
      const pdfUri = result.assets[0].uri;
      
      // 创建FormData对象
      const formData = new FormData();
      formData.append('pdf', {
        uri: pdfUri,
        type: 'application/pdf',
        name: 'pattern.pdf'
      } as any);

      // 调用后端API转换PDF
      const response = await fetch(`${API_HOST}:3000/api/convert-pdf`, {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (!response.ok) {
        throw new Error('PDF转换失败');
      }

      const data = await response.json();
      
      if (data.images && data.images.length > 0) {
        // 将后端返回的图片路径转换为完整URL
        const imageUrls = data.images.map((img: any) => 
          `${API_HOST}:3000/api/images/${img.path.split('/').pop()}`
        );
        setExtractedImages(imageUrls);
        setShowImages(true);
        setSelectedImageIndex(0);
      } else {
        throw new Error('未能从PDF中提取图片');
      }

    } catch (error) {
      console.error('PDF处理失败:', error);
      Alert.alert('错误', '无法处理PDF文件，请重试');
    } finally {
      setIsLoading(false);
    }
  };

  const moveImage = (fromIndex: number, toIndex: number) => {
    if (fromIndex === toIndex || toIndex < 0 || toIndex >= extractedImages.length) return;
    
    setExtractedImages(prev => {
      const newImages = [...prev];
      const [movedImage] = newImages.splice(fromIndex, 1);
      newImages.splice(toIndex, 0, movedImage);
      
      // 更新选中索引
      if (selectedImageIndex === fromIndex) {
        setSelectedImageIndex(toIndex);
      } else if (selectedImageIndex > fromIndex && selectedImageIndex <= toIndex) {
        setSelectedImageIndex(selectedImageIndex - 1);
      } else if (selectedImageIndex < fromIndex && selectedImageIndex >= toIndex) {
        setSelectedImageIndex(selectedImageIndex + 1);
      }

      return newImages;
    });
  };

  const DraggableThumbnail = ({ imageUrl, index, isSelected, onPress, onMove }: {
    imageUrl: string;
    index: number;
    isSelected: boolean;
    onPress: () => void;
    onMove: (fromIndex: number, toIndex: number) => void;
  }) => {
    const [isDragging, setIsDragging] = useState(false);
    const dragPosition = useRef(new Animated.Value(0)).current;
    const scale = useRef(new Animated.Value(1)).current;
    const isDraggingRef = useRef(false);
    const lastMoveX = useRef(0);
    const hasMovedRef = useRef(false);

    useEffect(() => {
      isDraggingRef.current = isDragging;
      // 添加拖拽时的缩放动画
      Animated.spring(scale, {
        toValue: isDragging ? 1.1 : 1,
        useNativeDriver: true,
        tension: 40,
        friction: 5
      }).start();
    }, [isDragging]);

    const panResponder = useRef(
      PanResponder.create({
        onStartShouldSetPanResponder: () => isDraggingRef.current,
        onStartShouldSetPanResponderCapture: () => isDraggingRef.current,
        onMoveShouldSetPanResponder: (_, gestureState) => {
          if (!isDraggingRef.current) return false;
          const { dx, dy } = gestureState;
          const shouldRespond = Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 2;
          return shouldRespond;
        },
        onMoveShouldSetPanResponderCapture: (_, gestureState) => {
          if (!isDraggingRef.current) return false;
          const { dx, dy } = gestureState;
          return Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 2;
        },

        onPanResponderGrant: (_, gestureState) => {
          lastMoveX.current = gestureState.moveX;
          hasMovedRef.current = false;
          dragPosition.setValue(0);
        },

        onPanResponderMove: (_, gestureState) => {
          if (!isDraggingRef.current) return;
          
          const dx = gestureState.dx;
          dragPosition.setValue(dx);
          
          const itemWidth = 92;
          if (Math.abs(dx) > itemWidth / 2) {
            const targetIndex = index + (dx > 0 ? 1 : -1);
            if (targetIndex >= 0 && targetIndex < extractedImages.length) {
              onMove(index, targetIndex);
              lastMoveX.current = gestureState.moveX;
              // 平滑重置位置
              Animated.spring(dragPosition, {
                toValue: 0,
                useNativeDriver: true,
                tension: 50,
                friction: 6
              }).start();
            }
          }
        },

        onPanResponderRelease: () => {
          // 平滑重置位置和状态
          Animated.parallel([
            Animated.spring(dragPosition, {
              toValue: 0,
              useNativeDriver: true,
              tension: 50,
              friction: 6
            }),
            Animated.spring(scale, {
              toValue: 1,
              useNativeDriver: true,
              tension: 40,
              friction: 5
            })
          ]).start(() => {
            setIsDragging(false);
            hasMovedRef.current = false;
          });
        },

        onPanResponderTerminate: () => {
          // 平滑重置位置和状态
          Animated.parallel([
            Animated.spring(dragPosition, {
              toValue: 0,
              useNativeDriver: true,
              tension: 50,
              friction: 6
            }),
            Animated.spring(scale, {
              toValue: 1,
              useNativeDriver: true,
              tension: 40,
              friction: 5
            })
          ]).start(() => {
            setIsDragging(false);
            hasMovedRef.current = false;
          });
        },

        onPanResponderTerminationRequest: () => false,
      })
    ).current;

    const handleLongPress = () => {
      setIsDragging(true);
      isDraggingRef.current = true;
      hasMovedRef.current = false;
    };

    return (
      <Animated.View 
        style={[
          styles.thumbnailWrapper,
          isDragging && styles.draggingThumbnail,
          {
            transform: [
              { translateX: dragPosition },
              { scale: scale }
            ],
            zIndex: isDragging ? 999 : 1
          }
        ]}
        {...panResponder.panHandlers}
      >
        <TouchableOpacity
          style={[styles.thumbnail, isSelected && styles.selectedThumbnail]}
          onPress={onPress}
          onLongPress={handleLongPress}
          delayLongPress={500}
          activeOpacity={0.7}
        >
          <Image source={{ uri: imageUrl }} style={styles.thumbnailImage} />
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.deleteBtn}
          onPress={() => handleDeleteImage(index)}
        >
          <Text style={styles.deleteIcon}>×</Text>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const handleConfirmImages = () => {
    if (extractedImages.length === 0) {
      Alert.alert('提示', '请至少选择一张图片');
      return;
    }
    
    // 跳转到编辑pattern名称页面，传递排序后的图片数组
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
            scrollEnabled={true}
            alwaysBounceHorizontal={true}
            decelerationRate="normal"
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
            <TouchableOpacity style={styles.addMoreBtn} onPress={handleImagePicker}>
              <Text style={styles.addMoreIcon}>+</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>

        {/* 确认按钮 */}
        <Button
          title="add"
          onPress={handleConfirmImages}
          variant="primary"
          size="large"
          style={styles.confirmBtn}
        />
      </View>
    );
  }

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
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
              variant="primary"
              size="medium"
              style={styles.addButton}
            />
          }
        />
        
        {/* 其他添加方式 */}
        <View style={styles.addBox}>
          <Text style={styles.addLabel}>pics</Text>
          <Button
            title="add"
            onPress={handleImagePicker}
            disabled={isLoading}
            variant="primary"
            size="medium"
            style={styles.addButton}
          />
        </View>
        <View style={styles.addBox}>
          <Text style={styles.addLabel}>pdf</Text>
          <Button
            title="add"
            onPress={handlePdfPicker}
            disabled={isLoading}
            variant="primary"
            size="medium"
            style={styles.addButton}
          />
        </View>

        {isLoading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#666" />
            <Text style={styles.loadingText}>处理中...</Text>
          </View>
        )}
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
    height: screenWidth * 1.0,
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
    marginTop: 0,
    paddingTop: 0,
  },
  thumbnailList: {
    paddingHorizontal: 4,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  thumbnailWrapper: {
    marginRight: 12,
    position: 'relative',
  },
  draggingThumbnail: {
    zIndex: 1000,
    elevation: 10,
    shadowColor: '#000',
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
    top: -6,
    right: -6,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
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
    marginBottom: 20,
    width: '100%',
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
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
});

export default AddPatternScreen; 