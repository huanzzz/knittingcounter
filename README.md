# 编织计数器 (Knitting Counter)

一个用于编织爱好者的计数器应用，支持行数计数和形状计数，具有直观的拖拽重排序和滑动操作功能。

## 项目结构

```
knitting-counter/
├── MyApp/          # React Native 前端应用
│   ├── src/        # 源代码
│   ├── assets/     # 静态资源
│   └── ...
├── backend/        # Node.js 后端服务
│   ├── server.js   # 服务器主文件
│   └── ...
└── README.md
```

## 功能特性

### 前端 (MyApp)
- 📱 React Native + Expo 开发
- 🎯 支持行数计数器和形状计数器
- 🔄 拖拽重排序功能
- 👆 滑动显示编辑/删除操作
- 💾 本地数据持久化
- 🎨 现代化 UI 设计

### 后端 (backend)
- 🚀 Node.js + Express 服务器
- 🔄 数据同步支持
- 📊 计数器数据管理

## 快速开始

### 前端运行
```bash
cd MyApp
npm install
npm start
```

### 后端运行
```bash
cd backend
npm install
npm start
```

## 主要组件

- `SwipeableCounter` - 可滑动的计数器组件，支持拖拽重排序
- `RowCounter` - 行数计数器
- `ShapeCounter` - 形状计数器
- `CounterPanel` - 计数器面板管理

## 开发技术栈

- **前端**: React Native, Expo, TypeScript
- **后端**: Node.js, Express
- **数据存储**: AsyncStorage (本地), JSON (后端)

## 贡献

欢迎提交 Issue 和 Pull Request！ 