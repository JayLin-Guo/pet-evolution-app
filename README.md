# 宠物进化 Monorepo

这是一个基于 monorepo 架构的宠物养成游戏项目，支持多平台部署。

## 项目结构

```
pet-evolution/
├── packages/
│   ├── mobile/          # React Native 移动端应用
│   ├── web-pet/         # Web 宠物页面（可嵌入小程序、H5等）
│   └── shared/          # 共享代码（models, api, hooks）
└── package.json
```

## 快速开始

### 1. 安装依赖

```bash
npm install
# 或
pnpm install
```

### 2. 运行移动端

```bash
npm run mobile
# 或
cd packages/mobile && npm start
```

### 3. 运行 Web 宠物页面

```bash
npm run web-pet
# 或
cd packages/web-pet && npm run dev
```

## 各包说明

### @pet-evolution/mobile

React Native 移动端应用，包含：

- 登录页面
- 领养页面
- 欢迎页面
- WebView 容器（嵌入 web-pet）

### @pet-evolution/web-pet

独立的 Web 宠物页面，可以：

- 在移动端通过 WebView 嵌入
- 嵌入到小程序 web-view
- 独立部署为 H5 页面
- 使用 React Bits 等 Web 动画库

### @pet-evolution/shared

共享代码包，包含：

- 数据模型（Pet, User 等）
- API 接口
- 共享 Hooks
- 工具函数

## 部署

### 构建 Web 宠物页面

```bash
cd packages/web-pet
npm run build
```

构建产物在 `packages/web-pet/dist` 目录，可以：

- 部署到 CDN
- 嵌入小程序
- 作为静态资源服务

## 技术栈

- **Mobile**: React Native + Expo
- **Web**: React + Vite + TypeScript
- **Shared**: TypeScript
- **Monorepo**: npm workspaces / pnpm workspaces
