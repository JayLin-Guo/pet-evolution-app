<!--
 * @Author: guolinjie linjie.guo@traxretail.com
 * @Date: 2026-01-19 22:14:10
 * @LastEditors: guolinjie linjie.guo@traxretail.com
 * @LastEditTime: 2026-01-19 22:33:17
 * @FilePath: /pet-evolution-app/COMMANDS.md
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
-->

# 🚀 Monorepo 启动命令指南（使用 pnpm）

## 📦 安装 pnpm

如果还没有安装 pnpm：

```bash
npm install -g pnpm
# 或
brew install pnpm
```

## 📦 安装依赖

```bash
pnpm install
```

pnpm 会自动处理所有 workspace 的依赖关系。

---

## 🏃 运行项目

### 1️⃣ 运行 Web 宠物页面（开发模式）

```bash
pnpm web-pet
# 或
pnpm dev
```

- 访问：http://localhost:3000
- 支持热更新

### 2️⃣ 运行移动端应用

```bash
# 启动 Expo 开发服务器
pnpm mobile

# Android 模拟器
pnpm mobile:android

# iOS 模拟器
pnpm mobile:ios

# 浏览器
pnpm mobile:web
```

---

## 🔨 构建项目

```bash
# 构建 Web 宠物页面
pnpm web-pet:build

# 预览构建结果
pnpm web-pet:preview
```

---

## 🧹 清理项目

```bash
# 清理所有
pnpm clean

# 清理移动端缓存（推荐在遇到问题时使用）
pnpm mobile:clean

# 单独清理
pnpm clean:mobile
pnpm clean:web-pet
```

---

## 🎯 快速开始

```bash
# 1. 安装 pnpm
npm install -g pnpm

# 2. 安装依赖
pnpm install

# 3. 运行 Web 宠物页面
pnpm web-pet
```
