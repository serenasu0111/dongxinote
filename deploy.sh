#!/bin/bash

# 东西笔记 - 快速部署脚本
# 使用方法: ./deploy.sh [platform]
# platform 可选: netlify, vercel, render, docker

set -e

echo "🚀 东西笔记部署脚本"
echo "===================="

PLATFORM=${1:-""}

if [ -z "$PLATFORM" ]; then
    echo ""
    echo "请选择部署平台:"
    echo "1. Netlify (前端) + Render (后端) - 推荐"
    echo "2. Vercel (前端) + Railway (后端)"
    echo "3. Docker (自有服务器)"
    echo ""
    read -p "请输入选项 (1-3): " choice
    
    case $choice in
        1) PLATFORM="netlify" ;;
        2) PLATFORM="vercel" ;;
        3) PLATFORM="docker" ;;
        *) echo "无效选项"; exit 1 ;;
    esac
fi

case $PLATFORM in
    netlify)
        echo ""
        echo "📦 部署方案: Netlify + Render"
        echo ""
        echo "步骤 1: 部署后端到 Render"
        echo "  1. 访问 https://dashboard.render.com"
        echo "  2. 点击 'New +' → 'Web Service'"
        echo "  3. 连接你的 GitHub 仓库"
        echo "  4. 配置:"
        echo "     - Name: dongxinote-api"
        echo "     - Runtime: Node"
        echo "     - Build Command: npm install && npm run build:server"
        echo "     - Start Command: npm start"
        echo "  5. 添加环境变量 (参考 DEPLOY.md)"
        echo ""
        echo "步骤 2: 部署前端到 Netlify"
        echo "  1. 访问 https://app.netlify.com"
        echo "  2. 点击 'Add new site' → 'Import an existing project'"
        echo "  3. 选择你的 GitHub 仓库"
        echo "  4. 配置:"
        echo "     - Base directory: client"
        echo "     - Build command: npm run build"
        echo "     - Publish directory: dist"
        echo "  5. 修改 client/.env.production 中的 API 地址"
        echo ""
        ;;
        
    vercel)
        echo ""
        echo "📦 部署方案: Vercel + Railway"
        echo ""
        echo "步骤 1: 部署后端到 Railway"
        echo "  1. 访问 https://railway.app"
        echo "  2. 创建新项目，选择 GitHub 仓库"
        echo "  3. 添加 MongoDB 插件或使用外部 MongoDB"
        echo "  4. 配置环境变量"
        echo ""
        echo "步骤 2: 部署前端到 Vercel"
        echo "  1. 访问 https://vercel.com"
        echo "  2. 导入 GitHub 仓库"
        echo "  3. 配置根目录为 client"
        echo "  4. 设置环境变量 VITE_API_URL"
        echo ""
        ;;
        
    docker)
        echo ""
        echo "📦 部署方案: Docker"
        echo ""
        echo "步骤 1: 确保已安装 Docker 和 Docker Compose"
        echo ""
        echo "步骤 2: 配置环境变量"
        echo "  创建 .env 文件，添加以下内容:"
        echo "  JWT_SECRET=your-secret-key"
        echo "  DOUBAO_API_KEY=your-api-key"
        echo ""
        echo "步骤 3: 启动服务"
        echo "  docker-compose up -d"
        echo ""
        echo "步骤 4: 访问应用"
        echo "  打开浏览器访问 http://localhost"
        echo ""
        ;;
        
    *)
        echo "未知的部署平台: $PLATFORM"
        echo "支持的选项: netlify, vercel, docker"
        exit 1
        ;;
esac

echo ""
echo "📖 详细说明请参考 DEPLOY.md"
echo ""
