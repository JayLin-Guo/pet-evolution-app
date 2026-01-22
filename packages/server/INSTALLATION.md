# 安装说明

## 依赖安装

在实现数据库表设计后，需要安装以下依赖：

```bash
cd packages/server
pnpm add @nestjs/schedule
```

## 数据库配置

在 `.env` 文件中配置数据库连接信息：

```env
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=your_password
DB_DATABASE=pet_evolution
```

## 数据库表结构

系统会自动根据实体文件创建以下表：

1. **users** - 用户表
2. **pet_eggs** - 宠物蛋资源表
3. **pets** - 宠物表
4. **chat_messages** - 聊天记录表
5. **pet_actions** - 操作记录表

## API 接口

### 认证相关
- `POST /api/auth/register` - 手机号注册
- `GET /api/auth/verify` - 验证token

### 宠物蛋相关
- `GET /api/pet-eggs` - 获取可抽取的宠物蛋列表
- `POST /api/pet-eggs/draw` - 随机抽取宠物蛋

### 宠物相关
- `POST /api/pets/adopt` - 领养宠物
- `GET /api/pets` - 获取当前用户的宠物
- `GET /api/pets/:id` - 获取宠物详情
- `POST /api/pets/:id/feed` - 喂食
- `POST /api/pets/:id/play` - 玩耍
- `POST /api/pets/:id/touch` - 抚摸
- `POST /api/pets/:id/chat` - 与宠物对话
- `GET /api/pets/:id/chat-history` - 获取聊天记录

## 定时任务

系统包含以下定时任务：

1. **宠物状态更新** - 每10分钟执行一次，更新所有宠物的饥饿、快乐、健康、经验值
2. **聊天记录清理** - 每天凌晨2点执行，清理一周前的聊天记录

## 注意事项

1. TypeORM 的 `synchronize: true` 仅用于开发环境，生产环境应使用迁移
2. Token 过期时间设置为30天，可根据需要调整
3. 操作冷却时间为8小时，每次操作增加值为3，属性上限为10

