# 编织图解App - 后端API

## 功能
- 抓取小红书笔记中的图片
- 支持多种抓取策略（基础版 + 高级版）
- RESTful API接口

## 安装

```bash
cd backend
npm install
```

## 运行

### 开发模式
```bash
npm run dev
```

### 生产模式
```bash
npm start
```

服务器将在 `http://localhost:3001` 启动

## API接口

### 1. 健康检查
```
GET /health
```

### 2. 基础测试
```
GET /api/test
```

### 3. 抓取小红书图片
```
POST /api/xhs/images
Content-Type: application/json

{
  "url": "https://www.xiaohongshu.com/explore/xxxxxxx"
}
```

**响应示例：**
```json
{
  "success": true,
  "images": [
    "https://sns-img-hw.xhscdn.com/xxxx1.jpg",
    "https://sns-img-hw.xhscdn.com/xxxx2.jpg"
  ],
  "count": 2
}
```

## 测试

运行测试脚本：
```bash
node test.js
```

## 技术方案

### 基础版本（axios + cheerio）
- 发送HTTP请求获取页面HTML
- 使用cheerio解析DOM，提取图片URL
- 轻量快速，但可能被反爬限制

### 高级版本（Puppeteer）
- 启动无头浏览器模拟真实访问
- 拦截网络请求获取图片URL
- 支持JavaScript渲染，成功率更高

## 注意事项

1. **反爬机制**：小红书有反爬保护，可能需要定期更新策略
2. **性能考虑**：Puppeteer较重，建议优先使用基础版本
3. **错误处理**：包含完整的错误处理和日志记录
4. **CORS**：已配置跨域支持，可被前端调用 