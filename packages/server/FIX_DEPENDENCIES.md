# 修复依赖安装问题

## 问题
TypeScript 编译错误：找不到 `@nestjs/schedule` 模块

## 解决方法

### 方法1：在 server 目录下安装（推荐）

```bash
cd packages/server
pnpm install
```

### 方法2：在根目录安装所有依赖

```bash
# 在项目根目录
pnpm install
```

### 方法3：如果遇到权限问题

1. **关闭所有可能占用文件的程序**（IDE、终端等）
2. **以管理员身份运行终端**
3. **重新安装依赖**：
   ```bash
   cd packages/server
   pnpm install
   ```

### 方法4：清理后重新安装

```bash
# 在项目根目录
pnpm clean
pnpm install
```

## 验证安装

安装完成后，检查 `node_modules` 中是否有 `@nestjs/schedule`：

```bash
# Windows PowerShell
Test-Path packages/server/node_modules/@nestjs/schedule

# 或者直接查看
ls packages/server/node_modules/@nestjs/schedule
```

## 如果仍然报错

1. **删除 node_modules 和 lock 文件**：
   ```bash
   cd packages/server
   rm -rf node_modules
   rm pnpm-lock.yaml
   pnpm install
   ```

2. **检查 package.json**：
   确保 `@nestjs/schedule` 在 dependencies 中：
   ```json
   {
     "dependencies": {
       "@nestjs/schedule": "^4.1.0"
     }
   }
   ```

3. **重启 IDE/编辑器**：
   有时需要重启才能识别新安装的模块


