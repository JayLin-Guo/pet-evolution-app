# 修复权限错误

## 错误信息
```
EPERM: operation not permitted, rename '...luxon_tmp_...' -> '...luxon'
```

这是 Windows 文件系统权限问题，通常是因为文件被其他进程占用。

## 解决方法

### 方法1：关闭所有相关程序（推荐）

1. **关闭所有终端窗口**
2. **关闭 IDE/编辑器**（VS Code、Cursor 等）
3. **关闭可能占用文件的程序**：
   - 文件资源管理器（如果打开了项目文件夹）
   - 防病毒软件（临时禁用）
   - 其他可能扫描文件的程序

4. **重新打开终端，以管理员身份运行**：
   - 右键点击 PowerShell/CMD
   - 选择"以管理员身份运行"

5. **重新安装**：
   ```powershell
   cd D:\FE-PROJECT\PetEvolution-akt
   pnpm install
   ```

### 方法2：删除锁定文件后重试

```powershell
# 1. 关闭所有程序
# 2. 删除临时文件
Remove-Item -Recurse -Force "D:\FE-PROJECT\PetEvolution-akt\node_modules\.pnpm\@types+luxon@3.4.2" -ErrorAction SilentlyContinue

# 3. 重新安装
cd D:\FE-PROJECT\PetEvolution-akt
pnpm install
```

### 方法3：清理后重新安装

```powershell
# 1. 关闭所有程序
# 2. 清理 node_modules
cd D:\FE-PROJECT\PetEvolution-akt
Remove-Item -Recurse -Force node_modules -ErrorAction SilentlyContinue
Remove-Item -Force pnpm-lock.yaml -ErrorAction SilentlyContinue

# 3. 重新安装
pnpm install
```

### 方法4：只安装 server 的依赖

如果只需要修复 server 的依赖：

```powershell
# 1. 关闭所有程序
# 2. 只清理 server 的 node_modules
cd D:\FE-PROJECT\PetEvolution-akt\packages\server
Remove-Item -Recurse -Force node_modules -ErrorAction SilentlyContinue

# 3. 重新安装
pnpm install
```

### 方法5：使用 npm 代替 pnpm（临时方案）

如果 pnpm 一直有问题，可以临时使用 npm：

```powershell
cd D:\FE-PROJECT\PetEvolution-akt\packages\server
npm install @nestjs/schedule
```

## 快速修复脚本

创建一个 PowerShell 脚本 `fix-deps.ps1`：

```powershell
# 停止可能占用文件的进程
Get-Process | Where-Object {$_.Path -like "*PetEvolution-akt*"} | Stop-Process -Force -ErrorAction SilentlyContinue

# 等待一下
Start-Sleep -Seconds 2

# 清理并重新安装
cd D:\FE-PROJECT\PetEvolution-akt
Remove-Item -Recurse -Force node_modules\.pnpm\@types+luxon* -ErrorAction SilentlyContinue
pnpm install
```

然后以管理员身份运行：
```powershell
.\fix-deps.ps1
```

## 预防措施

1. **在安装依赖前关闭 IDE**
2. **使用管理员权限运行终端**
3. **临时禁用防病毒软件的文件扫描**
4. **避免在安装过程中打开项目文件夹**


