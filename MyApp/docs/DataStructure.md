# 数据结构文档

## 依赖
- `expo-sqlite`: SQLite 数据库管理
  - 版本: 15.2.14
  - 用途: 本地数据存储
  - 安装: `npx expo install expo-sqlite`

## 数据库结构

### 1. patterns 表
存储编织图解的基本信息
```sql
CREATE TABLE patterns (
  id TEXT PRIMARY KEY,        -- 唯一标识符
  name TEXT,                  -- 图解名称
  project_name TEXT,          -- 项目名称
  needle_size TEXT,           -- 针号
  created_at INTEGER,         -- 创建时间戳
  updated_at INTEGER          -- 更新时间戳
);
```

### 2. pattern_images 表
存储每个图解的图片
```sql
CREATE TABLE pattern_images (
  id TEXT PRIMARY KEY,        -- 图片唯一标识符
  pattern_id TEXT,           -- 关联的图解ID
  image_uri TEXT,            -- 图片URI
  sort_order INTEGER,        -- 排序顺序
  FOREIGN KEY (pattern_id) REFERENCES patterns(id) ON DELETE CASCADE
);
```

### 3. user_photos 表
存储用户为图解拍摄的照片
```sql
CREATE TABLE user_photos (
  id TEXT PRIMARY KEY,        -- 照片唯一标识符
  pattern_id TEXT,           -- 关联的图解ID
  photo_uri TEXT,            -- 照片URI
  created_at INTEGER,        -- 创建时间戳
  FOREIGN KEY (pattern_id) REFERENCES patterns(id) ON DELETE CASCADE
);
```

### 4. notes 表
存储图解相关的笔记
```sql
CREATE TABLE notes (
  id TEXT PRIMARY KEY,        -- 笔记唯一标识符
  pattern_id TEXT,           -- 关联的图解ID
  content TEXT,              -- 笔记内容
  updated_at INTEGER,        -- 更新时间戳
  FOREIGN KEY (pattern_id) REFERENCES patterns(id) ON DELETE CASCADE
);
```

### 5. counters 表
存储计数器信息
```sql
CREATE TABLE counters (
  id TEXT PRIMARY KEY,        -- 计数器唯一标识符
  pattern_id TEXT,           -- 关联的图解ID
  name TEXT,                 -- 计数器名称
  type TEXT,                 -- 类型：'row' 或 'shape'
  sort_order INTEGER,        -- 排序顺序
  current_row INTEGER,       -- 当前行数（row类型）
  start_row INTEGER,         -- 起始行数（row类型）
  end_row INTEGER,          -- 结束行数（row类型）
  current_times INTEGER,     -- 当前次数（shape类型）
  max_times INTEGER,        -- 最大次数（shape类型）
  current_rows INTEGER,     -- 当前行数（shape类型）
  max_rows INTEGER,         -- 最大行数（shape类型）
  created_at INTEGER,       -- 创建时间戳
  updated_at INTEGER,       -- 更新时间戳
  FOREIGN KEY (pattern_id) REFERENCES patterns(id) ON DELETE CASCADE
);
```

## 数据访问层

### 数据库初始化
- 文件: `src/utils/database.ts`
- 函数: `initDatabase()`
- 调用时机: 应用启动时在 `App.tsx` 中调用

### Pattern 操作 (PatternDB)
- 文件: `src/utils/database.ts`
- 主要方法:
  - `savePattern(pattern: Pattern, images: string[])`: 保存新的图解
  - `getAllPatterns()`: 获取所有图解
  - `getPattern(id: string)`: 获取单个图解
  - `deletePattern(id: string)`: 删除图解

### 照片操作 (PhotoStorage)
- 文件: `src/utils/PhotoStorage.ts`
- 主要方法:
  - `init()`: 初始化照片存储
  - `savePhoto(patternId: string, photoUri: string)`: 保存照片
  - `getPhotos(patternId: string)`: 获取指定图解的所有照片
  - `deletePhoto(patternId: string, photoUri: string)`: 删除照片

### 计数器操作 (CounterDB)
- 文件: `src/utils/database.ts`
- 主要方法:
  - `saveCounters(patternId: string, counters: Counter[])`: 保存计数器
  - `getCounters(patternId: string)`: 获取指定图解的所有计数器

## 数据类型定义

### Pattern 类型
文件: `src/types/Pattern.ts`
```typescript
interface Pattern {
  id: string;
  name: string;
  images: string[];
  projectName: string;
  needleSize: string;
  createdAt: number;
  updatedAt: number;
}
```

### Counter 类型
文件: `src/components/Counter/CounterTypes.ts`
```typescript
interface Counter {
  id: string;
  name: string;
  type: 'row' | 'shape';
}

interface RowCounter extends Counter {
  type: 'row';
  currentRow: number;
  startRow: number;
  endRow: number;
}

interface ShapeCounter extends Counter {
  type: 'shape';
  currentTimes: number;
  maxTimes: number;
  currentRows: number;
  maxRows: number;
}
```

## 使用示例

### 保存新的 Pattern
```typescript
// 在 EditPatternNameScreen 中
const pattern = {
  name: finalProjectName,
  projectName: finalProjectName,
  needleSize: needleSize,
  images: images
};
await PatternStorage.save(pattern, images);
```

### 加载所有 Patterns
```typescript
// 在 HomeScreen 中
const patterns = await PatternStorage.getAll();
```

### 保存照片
```typescript
// 在 PicsContent 中
await PhotoStorage.savePhoto(patternId, photoUri);
```

### 管理计数器
```typescript
// 在 PatternDetailScreen 中
await CounterDB.saveCounters(patternId, counters);
const savedCounters = await CounterDB.getCounters(patternId);
```

## 注意事项

1. 所有表都使用 CASCADE 删除，删除 pattern 时会自动删除相关的所有数据
2. 图片和照片以 URI 形式存储，实际文件需要单独管理
3. 时间戳使用 INTEGER 类型存储（毫秒级 Unix 时间戳）
4. ID 使用 TEXT 类型以支持自定义 ID 格式 