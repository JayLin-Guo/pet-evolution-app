#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
批量转换 Spine 文件脚本 (最终修复版)
扫描指定目录下的所有子文件夹，将 Spine 1.9 JSON 转换为 3.8 格式
并自动修复动画第一帧丢失的问题
"""

import json
import sys
import re
import struct
import zipfile
import shutil
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
    """
    转换时间轴数据
    核心修复：确保第一帧始终存在，防止 Animation bounds are invalid
    """
    if not timeline:
        return timeline
    
    converted = []
    
    for i, keyframe in enumerate(timeline):
        is_first = (i == 0)
        cleaned = {}
        
        # 处理时间
        time_val = keyframe.get('time', 0)
        if time_val != 0:
            cleaned['time'] = time_val
        
        # 根据类型处理属性
        has_val = False
        if timeline_type == 'rotate':
            if 'angle' in keyframe and keyframe['angle'] != 0:
                cleaned['angle'] = keyframe['angle']
                has_val = True
        elif timeline_type == 'translate':
            if keyframe.get('x', 0) != 0:
                cleaned['x'] = keyframe['x']
                has_val = True
            if keyframe.get('y', 0) != 0:
                cleaned['y'] = keyframe['y']
                has_val = True
        elif timeline_type == 'scale':
            if keyframe.get('x', 1) != 1:
                cleaned['x'] = keyframe['x']
                has_val = True
            if keyframe.get('y', 1) != 1:
                cleaned['y'] = keyframe['y']
                has_val = True
        elif timeline_type in ['attachment', 'color']:
            if 'name' in keyframe:
                cleaned['name'] = keyframe['name']
                has_val = True
            if 'color' in keyframe:
                cleaned['color'] = keyframe['color']
                has_val = True
        
        # 处理曲线 (只有在不是最后一帧且有意义时添加)
        if 'curve' in keyframe:
            curve_data = convert_curve(keyframe['curve'])
            cleaned.update(curve_data)
        
        # 核心修复规则：
        # 1. 如果是第一帧（time=0），必须保留，即使它是空的 {} （代表 setup pose）
        # 2. 如果不是第一帧，只有在有内容时才保留
        if is_first:
            converted.append(cleaned)
        elif len(cleaned) > 0:
            converted.append(cleaned)
    
    return converted


def convert_bone_animation(bone_data: Dict) -> Dict:
    """转换骨骼动画数据"""
    converted = {}
    
    if 'rotate' in bone_data:
        converted_rotate = convert_timeline(bone_data['rotate'], 'rotate')
        if converted_rotate:
            converted['rotate'] = converted_rotate
    
    if 'translate' in bone_data:
        converted_translate = convert_timeline(bone_data['translate'], 'translate')
        if converted_translate:
            converted['translate'] = converted_translate
    
    if 'scale' in bone_data:
        converted_scale = convert_timeline(bone_data['scale'], 'scale')
        if converted_scale:
            converted['scale'] = converted_scale
    
    return converted


def convert_slot_animation(slot_data: Dict) -> Dict:
    """转换插槽动画数据"""
    converted = {}
    
    if 'attachment' in slot_data:
        converted_attachment = convert_timeline(slot_data['attachment'], 'attachment')
        if converted_attachment:
            converted['attachment'] = converted_attachment
    
    if 'color' in slot_data:
        converted_color = convert_timeline(slot_data['color'], 'color')
        if converted_color:
            converted['color'] = converted_color
    
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
        
        # 保留所有动画，即使是空的
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
        if 'name' in bone: new_bone['name'] = bone['name']
        if 'parent' in bone: new_bone['parent'] = bone['parent']
        if 'length' in bone: new_bone['length'] = bone['length']
        if 'rotation' in bone: new_bone['rotation'] = bone['rotation']
        if 'x' in bone: new_bone['x'] = bone['x']
        if 'y' in bone: new_bone['y'] = bone['y']
        
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
        
        is_already_38 = is_spine_3_8(old_data)
        
        # 创建新的数据结构
        new_data = {}
        
        # 1. 创建 skeleton 字段
        bounds = calculate_bounds_from_skins(old_data.get('skins', {}) if not is_already_38 else {s['name']: s['attachments'] for s in old_data.get('skins', []) if 'name' in s})
        
        skeleton = {
            'hash': old_data.get('skeleton', {}).get('hash', ''),
            'spine': '3.8.75',
            'x': bounds['x'] if bounds['width'] > 0 else old_data.get('skeleton', {}).get('x', 0),
            'y': bounds['y'] if bounds['height'] > 0 else old_data.get('skeleton', {}).get('y', 0),
            'width': bounds['width'] if bounds['width'] > 0 else old_data.get('skeleton', {}).get('width', 0),
            'height': bounds['height'] if bounds['height'] > 0 else old_data.get('skeleton', {}).get('height', 0),
            'images': old_data.get('skeleton', {}).get('images', ''),
            'audio': old_data.get('skeleton', {}).get('audio', '')
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
        
        # 3. 如果输出文件已存在，先删除（对比内容）
        if output_file.exists():
            try:
                with open(output_file, 'r', encoding='utf-8') as f:
                    existing_data = json.load(f)
                if existing_data == new_data:
                    return True
            except:
                pass
            output_file.unlink()
        
        # 4. 写入输出文件
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(new_data, f, ensure_ascii=False, indent=2)
        
        action = "转换" if not is_already_38 else "同步"
        print(f"  [{action}] {input_file.name} -> {output_file.name}")
        return True
        
    except Exception as e:
        print(f"  [错误] 转换失败 {input_file.name}: {e}")
        return False


def get_image_size(image_path: Path) -> tuple:
    """获取图片尺寸"""
    try:
        with open(image_path, 'rb') as f:
            head = f.read(24)
            if len(head) != 24: return None
            if head.startswith(b'\x89PNG\r\n\x1a\n'):
                w, h = struct.unpack('>LL', head[16:24])
                return int(w), int(h)
    except:
        pass
    return None

import struct

def process_atlas_file(atlas_file: Path) -> bool:
    """处理 Atlas 文件，添加图片尺寸"""
    try:
        with open(atlas_file, 'r', encoding='utf-8') as f:
            content = f.read()
        
        if re.search(r'^size:\s*\d+,\d+', content, re.MULTILINE):
            return False
        
        png_match = re.search(r'^(.+\.png)\s*$', content, re.MULTILINE)
        if not png_match:
            return False
        
        png_filename = png_match.group(1).strip()
        png_path = atlas_file.parent / png_filename
        
        if not png_path.exists():
            print(f"  [警告] 找不到图片文件: {png_filename}")
            return False
        
        size = get_image_size(png_path)
        if not size:
            return False
        
        width, height = size
        lines = content.split('\n')
        new_lines = []
        
        for line in lines:
            new_lines.append(line)
            if line.strip() == png_filename:
                new_lines.append(f'size: {width},{height}')
        
        new_content = '\n'.join(new_lines)
        with open(atlas_file, 'w', encoding='utf-8') as f:
            f.write(new_content)
        
        print(f"  [Atlas] 添加 size: {width}x{height}")
        return True
        
    except Exception as e:
        print(f"  [错误] Atlas失败: {e}")
        return False


def scan_and_convert(root_dir: Path):
    """扫描目录并转换所有文件"""
    print(f"正在扫描目录: {root_dir}")
    print("=" * 80)
    
    json_converted = 0
    json_skipped = 0
    json_errors = 0
    atlas_processed = 0
    
    dirs_to_process = [root_dir] + [d for d in root_dir.iterdir() if d.is_dir()]
    total_dirs = len(dirs_to_process)
    
    print(f"找到 {total_dirs} 个目录（含根目录）\n")
    
    for idx, subdir in enumerate(dirs_to_process, 1):
        try:
            rel_path = subdir.relative_to(root_dir.parent)
        except:
            rel_path = subdir.name
            
        print(f"[{idx}/{total_dirs}] 处理目录: {rel_path}")
        
        # 查找 JSON 文件
        json_files = list(subdir.glob('*.json'))
        
        for json_file in json_files:
            if json_file.stem.endswith('_v38'):
                continue
            
            output_file = json_file.parent / f"{json_file.stem}_v38.json"
            print(f"  检查: {json_file.name}")
            
            if convert_spine_json(json_file, output_file):
                json_converted += 1
            else:
                json_skipped += 1
        
        # 处理 Atlas 文件
        atlas_files = list(subdir.glob('*.atlas'))
        for atlas_file in atlas_files:
            if atlas_file.stem.endswith('_v38'):
                continue
            
            if process_atlas_file(atlas_file):
                atlas_processed += 1
        
        print()
    
    print("=" * 80)
    print("转换完成！")
    print(f"JSON 转换/同步: {json_converted} 个")
    print(f"Atlas 处理: {atlas_processed} 个")
    
    # ---------------------------------------------------------
    # 压缩处理逻辑 (恢复)
    # ---------------------------------------------------------
    print("\n" + "=" * 80)
    print("开始压缩处理...")
    
    # ---------------------------------------------------------
    # 压缩处理逻辑 (修正版: 打包整个 root_dir)
    # ---------------------------------------------------------
    print("\n" + "=" * 80)
    print("开始压缩处理...")
    
    try:
        # root_dir 是 D:\petZoom\spine-role
        # parent_dir 是 D:\petZoom
        parent_dir = root_dir.parent
        zip_name = f"{root_dir.name}.zip"
        zip_path = parent_dir / zip_name
        
        print(f"目标压缩包: {zip_path}")
        
        # 1. 删除旧的压缩包
        import time
        if zip_path.exists():
            print(f"  [清理] 准备删除旧文件: {zip_path.resolve()}")
            for i in range(3):
                try:
                    if zip_path.exists():
                        zip_path.unlink()
                        print(f"  [删除] 旧压缩包已删除")
                    break
                except Exception as e:
                    print(f"  [警告] 删除失败 (第{i+1}次): {e}")
                    time.sleep(1) # 等待1秒
            
            # 如果还是存在，说明被占用了
            if zip_path.exists():
                print("  [严重警告] 无法删除旧压缩包，尝试直接覆盖...")
        
        # 2. 创建新的压缩包 (将整个 root_dir 打包进去)
        print(f"  [打包] 正在压缩整个文件夹: {root_dir.name} ...")
        
        file_count = 0
        with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED) as zf:
            # 遍历 root_dir 下的所有文件
            for file_path in root_dir.rglob('*'):
                if file_path.is_file():
                    # 计算在 zip 中的相对路径
                    # 例如: D:\petZoom\spine-role\sub\a.json -> spine-role\sub\a.json
                    arcname = file_path.relative_to(parent_dir)
                    zf.write(file_path, arcname)
                    file_count += 1
        
        print(f"  [成功] 生成压缩包: {zip_path}")
        print(f"  包含文件数: {file_count}")
        
    except Exception as e:
        print(f"  [错误] 整体打包失败: {e}")

    print("\n" + "=" * 80)
    print("全部流程完成！")


if __name__ == '__main__':
    if len(sys.argv) < 2:
        print("请提供目标目录路径")
    else:
        scan_and_convert(Path(sys.argv[1]))
