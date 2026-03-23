# 东西笔记 - 项目规范文档

## 1. 项目概述

- **项目名称**：东西笔记
- **项目类型**：移动端 + Web 端个人知识管理应用
- **核心功能**：以「学习库存」为核心的知识采集工具，支持轻量录入、AI 智能问答、知识关联
- **目标用户**：个人用户为主，少量朋友使用

## 2. 技术栈

- **前端**：React + TypeScript + Tailwind CSS（移动端 H5 + Web）
- **后端**：Node.js + Express
- **数据库**：MongoDB（通过 Mongoose）
- **AI 能力**：豆包 API（字节生态）
- **OCR**：阿里云 OCR
- **部署**：支持多端部署

## 3. 数据模型

### 3.1 用户 (User)
```typescript
{
  _id: ObjectId,
  username: string,          // 用户名
  email: string,             // 邮箱
  password: string,          // 加密密码
  settings: {
    aiAnswerLength: 'normal' | 'long' | 'short',  // AI回答长度
    autoBackup: boolean      // 自动备份
  },
  createdAt: Date,
  updatedAt: Date
}
```

### 3.2 库存 (Inventory)
```typescript
{
  _id: ObjectId,
  userId: ObjectId,          // 所属用户
  name: string,              // 库存名称
  type: 'book' | 'course' | 'other',  // 库存类型
  remark: string,            // 备注
  isArchived: boolean,       // 是否归档
  isDefault: boolean,        // 是否为默认库存（未分类）
  noteCount: number,         // 笔记数量
  createdAt: Date,
  updatedAt: Date
}
```

### 3.3 笔记 (Note)
```typescript
{
  _id: ObjectId,
  userId: ObjectId,          // 所属用户
  inventoryId: ObjectId,     // 所属库存
  type: 'image' | 'document' | 'text',  // 笔记类型
  
  // 内容存储
  originalContent: string,   // 原文（图片base64/文档内容/文字）
  ocrContent: string,       // OCR识别文本
  remark: string,           // 用户备注
  
  // 元数据
  tags: string[],           // 标签数组
  embedding: number[],      // 语义向量
  
  // 关联
  relatedNotes: ObjectId[], // 相关笔记ID
  
  createdAt: Date,
  updatedAt: Date
}
```

### 3.4 标签 (Tag)
```typescript
{
  _id: ObjectId,
  userId: ObjectId,          // 所属用户
  name: string,             // 标签名称
  color: string,            // 标签颜色
  createdAt: Date
}
```

## 4. 页面结构

### 4.1 移动端/首页布局
```
┌─────────────────────────────────────────┐
│ 顶部导航栏                               │
│ [首页] [查看库存] [东西足迹] [我的东西]  │
├─────────────────────────────────────────┤
│                                         │
│     [ + 记点东西 ]    [ 全局检索 ]      │
│                                         │
├─────────────────────────────────────────┤
│ 最近在记：XXX（点击跳转该库存）          │
└─────────────────────────────────────────┘
```

### 4.2 核心页面
1. **记点东西（首页）** - 快速录入笔记
2. **库存管理** - 管理学习归属
3. **笔记详情页** - 查看单条笔记
4. **全局检索** - 搜笔记 + 问AI
5. **东西轨迹** - 时间轴浏览
6. **我的东西** - 个人设置

## 5. API 接口

### 5.1 库存管理
- `POST /api/inventories` - 新建库存
- `GET /api/inventories` - 获取库存列表
- `PUT /api/inventories/:id` - 编辑库存
- `DELETE /api/inventories/:id` - 删除库存
- `PUT /api/inventories/:id/archive` - 归档库存

### 5.2 笔记管理
- `POST /api/notes` - 创建笔记
- `GET /api/notes` - 获取笔记列表
- `GET /api/notes/:id` - 获取笔记详情
- `PUT /api/notes/:id` - 更新笔记
- `DELETE /api/notes/:id` - 删除笔记
- `GET /api/notes/:id/related` - 获取相关笔记

### 5.3 检索与AI
- `GET /api/search` - 全局搜索
- `POST /api/ai/chat` - AI智能问答

### 5.4 用户
- `POST /api/auth/register` - 注册
- `POST /api/auth/login` - 登录
- `GET /api/user/profile` - 获取用户信息
- `PUT /api/user/settings` - 更新设置

## 6. MVP 开发优先级

1. 库存管理（新建/编辑/删除/归档）
2. 记点东西（图片/文档/文字录入 + OCR + 标签）
3. 全局检索（基础搜笔记）
4. 东西轨迹（时间轴）
5. AI学习助手（问答）
6. 笔记详情页 + 相关笔记推荐
7. 多端同步与数据备份

## 7. MVP 阶段不做

- 自动识别书籍/课程名称
- 知识图谱可视化
- 强推荐、推送、复习提醒
- 社区、分享、评论功能
- 复杂文档深度解析
- AI多轮对话
