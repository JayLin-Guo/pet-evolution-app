#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
批量转换 Spine 文件脚本
扫描指定目录下的所有子文件夹，转换 JSON 文件并处理 Atlas 文件
"""

import json
import sys
import re
import struct
from pathlib import Path
from typing import Any, Dict, List, Union


def calculate_bounds_from_skins(skins_data: Dict) -> Dict[str, float]:
    """从 skins 数据计算边界框"""
    min_x = float('inf')
    min_y = float('inf')
    max_x = float('-inf')
    max_y = float('-inf')
    
    found_any = False
    
    # 遍历所有皮肤和附件
    for skin_name, skin_data in skins_data.items():
        if not isinstance(skin_data, dict):
            continue
            
        for slot_name, slot_data in skin_data.items():
            if not isinstance(slot_data, dict):
                continue
                
            for attachment_name, attachment in slot_data.items():
                if not isinstance(attachment, dict):
                    continue
                    
                width = attachment.get('width', 0)
                height = attachment.get('height', 0)
                x = attachment.get('x', 0)
                y = attachment.get('y', 0)
                
                if width > 0 and height > 0:
                    found_any = True
                    # 计算附件的边界
                    left = x - width / 2
                    right = x + width / 2
                    bottom = y - height / 2
                    top = y + height / 2
                    
                    min_x = min(min_x, left)
                    max_x = max(max_x, right)
                    min_y = min(min_y, bottom)
                    max_y = max(max_y, top)
    
    if not found_any:
        return {'x': 0, 'y': 0, 'width': 0, 'height': 0}
    
    return {
        'x': min_x,
        'y': min_y,
        'width': max_x - min_x,
        'height': max_y - min_y
    }


def convert_curve(curve_value: Any) -> Dict[str, Any]:
    """转换曲线格式"""
    result = {}
    
    if curve_value == "stepped":
        result["curve"] = "stepped"
    elif isinstance(curve_value, list) and len(curve_value) == 4:
        result["curve"] = curve_value[0]
        if curve_value[1] != 0:
            result["c2"] = curve_value[1]
        if curve_value[2] != 1:
            result["c3"] = curve_value[2]
        if curve_value[3] != 1:
            result["c4"] = curve_value[3]
    
    return result


def convert_timeline(timeline: List[Dict], timeline_type: str) -> List[Dict]:
    """转换时间轴数据"""
    if not timeline:
        return timeline
    
    converted = []
    
    for i, keyframe in enumerate(timeline):
        is_first = (i == 0)
        cleaned = {}
        
        # 时间
        if 'time' in keyframe:
            time_val = keyframe['time']
            if time_val != 0 or not is_first:
                cleaned['time'] = time_val
        
        # 根据类型处理值
        if timeline_type == 'rotate':
            if 'angle' in keyframe and keyframe['angle'] != 0:
                cleaned['angle'] = keyframe['angle']
        
        elif timeline_type == 'translate':
            if 'x' in keyframe and keyframe['x'] != 0:
                cleaned['x'] = keyframe['x']
            if 'y' in keyframe and keyframe['y'] != 0:
                cleaned['y'] = keyframe['y']
        
        elif timeline_type == 'scale':
            if 'x' in keyframe:
                if keyframe['x'] != 1:
                    cleaned['x'] = keyframe['x']
            if 'y' in keyframe:
                if keyframe['y'] != 1:
                    cleaned['y'] = keyframe['y']
        
        elif timeline_type in ['attachment', 'color']:
            for key in ['name', 'color']:
                if key in keyframe:
                    cleaned[key] = keyframe[key]
        
        # 处理曲线
        if 'curve' in keyframe:
            curve_data = convert_curve(keyframe['curve'])
            cleaned.update(curve_data)
        
        if len(cleaned) > 0:
            converted.append(cleaned)
    
    return converted


def has_meaningful_changes(timeline: List[Dict], timeline_type: str) -> bool:
    """检查时间轴是否有有意义的变化"""
    if not timeline:
        return False
    
    for frame in timeline:
        if timeline_type == 'rotate':
            if frame.get('angle', 0) != 0:
                return True
        elif timeline_type == 'translate':
            if frame.get('x', 0) != 0 or frame.get('y', 0) != 0:
                return True
        elif timeline_type == 'scale':
            if frame.get('x', 1) != 1 or frame.get('y', 1) != 1:
                return True
    
    return False


def convert_bone_animation(bone_data: Dict) -> Dict:
    """转换骨骼动画数据"""
    converted = {}
    
    if 'rotate' in bone_data:
        if has_meaningful_changes(bone_data['rotate'], 'rotate'):
            converted_rotate = convert_timeline(bone_data['rotate'], 'rotate')
            if converted_rotate:
                converted['rotate'] = converted_rotate
    
    if 'translate' in bone_data:
        if has_meaningful_changes(bone_data['translate'], 'translate'):
            converted_translate = convert_timeline(bone_data['translate'], 'translate')
            if converted_translate:
                converted['translate'] = converted_translate
    
    if 'scale' in bone_data:
        if has_meaningful_changes(bone_data['scale'], 'scale'):
            converted_scale = convert_timeline(bone_data['scale'], 'scale')
            if converted_scale:
                converted['scale'] = converted_scale
    
    return converted


def convert_slot_animation(slot_data: Dict) -> Dict:
    """转换插槽动画数据"""
    converted = {}
    
    if 'attachment' in slot_data:
        attachments = slot_data['attachment']
        if len(attachments) > 1:
            names = [a.get('name') for a in attachments]
            if len(set(names)) > 1:
                converted['attachment'] = attachments
    
    if 'color' in slot_data:
        colors = slot_data['color']
        if any(c.get('color') != 'ffffffff' for c in colors):
            converted['color'] = colors
    
    return converted


def convert_animations(animations: Dict) -> Dict:
    """转换所有动画"""
    converted_animations = {}
    
    for anim_name, anim_data in animations.items():
        converted_anim = {}
        
        if 'bones' in anim_data:
            converted_bones = {}
            for bone_name, bone_anim in anim_data['bones'].items():
                converted_bone = convert_bone_animation(bone_anim)
                if converted_bone:
                    converted_bones[bone_name] = converted_bone
            
            if converted_bones:
                converted_anim['bones'] = converted_bones
        
        if 'slots' in anim_data:
            converted_slots = {}
            for slot_name, slot_anim in anim_data['slots'].items():
                converted_slot = convert_slot_animation(slot_anim)
                if converted_slot:
                    converted_slots[slot_name] = converted_slot
            
            if converted_slots:
                converted_anim['slots'] = converted_slots
        
        if 'draworder' in anim_data:
            if len(anim_data['draworder']) > 1 or (
                len(anim_data['draworder']) == 1 and 
                anim_data['draworder'][0].get('time', 0) != 0
            ):
                converted_anim['drawOrder'] = anim_data['draworder']
        
        converted_animations[anim_name] = converted_anim
    
    return converted_animations


def convert_skins(skins: Union[Dict, List]) -> List[Dict]:
    """转换皮肤格式"""
    if isinstance(skins, list):
        return skins
    
    converted_skins = []
    for skin_name, skin_data in skins.items():
        converted_skins.append({
            "name": skin_name,
            "attachments": skin_data
        })
    
    return converted_skins


def convert_bones(bones: List[Dict]) -> List[Dict]:
    """转换骨骼数据"""
    converted = []
    
    for bone in bones:
        new_bone = {}
        
        if 'name' in bone:
            new_bone['name'] = bone['name']
        if 'parent' in bone:
            new_bone['parent'] = bone['parent']
        if 'length' in bone:
            new_bone['length'] = bone['length']
        if 'rotation' in bone:
            new_bone['rotation'] = bone['rotation']
        if 'x' in bone:
            new_bone['x'] = bone['x']
        if 'y' in bone:
            new_bone['y'] = bone['y']
        
        for key in bone:
            if key not in new_bone:
                new_bone[key] = bone[key]
        
        converted.append(new_bone)
    
    return converted


def is_spine_3_8(data: Dict) -> bool:
    """检查是否已经是 Spine 3.8 格式"""
    skeleton = data.get('skeleton', {})
    if not skeleton:
        return False
    return skeleton.get('spine') == '3.8.75'


def convert_spine_json(input_file: Path, output_file: Path) -> bool:
    """转换单个 Spine JSON 文件"""
    try:
        with open(input_file, 'r', encoding='utf-8') as f:
            old_data = json.load(f)
        
        # 检查是否已经是 3.8 格式
        if is_spine_3_8(old_data):
            print(f"  [跳过] {input_file.name} 已经是 3.8.75 格式")
            return False
        
        # 创建新的数据结构
        new_data = {}
        
        # 1. 创建 skeleton 字段（自动计算边界）
        bounds = calculate_bounds_from_skins(old_data.get('skins', {}))
        skeleton = {
            'hash': '',
            'spine': '3.8.75',
            'x': bounds['x'],
            'y': bounds['y'],
            'width': bounds['width'],
            'height': bounds['height'],
            'images': '',
            'audio': ''
        }
        
        new_data['skeleton'] = skeleton
        
        # 2. 转换其他字段
        if 'bones' in old_data:
            new_data['bones'] = convert_bones(old_data['bones'])
        
        if 'slots' in old_data:
            new_data['slots'] = old_data['slots']
        
        if 'skins' in old_data:
            new_data['skins'] = convert_skins(old_data['skins'])
        
        if 'animations' in old_data:
            new_data['animations'] = convert_animations(old_data['animations'])
        
        # 3. 如果输出文件已存在，先删除
        if output_file.exists():
            output_file.unlink()
            print(f"  [删除] 旧文件: {output_file.name}")
        
        # 4. 写入输出文件
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(new_data, f, ensure_ascii=False, separators=(',', ':'))
        
        return True
        
    except Exception as e:
        print(f"  [错误] 转换失败: {e}")
        return False


def get_image_size(image_path: Path) -> tuple:
    """获取PNG图片尺寸（不依赖PIL）"""
    try:
        with open(image_path, 'rb') as f:
            # 检查PNG文件签名
            header = f.read(8)
            if header != b'\x89PNG\r\n\x1a\n':
                return None
            
            # 读取IHDR块
            # PNG格式：8字节签名 + 4字节长度 + 4字节类型(IHDR) + 数据
            f.read(4)  # 跳过长度
            chunk_type = f.read(4)
            
            if chunk_type != b'IHDR':
                return None
            
            # IHDR数据：宽度(4字节) + 高度(4字节) + ...
            width = struct.unpack('>I', f.read(4))[0]
            height = struct.unpack('>I', f.read(4))[0]
            
            return (width, height)
    except Exception:
        return None


def process_atlas_file(atlas_file: Path) -> bool:
    """处理 Atlas 文件，添加缺失的 size 信息"""
    try:
        with open(atlas_file, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # 检查是否已经有 size 信息
        if re.search(r'^size:\s*\d+,\d+', content, re.MULTILINE):
            return False  # 已经有 size 信息
        
        # 查找 PNG 文件引用
        png_match = re.search(r'^(.+\.png)\s*$', content, re.MULTILINE)
        if not png_match:
            return False
        
        png_filename = png_match.group(1).strip()
        png_path = atlas_file.parent / png_filename
        
        if not png_path.exists():
            print(f"  [警告] 找不到图片文件: {png_filename}")
            return False
        
        # 获取图片尺寸
        size = get_image_size(png_path)
        if not size:
            print(f"  [警告] 无法读取图片尺寸: {png_filename}")
            return False
        
        width, height = size
        
        # 在 PNG 文件名后添加 size 信息
        lines = content.split('\n')
        new_lines = []
        
        for i, line in enumerate(lines):
            new_lines.append(line)
            # 如果这行是 PNG 文件名，下一行添加 size
            if line.strip() == png_filename:
                new_lines.append(f'size: {width},{height}')
        
        new_content = '\n'.join(new_lines)
        
        # 写入文件
        with open(atlas_file, 'w', encoding='utf-8') as f:
            f.write(new_content)
        
        print(f"  [成功] 添加 size 信息: {width}x{height}")
        return True
        
    except Exception as e:
        print(f"  [错误] 处理 Atlas 文件失败: {e}")
        return False


def scan_and_convert(root_dir: Path):
    """扫描目录并转换所有文件"""
    print(f"正在扫描目录: {root_dir}")
    print("=" * 80)
    
    json_converted = 0
    json_skipped = 0
    json_errors = 0
    atlas_processed = 0
    
    # 遍历所有子目录
    subdirs = [d for d in root_dir.iterdir() if d.is_dir()]
    total_dirs = len(subdirs)
    
    print(f"找到 {total_dirs} 个子目录\n")
    
    for idx, subdir in enumerate(subdirs, 1):
        print(f"[{idx}/{total_dirs}] 处理目录: {subdir.name}")
        
        # 查找 JSON 文件
        json_files = list(subdir.glob('*.json'))
        
        for json_file in json_files:
            # 跳过已经是 _v38 的文件
            if '_v38' in json_file.stem:
                continue
            
            # 生成输出文件名
            output_file = json_file.parent / f"{json_file.stem}_v38.json"
            
            print(f"  转换: {json_file.name} -> {output_file.name}")
            
            if convert_spine_json(json_file, output_file):
                json_converted += 1
            else:
                json_skipped += 1
        
        # 处理 Atlas 文件
        atlas_files = list(subdir.glob('*.atlas'))
        for atlas_file in atlas_files:
            # 跳过 _v38 的 atlas 文件
            if '_v38' in atlas_file.stem:
                continue
            
            print(f"  检查 Atlas: {atlas_file.name}")
            if process_atlas_file(atlas_file):
                atlas_processed += 1
        
        print()
    
    # 输出统计
    print("=" * 80)
    print("转换完成！")
    print(f"\nJSON 文件:")
    print(f"  转换: {json_converted} 个")
    print(f"  跳过: {json_skipped} 个")
    if json_errors > 0:
        print(f"  错误: {json_errors} 个")
    
    print(f"\nAtlas 文件:")
    print(f"  处理: {atlas_processed} 个")


def main():
    """主函数"""
    if len(sys.argv) < 2:
        print("用法: python batch_convert_spine_directory.py <目录路径>")
        print("\n示例:")
        print("  python batch_convert_spine_directory.py D:\\petZoom\\spine-role")
        return
    
    root_dir = Path(sys.argv[1])
    
    if not root_dir.exists():
        print(f"错误: 目录不存在: {root_dir}")
        return
    
    if not root_dir.is_dir():
        print(f"错误: 不是目录: {root_dir}")
        return
    
    try:
        scan_and_convert(root_dir)
    except KeyboardInterrupt:
        print("\n\n用户中断")
    except Exception as e:
        print(f"\n错误: {e}")
        import traceback
        traceback.print_exc()


if __name__ == '__main__':
    main()
