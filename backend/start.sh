#!/bin/sh

# 启动 PDF 转换服务
cd /app && NODE_ENV=production PORT=3000 HOST=0.0.0.0 node src/index.js &

# 启动小红书服务
cd /app && NODE_ENV=production PORT=3001 HOST=0.0.0.0 node server.js &

# 等待所有进程
wait