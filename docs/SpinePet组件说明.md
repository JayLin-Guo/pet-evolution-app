# SpinePet 组件说明

## 📋 概述

`SpinePet.tsx` 是宠物进化应用的核心渲染组件，负责加载和显示 Spine 骨骼动画。

## 🎯 功能特性

### 1. 动态资源加载
- 根据宠物的成长阶段（`pet.stage`）自动选择对应的资源文件夹
- 支持不同阶段使用不同的 Spine 动画资源

### 2. 动画控制
- 支持动态切换动画（通过 `animation` prop）
- **自动检测动画是否存在**，如果不存在会回退到 `idle2`

**所有可用动画：**
- `idle1` - 活泼待机动画
- `idle2` - 默认待机动画
- `start` - 开始/出场动画
- `attack1a` - 攻击动作A（饥饿/不安）
- `attack1b` - 攻击动作B
- `attack1c` - 攻击动作C（开心/华丽）
- `attack1d` - 攻击动作D
- `attack1e` - 攻击动作E
- `attack2a` - 攻击动作2A
- `attack2b` - 攻击动作2B
- `catch` - 捕捉动作
- `hitback` - 受击动作
- `die` - 濒死动作

**当前动画逻辑（PetDisplay.tsx）：**
- `health < 20` → `die` (濒死)
- `hunger < 30` → `attack1a` (饥饿/攻击性)
- `happiness > 80` → `attack1c` (开心/华丽)
- `happiness > 60` → `idle1` (活泼)
- 默认 → `idle2` (待机)

### 3. 错误处理
- 显示加载错误信息
- 自动清理资源，防止内存泄漏

## 📁 当前资源配置

```typescript
成长阶段映射：
- BABY/CHILD    → mon_earth_dragon_01_v38
- TEEN/ADULT    → mon_earth_dragon_01_v38 (暂时复用)
- PRIME/PEAK    → mon_earth_dragon_01_v38 (暂时复用)
```

## 🔧 使用方法

```tsx
import { SpinePet } from './components/SpinePet';

<SpinePet 
  pet={pet} 
  animation="idle2" 
/>
```

## 📦 资源文件结构

```
assets/
└── mon_earth_dragon_01_v38/
    ├── mon_earth_dragon_01.json   # Spine 骨骼数据
    ├── mon_earth_dragon_01.atlas  # 纹理图集配置
    ├── mon_earth_dragon_01.png    # 纹理图片
    └── ...其他部件图片
```

## 🚀 未来扩展计划

### 1. 添加更多成长阶段资源

当你准备好其他阶段的 Spine 资源后，修改 `assetConfig`：

```typescript
case GrowthStage.TEEN:
case GrowthStage.ADULT:
  return {
    folder: 'mon_earth_dragon_02',  // 新的资源文件夹
    baseName: 'mon_earth_dragon_02' // 新的文件名
  };
```

### 2. 移动端支持

目前只支持 Web 平台，移动端需要：
- 使用 `react-native-spine` 或类似库
- 或者使用 Lottie 作为替代方案

### 3. 动画扩展

可以添加更多动画状态：
- `walk` - 行走
- `run` - 奔跑
- `sleep` - 睡觉
- `eat` - 进食
- `play` - 玩耍

## ⚠️ 注意事项

1. **资源路径**：确保资源文件放在 `public/assets/` 或 `assets/` 目录下
2. **文件命名**：`folder` 和 `baseName` 必须匹配实际文件名
3. **性能**：Spine Player 会占用一定内存，组件卸载时会自动清理
4. **浏览器兼容性**：需要支持 WebGL 的现代浏览器

## 🐛 常见问题

### Q: 显示"加载失败"错误
A: 检查：
- 资源文件路径是否正确
- 文件名是否匹配
- 浏览器控制台是否有 404 错误

### Q: 动画不切换或报错 "Animation bounds are invalid"
A: 这说明动画名称不存在，解决方法：
1. 打开浏览器控制台查看 "✅ Spine 加载成功！可用动画:" 日志
2. 使用实际存在的动画名称
3. 组件会自动回退到 `idle2` 动画

### Q: 如何知道有哪些动画可用？
A: 
1. 打开浏览器控制台（F12）
2. 刷新页面，查看 "✅ Spine 加载成功！可用动画:" 的日志
3. 或者使用 Spine 编辑器打开 `.json` 文件查看

### Q: 移动端显示"开发中..."
A: 这是正常的，目前只支持 Web 平台

## 📝 相关文件

- `src/components/PetDisplay.tsx` - 使用 SpinePet 的父组件
- `src/models/PetModel.ts` - 宠物数据模型和成长阶段定义
- `assets/mon_earth_dragon_01_v38/` - 当前使用的 Spine 资源
