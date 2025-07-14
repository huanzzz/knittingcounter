# PDF转换后端服务

这是一个用于将PDF文件转换为图片的Node.js后端服务。

## 功能特点

- 支持PDF文件上传并转换为PNG图片
- 自动处理多页PDF
- 提供图片访问API
- 支持高分辨率输出（2x缩放）

## 技术栈

- Node.js
- Express.js
- pdf-to-png-converter
- multer（处理文件上传）
- cors（支持跨域请求）

## API接口

### 1. PDF转换接口

将PDF文件转换为PNG图片。

```
POST /api/convert-pdf
Content-Type: multipart/form-data

参数：
- pdf: PDF文件（必需）

响应：
{
  "images": [
    {
      "pageNumber": 1,
      "path": "output/page_1.png",
      "width": 1654,
      "height": 2339
    },
    ...
  ]
}
```

### 2. 图片访问接口

获取转换后的图片文件。

```
GET /api/images/:filename

参数：
- filename: 图片文件名（必需）

响应：
- 图片文件（PNG格式）
```

## 目录结构

```
backend/
├── src/
│   └── index.js          # 主程序入口
├── uploads/              # 上传文件临时目录
├── output/              # 转换后的图片存储目录
├── package.json         # 项目配置和依赖
└── README.md           # 本文档
```

## 安装和运行

1. 安装依赖：
```bash
npm install
```

2. 启动服务：
```bash
# 开发模式（支持热重载）
npm run dev

# 生产模式
npm start
```

默认服务运行在 http://localhost:3000

## 注意事项

1. 确保`uploads`和`output`目录存在且有写入权限
2. 服务会自动创建必要的目录
3. 建议定期清理`output`目录中的旧文件
4. 在生产环境中部署时，建议：
   - 设置适当的文件大小限制
   - 添加文件类型验证
   - 实现文件清理机制
   - 使用环境变量配置端口等参数
   - 添加错误日志记录
   - 考虑使用PM2等进程管理工具

## 开发计划

- [ ] 添加文件大小限制
- [ ] 实现定时清理机制
- [ ] 添加文件格式验证
- [ ] 支持自定义输出格式和质量
- [ ] 添加API认证机制 