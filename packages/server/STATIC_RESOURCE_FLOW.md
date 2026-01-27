# 静态资源访问流程说明

## 整体流程

### 之前的方式（nginx 直接提供）
```
前端请求 → nginx → 静态文件目录 → 返回文件
```

### 现在的方式（后端从 zip 读取）
```
前端请求 → 后端 API → 从 zip 文件读取 → 返回文件内容
```

## 详细流程

### 1. 前端请求资源

**前端代码位置**：`packages/web-pet/src/sdk/hooks/useSpine.ts`

```typescript
// 构建资源 URL
const baseUrl = "/api/static/";  // 已改为后端 API
const path = pet.spinePath;      // 例如: "/mon_earth_dragon_01_v38/mon_earth_dragon_01"
const jsonUrl = `${baseUrl}${path}.json`;  // /api/static/mon_earth_dragon_01_v38/mon_earth_dragon_01.json
const atlasUrl = `${baseUrl}${path}.atlas`; // /api/static/mon_earth_dragon_01_v38/mon_earth_dragon_01.atlas
```

### 2. 后端接收请求

**路由**：`GET /api/static/*`

**控制器**：`packages/server/src/pets/pets-static.controller.ts`

```typescript
@Get('*')
getStaticFile(@Param('0') filePath: string, @Res() res: Response) {
  // filePath = "mon_earth_dragon_01_v38/mon_earth_dragon_01.json"
}
```

### 3. 从 zip 文件读取

**服务**：`packages/server/src/pets/pets-static.service.ts`

**流程**：
1. 检查 zip 文件是否存在：`/var/preserve/spine-role.zip`
2. 加载 zip 文件（带5分钟缓存，避免重复读取）
3. 在 zip 内查找匹配的文件：
   - 精确匹配：`mon_earth_dragon_01_v38/mon_earth_dragon_01.json`
   - 路径匹配：支持 zip 内有前缀目录的情况
   - 文件名匹配：最后兜底策略
4. 读取文件内容（Buffer）
5. 返回文件内容

### 4. 返回响应

**响应头**：
- `Content-Type`: 根据文件扩展名设置（json/atlas/png）
- `Cache-Control: public, max-age=31536000`（1年缓存）

**响应体**：文件内容（Buffer）

## 关键点说明

### ✅ 不需要解压整个 zip
- **只读取需要的文件**，不会解压整个 zip
- 使用 `adm-zip` 库的 `readFile()` 方法，直接从 zip 中读取单个文件
- 性能影响很小

### ✅ 缓存机制
- zip 文件对象缓存 5 分钟
- 避免每次请求都重新读取 zip 文件
- 如果 zip 文件更新，5 分钟后会自动重新加载

### ✅ 路径匹配
支持多种路径格式：
- zip 内路径：`mon_earth_dragon_01_v38/mon_earth_dragon_01.json`
- zip 内有前缀：`spine-role/mon_earth_dragon_01_v38/mon_earth_dragon_01.json`
- 都能正确匹配

## 配置说明

### 环境变量（可选）
```bash
STATIC_ZIP_PATH=/var/preserve/spine-role.zip
```

如果不设置，默认使用：`/var/preserve/spine-role.zip`

### 前端配置
已更新：`packages/web-pet/src/sdk/config.ts`
- test/product: `/api/static/`
- dev: `http://localhost:8011/api/static/`

## 优势

1. ✅ **节省空间**：zip 压缩比高，节省 nginx 磁盘空间
2. ✅ **集中管理**：所有资源在一个 zip 文件中
3. ✅ **按需读取**：只读取需要的文件，不解压整个 zip
4. ✅ **性能优化**：zip 对象缓存，减少重复读取

## 注意事项

1. zip 文件路径必须正确：`/var/preserve/spine-role.zip`
2. zip 文件内的路径结构要与请求路径匹配
3. 如果 zip 文件更新，需要等待缓存过期（5分钟）或重启服务

