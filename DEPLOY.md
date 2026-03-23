# 东西笔记 - 云端部署指南

## 概述

东西笔记支持部署到多个云平台，获得自己的域名和在线访问能力。以下是完整的部署方案。

## 方案一：Netlify（前端）+ Render（后端）

这是推荐的部署方案，完全免费且易于维护。

### 第一步：部署后端服务到 Render

1. **注册 Render 账号**
   - 访问 https://render.com
   - 使用 GitHub 账号登录

2. **创建 MongoDB 数据库**
   - 访问 https://www.mongodb.com/cloud/atlas
   - 注册并创建免费集群
   - 获取连接字符串（MongoDB URI）

3. **部署后端服务**
   - 在 Render Dashboard 点击 "New +" → "Web Service"
   - 连接你的 GitHub 仓库
   - 配置如下：
     - **Name**: dongxinote-api
     - **Runtime**: Node
     - **Build Command**: `npm install && npm run build:server`
     - **Start Command**: `npm start`
   - 添加环境变量：
     - `NODE_ENV`: production
     - `PORT`: 10000
     - `MONGODB_URI`: 你的 MongoDB 连接字符串
     - `JWT_SECRET`: 随机生成的密钥（如：dongxinote-secret-2024）
     - `DOUBAO_API_KEY`: 你的豆包 API 密钥
     - `DOUBAO_BASE_URL`: https://ark.cn-beijing.volces.com/api/v3

4. **获取后端域名**
   - 部署完成后，Render 会提供一个域名，如：`https://dongxinote-api.onrender.com`
   - 记下这个域名，后续配置前端时需要用到

### 第二步：部署前端到 Netlify

1. **注册 Netlify 账号**
   - 访问 https://www.netlify.com
   - 使用 GitHub 账号登录

2. **修改前端 API 配置**
   - 打开 `client/.env.production` 文件
   - 将 `VITE_API_URL` 修改为你的 Render 后端域名：
     ```
     VITE_API_URL=https://dongxinote-api.onrender.com/api
     ```

3. **部署前端**
   - 在 Netlify Dashboard 点击 "Add new site" → "Import an existing project"
   - 选择你的 GitHub 仓库
   - 配置如下：
     - **Build command**: `npm run build`
     - **Publish directory**: `dist`
     - **Base directory**: `client`
   - 点击 "Deploy site"

4. **配置自定义域名（可选）**
   - 在 Site settings → Domain management 中添加自定义域名
   - 或者使用 Netlify 提供的免费子域名

### 第三步：配置 CORS

确保后端服务允许前端域名访问。修改 `src/server.ts`：

```typescript
app.use(cors({
  origin: ['https://你的netlify域名.netlify.app', 'https://你的自定义域名.com'],
  credentials: true
}));
```

## 方案二：Vercel（前端）+ Railway（后端）

### 部署后端到 Railway

1. 访问 https://railway.app 并注册
2. 创建新项目，选择 "Deploy from GitHub repo"
3. 添加 MongoDB 插件（或连接外部 MongoDB）
4. 配置环境变量
5. 部署完成后获取域名

### 部署前端到 Vercel

1. 访问 https://vercel.com 并注册
2. 导入 GitHub 仓库
3. 配置根目录为 `client`
4. 设置环境变量 `VITE_API_URL` 为 Railway 后端域名
5. 部署

## 方案三：单服务器部署（适合有服务器的用户）

如果你有自己的云服务器，可以将前后端部署在同一台服务器上。

### 使用 Docker 部署

创建 `docker-compose.yml`：

```yaml
version: '3.8'

services:
  mongodb:
    image: mongo:latest
    container_name: dongxinote-mongo
    restart: always
    volumes:
      - mongo_data:/data/db
    ports:
      - "27017:27017"

  backend:
    build:
      context: .
      dockerfile: Dockerfile.backend
    container_name: dongxinote-api
    restart: always
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - PORT=3000
      - MONGODB_URI=mongodb://mongodb:27017/dongxi_notes
      - JWT_SECRET=your-secret-key
      - DOUBAO_API_KEY=your-api-key
    depends_on:
      - mongodb

  frontend:
    build:
      context: ./client
      dockerfile: Dockerfile.frontend
    container_name: dongxinote-web
    restart: always
    ports:
      - "80:80"
    depends_on:
      - backend

volumes:
  mongo_data:
```

## 环境变量配置清单

### 后端环境变量

| 变量名 | 说明 | 示例 |
|--------|------|------|
| `NODE_ENV` | 运行环境 | production |
| `PORT` | 服务端口 | 10000 |
| `MONGODB_URI` | MongoDB 连接字符串 | mongodb+srv://... |
| `JWT_SECRET` | JWT 签名密钥 | random-secret-key |
| `DOUBAO_API_KEY` | 豆包 AI API 密钥 | ad7cf9b7-... |
| `DOUBAO_BASE_URL` | 豆包 API 地址 | https://ark.cn-beijing.volces.com/api/v3 |

### 前端环境变量

| 变量名 | 说明 | 示例 |
|--------|------|------|
| `VITE_API_URL` | 后端 API 地址 | https://api.example.com/api |

## 部署后的访问方式

部署完成后，你将获得：

1. **Web 端访问**：通过浏览器访问你的 Netlify/Vercel 域名
2. **手机端访问**：
   - 直接用手机浏览器访问 Web 端域名
   - 添加到手机主屏幕（PWA 模式）
   - 体验接近原生 App

## 常见问题

### 1. 跨域问题

如果遇到跨域错误，确保：
- 后端 CORS 配置包含前端域名
- 前端请求的 API 地址正确

### 2. 环境变量不生效

- 修改环境变量后需要重新部署
- 检查环境变量名称是否正确（Vite 需要以 `VITE_` 开头）

### 3. 数据库连接失败

- 检查 MongoDB URI 是否正确
- 确保 MongoDB 允许外部访问（Atlas 需要添加 IP 白名单）

### 4. AI 服务不可用

- 检查 `DOUBAO_API_KEY` 是否有效
- 检查模型 ID 是否正确

## 免费额度说明

- **Netlify**: 100GB 带宽/月，300 分钟构建时间/月
- **Render**: 750 小时运行时间/月，100GB 带宽/月
- **MongoDB Atlas**: 512MB 存储，共享 RAM
- **Vercel**: 100GB 带宽/月，6000 分钟构建时间/月
- **Railway**: $5 免费额度/月

对于个人使用，免费额度完全足够。

## 下一步

1. 选择一个部署方案
2. 按照步骤配置环境变量
3. 部署并测试
4. 配置自定义域名（可选）

需要我帮你完成具体的部署步骤吗？
