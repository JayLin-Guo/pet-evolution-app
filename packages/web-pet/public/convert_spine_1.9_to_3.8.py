#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Spine 1.9 到 3.8 格式转换脚本
将 base_mon_earth_dragon_01.json (Spine 1.9) 转换为 mon_earth_dragon_01.json (Spine 3.8)
"""

import json
import sys
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
    """
    转换曲线格式
    1.9: "curve": [c1, c2, c3, c4] 或 "stepped"
    3.8: "curve": c1, "c2": c2, "c3": c3, "c4": c4 或 "curve": "stepped"
    """
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


def is_default_value(key: str, value: Any) -> bool:
    """判断是否为默认值，可以省略"""
    defaults = {
        'x': 0,
        'y': 0,
        'angle': 0,
        'time': 0,  # 第一帧的 time: 0 通常保留
    }
    
    # 对于 scale，默认值是 1
    if key in ['scaleX', 'scaleY']:
        return value == 1
    
    return key in defaults and value == defaults[key]


def clean_keyframe(keyframe: Dict, is_first: bool = False) -> Dict:
    """
    清理关键帧，移除默认值
    3.8 格式会省略很多默认值以减小文件大小
    """
    cleaned = {}
    
    # 时间总是保留
    if 'time' in keyframe:
        cleaned['time'] = keyframe['time']
    
    # 处理其他属性
    for key, value in keyframe.items():
        if key == 'time':
            continue
            
        # 对于第一帧，如果所有值都是默认值，可以省略
        if is_first and key in ['x', 'y', 'angle']:
            if value == 0:
                continue
        
        # 对于 scale，默认值是 1
        if key in ['x', 'y'] and 'scale' in str(keyframe):
            if value == 1:
                continue
        
        # 添加非默认值
        if key not in ['curve']:
            cleaned[key] = value
    
    # 处理曲线
    if 'curve' in keyframe:
        curve_data = convert_curve(keyframe['curve'])
        cleaned.update(curve_data)
    
    return cleaned


def convert_timeline(timeline: List[Dict], timeline_type: str) -> List[Dict]:
    """
    转换时间轴数据
    timeline_type: 'rotate', 'translate', 'scale', 'attachment', 'color'
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
        
        # 核心修复：如果是第一帧且没有值，必须保留一个 {}
        if is_first:
            converted.append(cleaned)
        elif len(cleaned) > 0:
            converted.append(cleaned)
    
    return converted


def has_meaningful_changes(timeline: List[Dict], timeline_type: str) -> bool:
    """检查时间轴是否有有意义的变化"""
    if not timeline:
        return False
    
    # 检查是否所有帧都是默认值
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
        # 只有在有实际变化时才添加
        if has_meaningful_changes(bone_data['rotate'], 'rotate'):
            converted_rotate = convert_timeline(bone_data['rotate'], 'rotate')
            if converted_rotate:
                converted['rotate'] = converted_rotate
    
    if 'translate' in bone_data:
        # 只有在有实际变化时才添加
        if has_meaningful_changes(bone_data['translate'], 'translate'):
            converted_translate = convert_timeline(bone_data['translate'], 'translate')
            if converted_translate:
                converted['translate'] = converted_translate
    
    if 'scale' in bone_data:
        # 只有在有实际变化时才添加
        if has_meaningful_changes(bone_data['scale'], 'scale'):
            converted_scale = convert_timeline(bone_data['scale'], 'scale')
            if converted_scale:
                converted['scale'] = converted_scale
    
    return converted


def convert_slot_animation(slot_data: Dict) -> Dict:
    """转换插槽动画数据"""
    converted = {}
    
    if 'attachment' in slot_data:
        # attachment 时间轴在 3.8 中通常被省略，除非有实际变化
        attachments = slot_data['attachment']
        # 检查是否所有帧都是相同的附件
        if len(attachments) > 1:
            names = [a.get('name') for a in attachments]
            if len(set(names)) > 1:  # 有不同的附件
                converted['attachment'] = attachments
    
    if 'color' in slot_data:
        # color 时间轴也类似处理
        colors = slot_data['color']
        # 检查是否所有颜色都是默认的白色
        if any(c.get('color') != 'ffffffff' for c in colors):
            converted['color'] = colors
    
    return converted


def convert_animations(animations: Dict) -> Dict:
    """转换所有动画"""
    converted_animations = {}
    
    for anim_name, anim_data in animations.items():
        converted_anim = {}
        
        # 转换骨骼动画
        if 'bones' in anim_data:
            converted_bones = {}
            for bone_name, bone_anim in anim_data['bones'].items():
                converted_bone = convert_bone_animation(bone_anim)
                if converted_bone:  # 只添加非空的骨骼动画
                    converted_bones[bone_name] = converted_bone
            
            if converted_bones:
                converted_anim['bones'] = converted_bones
        
        # 转换插槽动画
        if 'slots' in anim_data:
            converted_slots = {}
            for slot_name, slot_anim in anim_data['slots'].items():
                converted_slot = convert_slot_animation(slot_anim)
                if converted_slot:  # 只添加非空的插槽动画
                    converted_slots[slot_name] = converted_slot
            
            if converted_slots:
                converted_anim['slots'] = converted_slots
        
        # draworder 改名为 drawOrder
        if 'draworder' in anim_data:
            # 只有在有实际变化时才添加
            if len(anim_data['draworder']) > 1 or (
                len(anim_data['draworder']) == 1 and 
                anim_data['draworder'][0].get('time', 0) != 0
            ):
                converted_anim['drawOrder'] = anim_data['draworder']
        
        converted_animations[anim_name] = converted_anim
    
    return converted_animations


def convert_skins(skins: Dict) -> List[Dict]:
    """
    转换皮肤格式
    1.9: {"default": {"slot": {"attachment": {...}}}}
    3.8: [{"name": "default", "attachments": {"slot": {"attachment": {...}}}}]
    """
    converted_skins = []
    
    for skin_name, skin_data in skins.items():
        converted_skins.append({
            "name": skin_name,
            "attachments": skin_data
        })
    
    return converted_skins


def convert_bones(bones: List[Dict]) -> List[Dict]:
    """
    转换骨骼数据，调整属性顺序以匹配 3.8 格式
    """
    converted = []
    
    for bone in bones:
        new_bone = {}
        
        # 按照 3.8 的顺序添加属性
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
        
        # 添加其他可能的属性
        for key in bone:
            if key not in new_bone:
                new_bone[key] = bone[key]
        
        converted.append(new_bone)
    
    return converted


def convert_spine_1_9_to_3_8(input_file: Path, output_file: Path, reference_file: Path = None):
    """
    主转换函数
    
    Args:
        input_file: 输入的 Spine 1.9 JSON 文件
        output_file: 输出的 Spine 3.8 JSON 文件
        reference_file: 可选的参考文件，用于获取准确的 skeleton 信息
    """
    print(f"正在读取输入文件: {input_file}")
    
    with open(input_file, 'r', encoding='utf-8') as f:
        old_data = json.load(f)
    
    # 创建新的数据结构
    new_data = {}
    
    # 1. 创建 skeleton 字段
    skeleton = {}
    
    # 如果有参考文件，使用参考文件的 skeleton
    if reference_file and reference_file.exists():
        print(f"使用参考文件: {reference_file}")
        with open(reference_file, 'r', encoding='utf-8') as f:
            ref_data = json.load(f)
            if 'skeleton' in ref_data:
                skeleton = ref_data['skeleton'].copy()
    else:
        # 否则计算边界
        print("计算边界框...")
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
    
    # 2. 转换 bones（调整属性顺序）
    print("转换骨骼数据...")
    if 'bones' in old_data:
        new_data['bones'] = convert_bones(old_data['bones'])
    
    # 3. 转换 slots（保持不变）
    if 'slots' in old_data:
        new_data['slots'] = old_data['slots']
    
    # 4. 转换 skins
    print("转换皮肤数据...")
    if 'skins' in old_data:
        new_data['skins'] = convert_skins(old_data['skins'])
    
    # 5. 转换 animations
    print("转换动画数据...")
    if 'animations' in old_data:
        new_data['animations'] = convert_animations(old_data['animations'])
    
    # 6. 写入输出文件
    print(f"写入输出文件: {output_file}")
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(new_data, f, ensure_ascii=False, indent=2)
    
    print("转换完成！")
    
    # 输出统计信息
    print(f"\n统计信息:")
    print(f"  骨骼数量: {len(new_data.get('bones', []))}")
    print(f"  插槽数量: {len(new_data.get('slots', []))}")
    print(f"  皮肤数量: {len(new_data.get('skins', []))}")
    print(f"  动画数量: {len(new_data.get('animations', {}))}")


def main():
    """主函数"""
    if len(sys.argv) < 3:
        print("用法: python convert_spine_1.9_to_3.8.py <输入文件> <输出文件> [参考文件]")
        print("\n示例:")
        print("  python convert_spine_1.9_to_3.8.py base_mon_earth_dragon_01.json mon_earth_dragon_01_new.json")
        print("  python convert_spine_1.9_to_3.8.py base_mon_earth_dragon_01.json mon_earth_dragon_01_new.json mon_earth_dragon_01.json")
        return
    
    input_file = Path(sys.argv[1])
    output_file = Path(sys.argv[2])
    reference_file = Path(sys.argv[3]) if len(sys.argv) > 3 else None
    
    if not input_file.exists():
        print(f"错误: 输入文件不存在: {input_file}")
        return
    
    if reference_file and not reference_file.exists():
        print(f"警告: 参考文件不存在: {reference_file}")
        reference_file = None
    
    try:
        convert_spine_1_9_to_3_8(input_file, output_file, reference_file)
    except Exception as e:
        print(f"转换失败: {e}")
        import traceback
        traceback.print_exc()


if __name__ == '__main__':
    main()
