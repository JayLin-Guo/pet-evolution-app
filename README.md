# 虚拟宠物养成 App (React Native)

基于 React Native 开发的虚拟宠物养成应用，通过互动、喂食、聊天等方式培养宠物成长进化。

## 快速开始

### 前提条件
- Node.js 18+ 
- npm 或 yarn

### 安装步骤

1. **创建项目**（选择一个方式）

**方式一：使用 Expo（推荐，最简单）**
```bash
npx create-expo-app@latest . --template blank-typescript
```

**方式二：使用原生 React Native**
```bash
npx react-native@latest init PetApp --template react-native-template-typescript
```

2. **安装依赖**
```bash
npm install
```

3. **运行项目**

**如果用 Expo：**
```bash
npx expo start
```
然后用手机扫码即可查看

**如果用原生 RN：**
```bash
# Android
npx react-native run-android

# iOS (需要 Mac)
npx react-native run-ios
```

## 功能特性

### MVP 版本
- 单一宠物养成（小猫起始形态）
- 互动系统：聊天、喂食、玩耍
- 成长进化系统（6大阶段，每阶段3小关卡）
- 属性培养系统

### 成长阶段
1. 幼兽期（3个小阶段）
2. 成长期（3个小阶段）
3. 青年期（3个小阶段）
4. 成年期（3个小阶段）
5. 壮年期（3个小阶段）
6. 巅峰期（3个小阶段）

### 终极形态
根据成长属性和玩家选择方向，可进化为：
- 威武神龙
- 饕餮
- 天使兽
- 凤凰
- 麒麟

## 技术栈
- React Native / Expo
- TypeScript
- React Native Reanimated（动画）
- Lottie（矢量动画）
- AsyncStorage（数据持久化）

## 项目结构
```
src/
├── models/          # 数据模型
├── screens/         # 页面
├── components/      # 组件
├── services/        # 服务（AI、存储等）
├── assets/          # 资源文件
└── utils/           # 工具函数
```

## 开发计划
详见 `backup-docs/` 文件夹中的文档

## License
MIT
