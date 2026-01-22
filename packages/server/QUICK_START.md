# 快速启动指南

## 1. 安装依赖

```bash
cd packages/server
pnpm install
```

## 2. 配置数据库

创建 `.env` 文件（复制 `.env.example`）：

```bash
# Windows
copy .env.example .env

# Mac/Linux
cp .env.example .env
```

然后编辑 `.env` 文件，填入你的数据库配置：

```env
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=your_password
DB_DATABASE=pet_evolution
```

## 3. 创建数据库

在 MySQL 中创建数据库：

```sql
CREATE DATABASE pet_evolution CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

## 4. 启动服务

```bash
pnpm run start:dev
```

启动成功后，你应该看到：

```
🚀 Server is running on: http://localhost:8011
📝 API endpoints:
   POST http://localhost:8011/api/auth/register
   GET  http://localhost:8011/api/auth/verify
   GET  http://localhost:8011/api/pet-eggs
   POST http://localhost:8011/api/pet-eggs/draw
   POST http://localhost:8011/api/pets/adopt
   GET  http://localhost:8011/api/pets
```

## 5. 测试接口

在浏览器中访问：
```
http://localhost:8011/
```

应该返回 "Hello World!"

或者使用 curl 测试注册接口：

```bash
curl -X POST http://localhost:8011/api/auth/register \
  -H "Content-Type: application/json" \
  -d "{\"phone\":\"13800138000\"}"
```

## 常见问题

### 问题1：数据库连接失败

**错误信息：**
```
Error: connect ECONNREFUSED 127.0.0.1:3306
```

**解决方法：**
1. 确认 MySQL 服务已启动
2. 检查 `.env` 文件中的数据库配置是否正确
3. 确认数据库已创建

### 问题2：端口被占用

**错误信息：**
```
Error: listen EADDRINUSE: address already in use :::3000
```

**解决方法：**
1. 修改 `.env` 文件中的 `PORT` 为其他端口（如 8012）
2. 或者停止占用 8011 端口的进程

### 问题3：找不到模块

**错误信息：**
```
Cannot find module '@nestjs/schedule'
```

**解决方法：**
```bash
pnpm install
```

### 问题4：TypeORM 同步失败

如果数据库表结构有问题，可以：
1. 删除数据库重新创建
2. 或者手动修复表结构

## 下一步

服务启动后，前端就可以正常调用 API 了！

确保：
- ✅ 服务运行在 `http://localhost:8011`
- ✅ 数据库连接正常
- ✅ 看到启动日志中的 API endpoints 列表

**注意**：H5 页面运行在 `http://localhost:3000`，API 服务运行在 `http://localhost:8011`

