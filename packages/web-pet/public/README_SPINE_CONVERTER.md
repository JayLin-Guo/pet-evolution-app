# Spine 1.9 到 3.8 格式转换工具

## 概述

这个工具用于将 Spine 1.9.17 格式的 JSON 文件转换为 Spine 3.8.75 格式。

## 主要功能

1. **正确的格式转换**
   - 添加必需的 `skeleton` 字段（包含 hash, spine, x, y, width, height, images, audio）
   - 将 `skins` 从对象格式转换为数组格式
   - 转换动画曲线格式（从数组到分散属性）
   - 优化动画数据，移除冗余的默认值

2. **智能优化**
   - 自动移除值为默认值的关键帧
   - 移除没有实际变化的时间轴
   - 生成更小、更高效的文件

3. **参考文件支持**
   - 可以使用现有的 3.8 格式文件作为参考
   - 从参考文件中获取准确的 skeleton 信息

## 使用方法

### 方法 1: 使用批处理文件（推荐）

1. 双击运行 `convert_spine.bat`
2. 脚本会自动转换 `base_mon_earth_dragon_01.json` 并生成 `mon_earth_dragon_01_converted.json`

### 方法 2: 使用命令行

```bash
# 基本用法（自动计算边界）
python convert_spine_1.9_to_3.8.py <输入文件> <输出文件>

# 使用参考文件（推荐）
python convert_spine_1.9_to_3.8.py <输入文件> <输出文件> <参考文件>
```

### 示例

```bash
# 不使用参考文件
py -3 convert_spine_1.9_to_3.8.py base_mon_earth_dragon_01.json output.json

# 使用参考文件（获取准确的 skeleton 信息）
py -3 convert_spine_1.9_to_3.8.py base_mon_earth_dragon_01.json output.json mon_earth_dragon_01.json
```

## 转换差异说明

### 1. Skeleton 字段

**1.9 格式**: 没有 skeleton 字段

```json
{
  "bones": [...],
  "slots": [...],
  "skins": {...}
}
```

**3.8 格式**: 必须有 skeleton 字段

```json
{
  "skeleton": {
    "hash": "...",
    "spine": "3.8.75",
    "x": -82.61,
    "y": -15.59,
    "width": 166,
    "height": 236.86,
    "images": "",
    "audio": ""
  },
  "bones": [...],
  "slots": [...],
  "skins": [...]
}
```

### 2. Skins 结构

**1.9 格式**: 对象

```json
"skins": {
  "default": {
    "slot": {
      "attachment": {...}
    }
  }
}
```

**3.8 格式**: 数组

```json
"skins": [
  {
    "name": "default",
    "attachments": {
      "slot": {
        "attachment": {...}
      }
    }
  }
]
```

### 3. 动画曲线

**1.9 格式**: 数组

```json
{
  "time": 0,
  "x": 0,
  "y": 0,
  "curve": [0.293, 0, 0.631, 0.37]
}
```

**3.8 格式**: 分散属性

```json
{
  "curve": 0.293,
  "c3": 0.631,
  "c4": 0.37
}
```

### 4. 默认值优化

**1.9 格式**: 包含所有默认值

```json
{
  "time": 0,
  "x": 0,
  "y": 0,
  "curve": "stepped"
}
```

**3.8 格式**: 省略默认值

```json
{
  "curve": "stepped"
}
```

## 文件大小对比

- **原始 1.9 格式**: 94KB (base_mon_earth_dragon_01.json)
- **旧脚本生成**: 133KB (mon_earth_dragon_01_v38.json) - 包含大量冗余数据
- **新脚本生成**: 46KB (mon_earth_dragon_01_final.json) - 优化后
- **手动优化的 3.8**: 39KB (mon_earth_dragon_01.json) - 最优

新脚本生成的文件比旧脚本小 65%，接近手动优化的大小。

## 注意事项

1. **备份原文件**: 转换前请备份原始文件
2. **使用参考文件**: 如果有现成的 3.8 格式文件，建议作为参考文件使用，可以获得更准确的 skeleton 信息
3. **验证结果**: 转换后请在 Spine 编辑器中验证动画是否正常
4. **Atlas 文件**: 此脚本只转换 JSON 文件，不处理 Atlas 文件

## 常见问题

### Q: 转换后的文件比原始文件大？

A: 这是正常的。3.8 格式包含更多的元数据（如 skeleton 字段）。新脚本已经尽可能优化，生成的文件比旧脚本小 65%。

### Q: 为什么需要参考文件？

A: 参考文件可以提供准确的 skeleton 边界信息（x, y, width, height）。虽然脚本可以自动计算，但使用参考文件更准确。

### Q: 转换后动画不正常？

A: 请检查：

1. 是否使用了正确的 Spine 版本（3.8.75）
2. 是否有对应的图片资源
3. 是否有 Atlas 文件

## 技术细节

脚本主要执行以下转换：

1. **添加 skeleton 字段**: 从参考文件复制或自动计算边界
2. **转换 skins**: 从对象转为数组格式
3. **转换 bones**: 调整属性顺序以匹配 3.8 格式
4. **转换 animations**:
   - 转换曲线格式
   - 移除默认值关键帧
   - 移除没有变化的时间轴
   - 将 `draworder` 改名为 `drawOrder`
5. **优化输出**: 使用 4 空格缩进，确保可读性

## 开发者信息

- **版本**: 1.0
- **创建日期**: 2026-01-27
- **Python 版本**: 3.6+
- **依赖**: 仅使用 Python 标准库

## 许可证

MIT License
