# API 使用说明

## 配置

### API 基础URL

默认配置：
- 开发环境：`http://localhost:3000`
- 生产环境：`https://api.pet-evolution.com`

可以通过环境变量 `NODE_ENV` 控制。

### Token 管理

Token会自动保存在：
- Web环境：`localStorage`
- React Native环境：`AsyncStorage`

## 认证API

### 注册/登录

```typescript
import { authApi } from '@pet-evolution/shared';

// 手机号注册/登录
const result = await authApi.login('13800138000');
// 返回: { token: string, userId: number }
```

### 验证Token

```typescript
// 验证当前token是否有效
const userInfo = await authApi.verify();
// 返回: { userId: number, phone: string } | null
```

### 获取当前用户

```typescript
// 获取当前登录用户信息
const userInfo = await authApi.getCurrentUser();
// 返回: { userId: number, phone: string } | null
```

### 退出登录

```typescript
await authApi.logout();
```

## 宠物蛋API

### 获取所有宠物蛋列表

```typescript
import { petEggApi } from '@pet-evolution/shared';

const petEggs = await petEggApi.getAll();
// 返回: PetEggDto[]
```

### 随机抽取宠物蛋

```typescript
const result = await petEggApi.draw();
// 返回: { petEgg: PetEggDto }
```

## 宠物API

### 获取当前用户的宠物

```typescript
import { petApi } from '@pet-evolution/shared';

const pet = await petApi.getPet();
// 返回: Pet | null
```

### 领养宠物

```typescript
// 需要先抽取宠物蛋，然后领养
const drawResult = await petEggApi.draw();
const pet = await petApi.adoptPet(drawResult.petEgg.id, '我的宠物');
// 返回: Pet
```

### 获取宠物详情

```typescript
const pet = await petApi.getPetById(petId);
// 返回: Pet
```

### 喂食

```typescript
const pet = await petApi.feedPet(petId);
// 返回: Pet
// 注意：需要8小时冷却时间
```

### 玩耍

```typescript
const pet = await petApi.playWithPet(petId);
// 返回: Pet
// 注意：需要8小时冷却时间
```

### 抚摸

```typescript
const pet = await petApi.touchPet(petId);
// 返回: Pet
// 注意：需要8小时冷却时间
```

### 与宠物对话

```typescript
const result = await petApi.chatWithPet(petId, '你好');
// 返回: { reply: string, statusUpdate?: { happiness?: number, exp?: number } }
```

### 获取聊天记录

```typescript
const messages = await petApi.getChatHistory(petId, 50);
// 返回: Array<{ sender: 'user' | 'pet', message: string, created_at: string }>
```

## 数据转换说明

后端返回的宠物数据中，饥饿、快乐、健康值范围是 **0-10**，前端会自动转换为 **0-100** 范围。

## 错误处理

所有API调用都会自动处理：
- 401未授权：自动清除token
- 网络错误：抛出异常
- 业务错误：返回错误信息

## Mock模式

在开发环境中，可以通过设置 `IS_MOCK_ENV` 来启用Mock模式（当前默认关闭，使用真实API）。

## 注意事项

1. 所有需要认证的接口都会自动携带token
2. 操作类接口（喂食、玩耍、抚摸）有8小时冷却时间
3. 如果操作未到冷却时间，后端会返回提示信息
4. 宠物ID需要从 `pet.id` 获取（注意：前端Pet模型的id是string，后端是number）

