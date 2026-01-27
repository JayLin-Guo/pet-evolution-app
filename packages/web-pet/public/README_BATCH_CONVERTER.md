# Spine 批量转换脚本使用说明

## 功能概述

这个脚本用于批量转换整个目录下的所有 Spine 文件：

- **JSON 文件**: 从 Spine 1.9 格式转换为 Spine 3.8.75 格式，生成 `*_v38.json` 文件
- **Atlas 文件**: 自动添加缺失的 `size` 信息

## 转换结果

✅ **成功转换**: 431 个 JSON 文件
✅ **处理 Atlas**: 431 个 Atlas 文件添加了 size 信息
⏭️ **跳过**: 1 个（已经是 3.8.75 格式）

## 使用方法

### 方法 1: 使用批处理文件（推荐）

双击运行 `batch_convert_all.bat`

### 方法 2: 使用命令行

```bash
py -3 batch_convert_spine_directory.py D:\petZoom\spine-role
```

## 脚本特性

### 1. 自动覆盖

- 如果 `*_v38.json` 文件已存在，会先删除旧文件，然后生成新文件
- 确保每次运行都是最新的转换结果

### 2. 智能跳过

- 自动跳过已经是 3.8.75 格式的 JSON 文件
- 自动跳过已经有 size 信息的 Atlas 文件

### 3. 无需外部依赖

- 不依赖 PIL/Pillow 库
- 使用 Python 标准库 `struct` 直接读取 PNG 文件头获取尺寸

### 4. 详细进度显示

- 显示当前处理进度（例如：[432/432]）
- 显示每个文件的处理状态
- 最后显示统计信息

## 转换内容

### JSON 文件转换

1. **添加 skeleton 字段**

   ```json
   {
     "skeleton": {
       "hash": "",
       "spine": "3.8.75",
       "x": -82.61,
       "y": -15.59,
       "width": 166,
       "height": 236.86,
       "images": "",
       "audio": ""
     }
   }
   ```

2. **转换 skins 结构**
   - 从对象格式转为数组格式

3. **优化动画数据**
   - 转换曲线格式
   - 移除默认值关键帧
   - 移除没有变化的时间轴

### Atlas 文件处理

自动添加 `size` 信息：

```
mon_earth_dragon_01.png
size: 512,256          ← 自动添加
format: RGBA8888
filter: Linear,Linear
```

## 目录结构

转换前：

```
D:\petZoom\spine-role\
├── mon_earth_dragon_01\
│   ├── mon_earth_dragon_01.json      (1.9 格式)
│   ├── mon_earth_dragon_01.atlas     (无 size)
│   └── mon_earth_dragon_01.png
```

转换后：

```
D:\petZoom\spine-role\
├── mon_earth_dragon_01\
│   ├── mon_earth_dragon_01.json      (1.9 格式，保留)
│   ├── mon_earth_dragon_01_v38.json  (3.8 格式，新生成)
│   ├── mon_earth_dragon_01.atlas     (已添加 size)
│   └── mon_earth_dragon_01.png
```

## 注意事项

1. **原始文件保留**: 脚本不会修改原始的 JSON 文件，只生成新的 `*_v38.json` 文件
2. **Atlas 文件会被修改**: Atlas 文件会直接添加 size 信息（建议先备份）
3. **自动计算边界**: skeleton 的 x, y, width, height 会根据 skins 数据自动计算
4. **批量处理**: 一次性处理所有子目录下的文件

## 文件说明

- `batch_convert_spine_directory.py` - 主转换脚本
- `batch_convert_all.bat` - Windows 批处理文件，方便快速运行
- `convert_spine_1.9_to_3.8.py` - 单文件转换脚本（用于单个文件转换）

## 技术细节

### PNG 尺寸读取

脚本使用 Python 标准库 `struct` 读取 PNG 文件头：

```python
# PNG 文件格式：
# 8 字节签名: \x89PNG\r\n\x1a\n
# 4 字节长度
# 4 字节类型: IHDR
# 4 字节宽度
# 4 字节高度
```

### 转换优化

- 移除值为默认值的关键帧（angle=0, x=0, y=0, scale=1）
- 移除没有实际变化的时间轴
- 使用紧凑的 JSON 格式（无缩进，减小文件大小）

## 常见问题

### Q: 为什么生成的文件比原文件大？

A: 3.8 格式包含更多的元数据（如 skeleton 字段），这是正常的。

### Q: 可以重复运行吗？

A: 可以。脚本会自动删除旧的 `*_v38.json` 文件，然后生成新的。

### Q: 原始文件会被修改吗？

A: JSON 文件不会被修改，但 Atlas 文件会被直接修改（添加 size 信息）。

### Q: 转换失败怎么办？

A: 检查错误信息，通常是因为：

- JSON 文件格式不正确
- PNG 文件不存在或损坏
- 文件权限问题

## 版本信息

- **版本**: 2.0
- **创建日期**: 2026-01-27
- **Python 版本**: 3.6+
- **依赖**: 仅使用 Python 标准库

## 许可证

MIT License
