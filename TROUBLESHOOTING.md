# 故障排除指南

## 问题：移动端页面空白

### 原因

Monorepo 迁移后，`@pet-evolution/shared` 包没有正确链接到 `packages/mobile/node_modules`，导致导入失败。

### 解决方案

1. **重新安装依赖**（已完成）

   ```bash
   pnpm install
   ```

   这会正确创建 workspace 包之间的符号链接。

2. **清理 Expo 缓存**（已完成）

   ```bash
   rm -rf .expo packages/mobile/.expo
   ```

3. **重启开发服务器**
   ```bash
   # 停止当前运行的 Expo 服务器（Ctrl+C）
   # 然后重新启动
   pnpm mobile
   ```

### 验证修复

运行以下命令验证 shared 包已正确链接：

```bash
ls -la packages/mobile/node_modules/@pet-evolution/shared
```

应该看到一个指向 `../../../shared` 的符号链接。

## 常用命令

### 开发

- `pnpm mobile` - 启动移动端开发服务器
- `pnpm web-pet` - 启动 Web 宠物页面开发服务器

### 清理缓存

- `pnpm mobile:clean` - 清理移动端缓存
- `pnpm clean` - 清理所有包的 node_modules 和缓存

### 完全重置

如果遇到问题，可以完全重置：

```bash
pnpm clean
pnpm install
pnpm mobile
```

## Monorepo 结构

```
pet-evolution-app/
├── packages/
│   ├── mobile/          # React Native 移动端应用
│   ├── web-pet/         # Web 宠物页面（可独立部署）
│   └── shared/          # 共享代码（models, api, hooks）
├── package.json         # 根配置
└── pnpm-workspace.yaml  # pnpm workspace 配置
```

### 包依赖关系

- `mobile` 依赖 `shared`
- `web-pet` 依赖 `shared`
- `shared` 是独立的基础包

## 导入规则

在 `mobile` 和 `web-pet` 包中：

- ✅ 从 shared 导入：`import { Pet, usePet } from '@pet-evolution/shared'`
- ❌ 不要使用相对路径：`import { Pet } from '../../shared/src/models/PetModel'`

在 `shared` 包中：

- ✅ 使用相对路径：`import { Pet } from './models/PetModel'`
- ✅ 或从 index 导入：`import { Pet } from '../index'`
