# 快速开始指南

## 问题已修复 ✅

移动端页面空白的问题已经解决！主要修复内容：

1. ✅ 创建了自定义入口文件 `index.js` 解决 Expo 在 monorepo 中的路径问题
2. ✅ 添加了缺失的 `@babel/runtime` 依赖
3. ✅ 重新安装依赖，正确链接 `@pet-evolution/shared` 包
4. ✅ 清理 Expo 缓存
5. ✅ 验证所有导入路径正确

## 立即启动

### 方法 1：直接启动（推荐）

```bash
pnpm mobile
```

### 方法 2：完全重置后启动（如果还有问题）

```bash
# 1. 清理所有缓存
pnpm clean

# 2. 重新安装依赖
pnpm install

# 3. 启动移动端
pnpm mobile
```

## 验证修复

运行以下命令确认 shared 包已正确链接：

```bash
ls -la packages/mobile/node_modules/@pet-evolution/shared
```

应该看到：

```
lrwxr-xr-x  1 user  staff  15 Jan 19 22:18 shared -> ../../../shared
```

## 项目结构

```
pet-evolution-app/
├── packages/
│   ├── mobile/          # React Native 移动端
│   │   ├── App.tsx
│   │   ├── src/
│   │   │   ├── components/
│   │   │   ├── screens/
│   │   │   └── ...
│   │   └── package.json
│   │
│   ├── web-pet/         # Web 宠物页面
│   │   ├── src/
│   │   └── package.json
│   │
│   └── shared/          # 共享代码
│       ├── src/
│       │   ├── models/
│       │   ├── api/
│       │   ├── hooks/
│       │   └── index.ts
│       └── package.json
│
├── package.json         # 根配置
└── pnpm-workspace.yaml  # Workspace 配置
```

## 常用命令

### 开发

```bash
pnpm mobile              # 启动移动端（Expo）
pnpm mobile:android      # 在 Android 上运行
pnpm mobile:ios          # 在 iOS 上运行
pnpm mobile:web          # 在浏览器中运行

pnpm web-pet             # 启动 Web 宠物页面
pnpm web-pet:build       # 构建 Web 宠物页面
```

### 清理

```bash
pnpm mobile:clean        # 清理移动端缓存
pnpm clean               # 清理所有包
```

## 导入规则

### 在 mobile 和 web-pet 包中

```typescript
// ✅ 正确：使用包名导入
import { Pet, usePet, GrowthStage } from "@pet-evolution/shared";

// ❌ 错误：不要使用相对路径
import { Pet } from "../../shared/src/models/PetModel";
```

### 在 shared 包中

```typescript
// ✅ 正确：使用相对路径
import { Pet } from "./models/PetModel";
import { petApi } from "./api/pet";

// ✅ 或从 index 导入
import { Pet, petApi } from "../index";
```

## 下一步

现在你可以：

1. 启动移动端：`pnpm mobile`
2. 在浏览器中打开显示的 URL
3. 或扫描二维码在手机上运行

如果遇到问题，请查看 `TROUBLESHOOTING.md` 文件。
