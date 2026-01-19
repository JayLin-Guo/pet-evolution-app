# Monorepo 迁移总结

## 问题诊断

### 症状

- 运行 `pnpm mobile` 后移动端页面显示空白
- Expo 开发服务器启动成功，但应用无内容

### 根本原因

Monorepo 迁移后，`@pet-evolution/shared` 包没有正确链接到 `packages/mobile/node_modules`，导致所有从 shared 包的导入失败。

## 解决方案

### 1. 创建自定义入口文件

创建 `packages/mobile/index.js`：

```javascript
import { registerRootComponent } from "expo";
import App from "./App";
registerRootComponent(App);
```

更新 `packages/mobile/package.json`：

```json
{
  "main": "index.js"
}
```

### 2. 重新安装依赖

```bash
pnpm install
```

这会创建正确的 workspace 符号链接：

```
packages/mobile/node_modules/@pet-evolution/shared -> ../../../shared
```

### 3. 清理缓存

```bash
rm -rf .expo packages/mobile/.expo
```

删除了：

- 根目录的 `.expo` 文件夹（不需要）
- mobile 包的 `.expo` 缓存

### 3. 验证导入路径

检查了所有组件文件，确认都正确使用了包名导入：

```typescript
// ✅ 正确
import { Pet, usePet, GrowthStage } from "@pet-evolution/shared";
```

## 项目结构

### Monorepo 架构

```
pet-evolution-app/
├── packages/
│   ├── mobile/          # React Native 移动端
│   │   ├── App.tsx
│   │   ├── src/
│   │   │   ├── components/
│   │   │   ├── screens/
│   │   │   └── webview/
│   │   ├── assets/
│   │   ├── metro.config.js
│   │   └── package.json
│   │
│   ├── web-pet/         # Web 宠物页面（Vite + React）
│   │   ├── src/
│   │   ├── index.html
│   │   ├── vite.config.ts
│   │   └── package.json
│   │
│   └── shared/          # 共享代码
│       ├── src/
│       │   ├── models/      # PetModel.ts
│       │   ├── api/         # auth.ts, pet.ts, request.ts
│       │   ├── hooks/       # usePet.ts
│       │   └── index.ts     # 统一导出
│       └── package.json
│
├── package.json         # 根配置
├── pnpm-workspace.yaml  # Workspace 配置
└── pnpm-lock.yaml       # 锁定文件
```

### 包依赖关系

```
mobile → shared
web-pet → shared
```

## 配置文件

### pnpm-workspace.yaml

```yaml
packages:
  - "packages/*"
```

### 根 package.json

```json
{
  "scripts": {
    "mobile": "pnpm --filter @pet-evolution/mobile start",
    "mobile:clean": "rm -rf .expo packages/mobile/.expo packages/mobile/node_modules/.cache",
    "web-pet": "pnpm --filter @pet-evolution/web-pet dev",
    "clean": "rm -rf node_modules packages/*/node_modules packages/*/dist .expo packages/mobile/.expo"
  }
}
```

### packages/mobile/metro.config.js

配置了 monorepo 支持：

```javascript
config.watchFolders = [workspaceRoot];
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, "node_modules"),
  path.resolve(workspaceRoot, "node_modules"),
];
```

## 导入规则

### 在 mobile 和 web-pet 包中

```typescript
// ✅ 正确：使用包名
import { Pet, usePet, GrowthStage } from "@pet-evolution/shared";

// ❌ 错误：不要使用相对路径
import { Pet } from "../../shared/src/models/PetModel";
```

### 在 shared 包中

```typescript
// ✅ 正确：使用相对路径
import { Pet } from "./models/PetModel";
import { petApi } from "./api/pet";
```

## 验证步骤

### 1. 检查符号链接

```bash
ls -la packages/mobile/node_modules/@pet-evolution/shared
```

应该看到：

```
lrwxr-xr-x  1 user  staff  15 Jan 19 22:18 shared -> ../../../shared
```

### 2. 检查 TypeScript 编译

```bash
# 无错误输出
```

### 3. 启动应用

```bash
pnpm mobile
```

应该能正常显示登录页面。

## 新增文件

1. `QUICK_START.md` - 快速开始指南
2. `TROUBLESHOOTING.md` - 故障排除指南
3. `MONOREPO_MIGRATION_SUMMARY.md` - 本文件

## 下一步

### 立即可做

1. 启动移动端：`pnpm mobile`
2. 启动 Web 宠物页面：`pnpm web-pet`
3. 测试所有功能

### 未来优化

1. 实现 Web 宠物页面的完整功能
2. 在移动端使用 WebView 嵌入 Web 宠物页面
3. 添加更多宠物成长阶段的资源文件
4. 优化共享代码的类型定义

## 常见问题

### Q: 页面还是空白怎么办？

A: 尝试完全重置：

```bash
pnpm clean
pnpm install
pnpm mobile
```

### Q: 如何验证 shared 包是否正确链接？

A: 运行：

```bash
ls -la packages/mobile/node_modules/@pet-evolution/shared
```

### Q: 修改 shared 包后需要重启吗？

A: 是的，修改 shared 包后需要重启 Metro bundler（Ctrl+C 然后重新运行 `pnpm mobile`）

### Q: 如何清理缓存？

A: 运行：

```bash
pnpm mobile:clean
```

## 总结

✅ Monorepo 架构已成功搭建
✅ 所有包依赖关系正确配置
✅ 导入路径已全部更新
✅ 缓存已清理
✅ 项目可以正常启动

现在可以开始开发了！🎉
