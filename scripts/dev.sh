#!/bin/bash

# LinkLink 开发环境启动脚本
# 用于同时启动所有应用：web、server、extension

set -e

echo "🚀 启动 LinkLink 开发环境..."

# 检查 Bun 是否安装
if ! command -v bun &> /dev/null; then
    echo "❌ 错误: Bun 未安装。请访问 https://bun.sh/ 安装 Bun。"
    exit 1
fi

# 检查环境变量文件
if [ ! -f ".env" ]; then
    echo "⚠️  警告: 根目录 .env 文件不存在，复制 .env.example..."
    cp .env.example .env
    echo "✅ 已创建 .env 文件，请根据需要修改配置。"
fi

if [ ! -f "apps/web/.env" ]; then
    echo "⚠️  警告: web 应用 .env 文件不存在，复制 .env.example..."
    cp apps/web/.env.example apps/web/.env
    echo "✅ 已创建 apps/web/.env 文件，请根据需要修改配置。"
fi

if [ ! -f "apps/server/.env" ]; then
    echo "⚠️  警告: server 应用 .env 文件不存在，复制 .env.example..."
    cp apps/server/.env.example apps/server/.env
    echo "✅ 已创建 apps/server/.env 文件，请根据需要修改配置。"
fi

if [ ! -f "apps/extension/.env" ]; then
    echo "⚠️  警告: extension 应用 .env 文件不存在，复制 .env.example..."
    cp apps/extension/.env.example apps/extension/.env
    echo "✅ 已创建 apps/extension/.env 文件，请根据需要修改配置。"
fi

# 安装依赖
echo "📦 安装依赖..."
bun install

# 初始化数据库（如果需要）
echo "🗄️  初始化数据库..."
cd apps/server
if [ ! -f "local.db" ]; then
    echo "创建本地数据库..."
    # 启动数据库服务（在后台运行）
    nohup bun run db:local > /dev/null 2>&1 &
    sleep 3
    bun run db:push
    echo "✅ 数据库初始化完成。"
else
    echo "✅ 数据库已存在。"
fi
cd ../..

# 启动所有应用
echo "🔄 启动所有应用..."

# 使用 Turbo 并行启动所有应用
nohup bun run dev > /dev/null 2>&1 &
TURBO_PID=$!

# 等待 Turbo 启动
echo "⏳ 等待应用启动..."
sleep 8

# 检查应用状态
echo "🔍 检查应用状态..."

# 检查服务器
if curl -s http://localhost:3000/health > /dev/null 2>&1; then
    echo "✅ 服务器应用已启动: http://localhost:3000"
else
    echo "⚠️  服务器应用启动中..."
fi

# 检查 Web 应用
if curl -s http://localhost:3001 > /dev/null 2>&1; then
    echo "✅ Web 应用已启动: http://localhost:3001"
else
    echo "⚠️  Web 应用启动中..."
fi

echo "🎉 开发环境启动完成！"
echo ""
echo "📋 应用访问地址:"
echo "   - Web 应用: http://localhost:3001"
echo "   - 服务器 API: http://localhost:3000"
echo "   - 扩展开发: 在浏览器中加载 apps/extension 目录"
echo ""
echo "🛑 按 Ctrl+C 停止所有应用"

# 等待用户中断
wait $TURBO_PID