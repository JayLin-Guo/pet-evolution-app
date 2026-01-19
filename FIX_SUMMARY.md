# 修复总结

## 问题

运行 `pnpm mobile` 后页面空白，出现以下错误：

1. `Unable to resolve "../../App" from "...expo/AppEntry.js"`
2. `Unable to resolve "@babel/runtime/helpers/interopRequireDefault"`

## 解决方案

### 1. 创建自定义入口文件

**文件：** `packages/mobile/index.js`

```javascript
import { registerRootComponent } from "expo";
import App from "./App";
registerRootComponent(App);
```

**原因：** Expo 默认的 `AppEntry.js` 在 monorepo 结构中无法正确解析 App.tsx 的路径。

### 2. 更新 package.json

**文件：** `packages/mobile/package.json`

```json
{
  "main": "index.js"
}
```

**原因：** 指向新的入口文件。

### 3. 添加缺失依赖

```bash
pnpm --filter @pet-evolution/mobile add @babel/runtime
```

**原因：** Babel 转译需要这个运行时依赖。

### 4. 清理缓存

```bash
rm -rf packages/mobile/.expo packages/mobile/node_modules/.cache
```

**原因：** 清除旧的缓存，避免使用过期的构建产物。

## 现在启动

```bash
# 停止当前运行的服务器（如果有）
# 按 Ctrl+C

# 重新启动
pnpm mobile
```

## 验证

启动后应该能看到：

- ✅ 登录页面正常显示
- ✅ 渐变背景和动画效果
- ✅ 无错误信息

## 如果还有问题

完全重置：

```bash
pnpm clean
pnpm install
pnpm mobile
```

## 技术细节

### Monorepo 中的 Expo 配置

在 monorepo 中，Expo 需要：

1. 自定义入口文件（不能使用默认的 `node_modules/expo/AppEntry.js`）
2. 正确的 Metro 配置（已在 `metro.config.js` 中配置）
3. Babel runtime 依赖

### 文件结构

```
packages/mobile/
├── index.js          # 新增：自定义入口
├── App.tsx           # 主应用组件
├── package.json      # main: "index.js"
├── metro.config.js   # Monorepo 配置
└── babel.config.js   # Babel 配置
```

## 相关文档

- `QUICK_START.md` - 快速开始
- `TROUBLESHOOTING.md` - 故障排除
- `MONOREPO_MIGRATION_SUMMARY.md` - 完整迁移总结
