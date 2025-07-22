# 使用 Node.js 官方镜像
FROM node:20-alpine

# 安装必要的工具
RUN apk add --no-cache curl

# 设置工作目录
WORKDIR /app

# 复制项目文件
COPY package*.json ./
COPY src/ ./src/
COPY *.js ./

# 安装依赖
RUN npm ci --only=production

# 创建必要的目录
RUN mkdir -p uploads output && \
    chmod 777 uploads output

# 添加启动脚本
COPY start.sh /start.sh
RUN chmod +x /start.sh

# 设置环境变量
ENV NODE_ENV=production
ENV PORT=3000
ENV XHS_PORT=3001
ENV HOST=0.0.0.0

# 暴露端口
EXPOSE 3000 3001

# 启动服务
CMD ["/start.sh"]