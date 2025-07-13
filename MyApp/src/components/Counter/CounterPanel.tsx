import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, PanResponder, Dimensions } from 'react-native';
import { CounterPanelProps, CounterPanelState, Counter, AddCounterMode } from './CounterTypes';
import RowCounter from './RowCounter';
import ShapeCounter from './ShapeCounter';
import SwipeableCounter from './SwipeableCounter';
import AddCounterMenu from './AddCounterMenu';
import AddRowCounter from './AddRowCounter';
import AddShapeCounter from './AddShapeCounter';
import EditRowCounter from './EditRowCounter';
import EditShapeCounter from './EditShapeCounter';

const { height: screenHeight } = Dimensions.get('window');

const CounterPanel: React.FC<CounterPanelProps> = ({
  counters,
  panelState,
  onPanelStateChange,
  onCounterUpdate,
  onCounterAdd,
  onCounterDelete,
  onCounterReorder,
}) => {
  const [addMode, setAddMode] = useState<AddCounterMode>(null);
  const [editingCounter, setEditingCounter] = useState<Counter | null>(null);

  const getVisibleCounters = () => {
    switch (panelState) {
      case 'collapsed':
        return [];
      case 'partial':
        return counters.slice(0, 1);
      case 'expanded':
        return counters.slice(0, 3);
      default:
        return [];
    }
  };

  const getPanelHeight = () => {
    switch (panelState) {
      case 'collapsed':
        return 60;
      case 'partial':
        return 180;
      case 'expanded':
        return Math.min(450, screenHeight * 0.5);
      default:
        return 60;
    }
  };

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: (evt, gestureState) => {
      return Math.abs(gestureState.dy) > 10;
    },
    onPanResponderMove: () => {},
    onPanResponderRelease: (evt, gestureState) => {
      const { dy } = gestureState;
      
      if (dy < -50) {
        // 向上滑动
        if (panelState === 'collapsed') {
          onPanelStateChange('partial');
        } else if (panelState === 'partial') {
          onPanelStateChange('expanded');
        }
      } else if (dy > 50) {
        // 向下滑动
        if (panelState === 'expanded') {
          onPanelStateChange('partial');
        } else if (panelState === 'partial') {
          onPanelStateChange('collapsed');
        }
      }
    },
  });

  const handleCounterEdit = (counter: Counter) => {
    setEditingCounter(counter);
    if (counter.type === 'row') {
      setAddMode('editRow');
    } else {
      setAddMode('editShape');
    }
  };

  const handleAddCounter = () => {
    setAddMode('menu');
  };

  const handleAddRowCounter = () => {
    setAddMode('row');
  };

  const handleAddShapeCounter = () => {
    setAddMode('shape');
  };

  const handleCancelAdd = () => {
    setAddMode(null);
    setEditingCounter(null);
  };

  const handleConfirmAdd = (counter: Counter) => {
    onCounterAdd(counter);
    setAddMode(null);
  };

  const handleSaveEdit = (counter: Counter) => {
    onCounterUpdate(counter);
    setAddMode(null);
    setEditingCounter(null);
  };

  const renderCounter = (counter: Counter, index: number) => {
    return (
      <SwipeableCounter
        key={counter.id}
        counter={counter}
        index={index}
        onUpdate={onCounterUpdate}
        onEdit={handleCounterEdit}
        onDelete={onCounterDelete}
        onReorder={onCounterReorder}
      />
    );
  };

  const renderAddCounterInterface = () => {
    switch (addMode) {
      case 'menu':
        return (
          <AddCounterMenu
            onSelectRowCounter={handleAddRowCounter}
            onSelectShapeCounter={handleAddShapeCounter}
            onClose={handleCancelAdd}
          />
        );
      case 'row':
        return (
          <AddRowCounter
            onAdd={handleConfirmAdd}
            onCancel={handleCancelAdd}
          />
        );
      case 'shape':
        return (
          <AddShapeCounter
            onAdd={handleConfirmAdd}
            onCancel={handleCancelAdd}
          />
        );
      case 'editRow':
        return editingCounter && editingCounter.type === 'row' ? (
          <EditRowCounter
            counter={editingCounter}
            onSave={handleSaveEdit}
            onCancel={handleCancelAdd}
          />
        ) : null;
      case 'editShape':
        return editingCounter && editingCounter.type === 'shape' ? (
          <EditShapeCounter
            counter={editingCounter}
            onSave={handleSaveEdit}
            onCancel={handleCancelAdd}
          />
        ) : null;
      default:
        return null;
    }
  };

  return (
    <View style={[styles.container, { height: getPanelHeight() }]}>
      {/* 拖拽手柄 */}
      <View {...panResponder.panHandlers} style={styles.handle}>
        <View style={styles.handleBar} />
        {/* 添加计数器按钮 - 只在非添加模式时显示 */}
        {panelState !== 'collapsed' && !addMode && (
          <TouchableOpacity 
            style={styles.addBtn} 
            onPress={handleAddCounter}
          >
            <Text style={styles.addBtnText}>+</Text>
          </TouchableOpacity>
        )}
      </View>

      {panelState === 'collapsed' ? (
        // 完全收起状态
        <View style={styles.collapsedContent}>
          <TouchableOpacity onPress={() => onPanelStateChange('partial')}>
            <Text style={styles.expandIcon}>∧</Text>
          </TouchableOpacity>
        </View>
      ) : (
        // 展开状态
        <View style={styles.expandedContent}>
          {/* 添加/编辑计数器界面 - 直接在框内显示 */}
          {addMode && renderAddCounterInterface()}
          
          {/* 计数器列表 */}
          {!addMode && (
            <View style={styles.counterList}>
              {panelState === 'expanded' && counters.length > 3 ? (
                <ScrollView showsVerticalScrollIndicator={false}>
                  {counters.map((counter, index) => renderCounter(counter, index))}
                </ScrollView>
              ) : (
                <View>
                  {getVisibleCounters().map((counter, index) => renderCounter(counter, index))}
                </View>
              )}
            </View>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  handle: {
    alignItems: 'center',
    paddingVertical: 12,
    position: 'relative',
  },
  handleBar: {
    width: 40,
    height: 4,
    backgroundColor: '#ddd',
    borderRadius: 2,
  },
  addBtn: {
    position: 'absolute',
    right: 16,
    top: 6,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#ddd',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addBtnText: {
    fontSize: 20,
    color: '#333',
    fontWeight: '300',
    textAlign: 'center',
    lineHeight: 20,
  },
  collapsedContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  expandIcon: {
    fontSize: 24,
    color: '#666',
  },
  expandedContent: {
    flex: 1,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  counterList: {
    marginTop: 15, // 添加顶部边距
  },
});

export default CounterPanel; 