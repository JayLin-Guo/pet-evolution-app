# 故障排除指南

## 404 错误排查

如果访问 `http://localhost:8011/api/auth/register` 出现 404，请按以下步骤检查：

### 1. 确认服务已启动

```bash
cd packages/server
pnpm run start:dev
```

应该看到类似输出：
```
🚀 Server is running on: http://localhost:8011
📝 API endpoints:
   POST http://localhost:8011/api/auth/register
   ...
```

### 2. 检查端口是否被占用

```bash
# Windows
netstat -ano | findstr :3000

# Mac/Linux
lsof -i :3000
```

如果端口被占用，可以：
- 修改 `.env` 文件中的 `PORT` 变量
- 或者停止占用端口的进程

### 3. 检查数据库连接

确保 `.env` 文件存在并配置正确：

```env
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=your_password
DB_DATABASE=pet_evolution
PORT=8011
```

如果数据库连接失败，服务可能无法正常启动。

### 4. 检查控制台错误

查看服务启动时的错误信息：
- 数据库连接错误
- 模块导入错误
- 依赖缺失错误

### 5. 测试根路径

先访问根路径确认服务是否运行：
```
GET http://localhost:8011/
```

应该返回 "Hello World!" 或类似响应。

**注意**：H5 页面运行在 `http://localhost:3000`，API 服务运行在 `http://localhost:8011`

### 6. 检查路由注册

确认所有模块都已正确导入到 `app.module.ts`：
- AuthModule
- PetEggsModule
- PetsModule

### 7. 使用测试文件

使用 `test-api.http` 文件测试接口（如果使用 VS Code REST Client 插件）。

## 常见错误

### 错误：Cannot find module '@nestjs/schedule'

```bash
cd packages/server
pnpm install
```

### 错误：数据库连接失败

1. 确认 MySQL 服务已启动
2. 确认数据库已创建：`CREATE DATABASE pet_evolution;`
3. 检查 `.env` 配置是否正确

### 错误：ValidationPipe 相关错误

确保 `class-validator` 和 `class-transformer` 已安装：
```bash
pnpm install class-validator class-transformer
```

## 调试步骤

1. **检查服务是否启动**
   ```bash
   curl http://localhost:8011/
   ```

2. **检查路由是否存在**
   ```bash
   curl -X POST http://localhost:8011/api/auth/register \
     -H "Content-Type: application/json" \
     -d '{"phone":"13800138000"}'
   ```

3. **查看 NestJS 日志**
   启动时会显示所有注册的路由，检查是否包含 `/api/auth/register`

4. **检查网络请求**
   使用浏览器开发者工具或 Postman 查看：
   - 请求 URL 是否正确（应该是 `http://localhost:8011/api/auth/register`）
   - 请求方法是否正确（POST）
   - Content-Type 是否为 `application/json`
   - 请求体格式是否正确

## 快速测试

使用 curl 测试注册接口：

```bash
curl -X POST http://localhost:8011/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"phone":"13800138000"}'
```

预期响应：
```json
{
  "token": "...",
  "userId": 1,
  "expiresAt": "..."
}
```

