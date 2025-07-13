export type CounterType = 'row' | 'shape';

export interface BaseCounter {
  id: string;
  name: string;
  type: CounterType;
}

export interface RowCounter extends BaseCounter {
  type: 'row';
  currentRow: number;
  startRow: number;
  endRow: number;
}

export interface ShapeCounter extends BaseCounter {
  type: 'shape';
  currentTimes: number;
  maxTimes: number;
  currentRows: number;
  maxRows: number;
}

export type Counter = RowCounter | ShapeCounter;

export type CounterPanelState = 'collapsed' | 'partial' | 'expanded';

// 添加计数器相关的新类型
export type AddCounterMode = 'menu' | 'row' | 'shape' | 'editRow' | 'editShape' | null;

export interface AddRowCounterForm {
  name: string;
  startRow: string;
  endRow: string;
}

export interface AddShapeCounterForm {
  name: string;
  times: string;
  rows: string;
  isLinked: boolean;
}

// 编辑计数器相关的新类型
export interface EditRowCounterForm {
  name: string;
  startRow: string;
  endRow: string;
}

export interface EditShapeCounterForm {
  name: string;
  times: string;
  rows: string;
  isLinked: boolean;
}

export interface CounterPanelProps {
  counters: Counter[];
  panelState: CounterPanelState;
  onPanelStateChange: (state: CounterPanelState) => void;
  onCounterUpdate: (counter: Counter) => void;
  onCounterAdd: (counter: Counter) => void;
  onCounterDelete: (id: string) => void;
  onCounterReorder: (fromIndex: number, toIndex: number) => void;
} 